import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCreditCard, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import PageTransition from "../../../components/PageTransition";
import { useState } from "react";
import toast from "react-hot-toast";

const SavedCards = () => {
    const navigate = useNavigate();
    // Mock data for saved cards
    const [cards, setCards] = useState([
        { id: 1, type: 'Visa', number: '•••• •••• •••• 4242', holder: 'John Doe', expiry: '12/24', color: 'from-blue-600 to-blue-800' },
        { id: 2, type: 'Mastercard', number: '•••• •••• •••• 8888', holder: 'John Doe', expiry: '09/25', color: 'from-purple-600 to-purple-800' }
    ]);

    const handleDelete = (id) => {
        setCards(cards.filter(c => c.id !== id));
        toast.success('Card removed successfully');
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
                            onClick={() => toast('Add card feature coming soon!', { icon: '💳' })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative w-full aspect-[1.586] rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${card.color} overflow-hidden group`}
                                >
                                    <div className="absolute top-0 right-0 p-34 opacity-10">
                                        <FiCreditCard className="text-9xl transform rotate-12 -translate-y-1/2 translate-x-1/4" />
                                    </div>

                                    <div className="relative h-full flex flex-col justify-between z-10">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium tracking-wider opacity-80">{card.type}</span>
                                            <button
                                                onClick={() => handleDelete(card.id)}
                                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-colors"
                                            >
                                                <FiTrash2 className="text-white text-sm" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="text-2xl font-mono tracking-widest drop-shadow-md">
                                                {card.number}
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="text-xs opacity-70 uppercase mb-1">Card Holder</div>
                                                    <div className="font-medium tracking-wide">{card.holder}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs opacity-70 uppercase mb-1">Expires</div>
                                                    <div className="font-medium tracking-wide">{card.expiry}</div>
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
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FiCreditCard className="text-2xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No cards saved</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                    Add a credit or debit card to make faster payments.
                                </p>
                                <button
                                    onClick={() => toast('Add card feature coming soon!', { icon: '💳' })}
                                    className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Add a Card
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default SavedCards;
