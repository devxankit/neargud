import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCreditCard, FiPlus, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import PageTransition from "../../../components/PageTransition";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCardStore } from "../../../store/cardStore";
import { useForm } from "react-hook-form";

const SavedCards = () => {
    const navigate = useNavigate();
    const { cards, addCard, deleteCard } = useCardStore();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        // Simple formatting for display
        const formattedNumber = `•••• •••• •••• ${data.cardNumber.slice(-4)}`;
        const cardType = data.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';

        addCard({
            type: cardType,
            number: formattedNumber,
            holder: data.cardHolder,
            expiry: data.expiry,
        });

        toast.success('Card added successfully');
        reset();
        setIsFormOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this card?')) {
            deleteCard(id);
            toast.success('Card removed successfully');
        }
    };

    return (
        <PageTransition>
            <MobileLayout showBottomNav={false} showCartBar={false} showHeader={false}>
                <div className="min-h-screen bg-gray-50 pb-20">
                    {/* Header */}
                    <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiArrowLeft className="text-xl text-gray-600" />
                            </button>
                            <h1 className="text-lg font-bold text-gray-800">Saved Cards</h1>
                        </div>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                        >
                            <FiPlus className="text-xl" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    className={`relative w-full aspect-[1.586] rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${card.color} overflow-hidden group mb-4`}
                                >
                                    <div className="absolute top-0 right-0 p-34 opacity-10">
                                        <FiCreditCard className="text-9xl transform rotate-12 -translate-y-1/2 translate-x-1/4" />
                                    </div>

                                    <div className="relative h-full flex flex-col justify-between z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-bold tracking-wider text-xl">{card.type}</span>
                                                <div className="w-8 h-5 bg-yellow-400/80 rounded-sm mt-1"></div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(card.id)}
                                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <FiTrash2 className="text-white text-sm" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="text-2xl font-mono tracking-[0.2em] drop-shadow-lg flex justify-between">
                                                {card.number.split(' ').map((chunk, i) => (
                                                    <span key={i}>{chunk}</span>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="text-[10px] opacity-70 uppercase tracking-tighter mb-0.5">Card Holder</div>
                                                    <div className="font-medium tracking-wide text-sm">{card.holder}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] opacity-70 uppercase tracking-tighter mb-0.5">Expires</div>
                                                    <div className="font-medium tracking-wide text-sm">{card.expiry}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cards.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <FiCreditCard className="text-3xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No cards saved</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                    Add a credit or debit card for faster and more secure checkouts.
                                </p>
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                                >
                                    Add a Card
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Add Card Modal */}
                <AnimatePresence>
                    {isFormOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                                onClick={() => setIsFormOpen(false)}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-8 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Add New Card</h2>
                                    <button
                                        onClick={() => setIsFormOpen(false)}
                                        className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                                    >
                                        <FiX className="text-xl" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Holder Name</label>
                                        <input
                                            type="text"
                                            {...register('cardHolder', { required: 'Name is required' })}
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none"
                                            placeholder="e.g. JOHN DOE"
                                        />
                                        {errors.cardHolder && <span className="text-xs text-red-500 mt-1 ml-2">{errors.cardHolder.message}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength={16}
                                                {...register('cardNumber', {
                                                    required: 'Card number is required',
                                                    pattern: { value: /^\d{16}$/, message: 'Enter 16 digits' }
                                                })}
                                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none font-mono tracking-widest"
                                                placeholder="0000 0000 0000 0000"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <FiCreditCard size={20} />
                                            </div>
                                        </div>
                                        {errors.cardNumber && <span className="text-xs text-red-500 mt-1 ml-2">{errors.cardNumber.message}</span>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                {...register('expiry', {
                                                    required: 'Required',
                                                    pattern: { value: /^\d{2}\/\d{2}$/, message: 'Use MM/YY' }
                                                })}
                                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-center"
                                            />
                                            {errors.expiry && <span className="text-xs text-red-500 mt-1 ml-2">{errors.expiry.message}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                                            <input
                                                type="password"
                                                placeholder="•••"
                                                maxLength={3}
                                                {...register('cvv', {
                                                    required: 'Required',
                                                    pattern: { value: /^\d{3}$/, message: '3 digits' }
                                                })}
                                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white transition-all outline-none text-center"
                                            />
                                            {errors.cvv && <span className="text-xs text-red-500 mt-1 ml-2">{errors.cvv.message}</span>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-primary-600 text-white rounded-[20px] font-bold text-lg shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                                    >
                                        <FiCheck /> Save Card
                                    </button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </MobileLayout>
        </PageTransition>
    );
};

export default SavedCards;
