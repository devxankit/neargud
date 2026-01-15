import { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiUpload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../../store/orderStore';
import toast from 'react-hot-toast';

const ReturnModal = ({ order, isOpen, onClose }) => {
    const { createReturnRequest } = useOrderStore();
    const [selectedItems, setSelectedItems] = useState([]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize selected items if only one item exists
    useEffect(() => {
        if (order && order.items.length === 1) {
            setSelectedItems([{
                itemId: order.items[0]._id || order.items[0].id,
                productId: order.items[0].productId,
                quantity: order.items[0].quantity
            }]);
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const reasons = [
        { value: 'defective', label: 'Item is defective/damaged' },
        { value: 'wrong_item', label: 'Received wrong item' },
        { value: 'wrong_size', label: 'Size doesn\'t fit' },
        { value: 'not_as_described', label: 'Item not as described' },
        { value: 'quality_issue', label: 'Quality not as expected' },
        { value: 'other', label: 'Other reason' },
    ];

    const handleToggleItem = (item) => {
        const itemId = item._id || item.id;
        const isSelected = selectedItems.find(si => si.itemId === itemId);

        if (isSelected) {
            setSelectedItems(selectedItems.filter(si => si.itemId !== itemId));
        } else {
            setSelectedItems([...selectedItems, {
                itemId: itemId,
                productId: item.productId,
                quantity: item.quantity
            }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to return');
            return;
        }
        if (!reason) {
            toast.error('Please select a reason for return');
            return;
        }

        setIsSubmitting(true);
        try {
            await createReturnRequest({
                orderId: order._id || order.id,
                items: selectedItems,
                reason,
                description,
                refundMethod: 'wallet'
            });
            onClose();
            // Optionally refresh order status or navigate
        } catch (error) {
            console.error('Return request failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Return Items</h3>
                            <p className="text-sm text-gray-500">Order #{order.orderCode || order.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="text-xl text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                        <div className="space-y-6">
                            {/* Item Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Select Items to Return
                                </label>
                                <div className="space-y-3">
                                    {order.items.map((item) => {
                                        const itemId = item._id || item.id;
                                        const isSelected = selectedItems.find(si => si.itemId === itemId);

                                        return (
                                            <div
                                                key={itemId}
                                                onClick={() => handleToggleItem(item)}
                                                className={`flex items-center gap-4 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                                                    }`}>
                                                    {isSelected && <FiCheckCircle className="text-white text-xs" />}
                                                </div>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reason Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Reason for Return
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    {reasons.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us more about the issue..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none h-24 resize-none"
                                />
                            </div>

                            {/* Info box */}
                            <div className="p-4 bg-blue-50 rounded-2xl flex items-start gap-4">
                                <FiAlertCircle className="text-blue-500 mt-1 flex-shrink-0" />
                                <div className="text-xs text-blue-700 leading-relaxed">
                                    <p className="font-bold mb-1">Return & Refund Policy</p>
                                    <p>• Returns are usually processed within 2-3 business days.</p>
                                    <p>• Refund will be credited to your <span className="font-bold">Dealing Wallet</span> upon approval.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] px-6 py-3 gradient-green text-white rounded-xl font-bold shadow-lg hover:shadow-glow-green disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Processing...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReturnModal;
