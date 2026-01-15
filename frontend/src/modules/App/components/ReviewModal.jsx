import { useState, useEffect } from 'react';
import { FiStar, FiX, FiCamera, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewsStore } from '../../../store/reviewsStore';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, product, orderId }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addReview } = useReviewsStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await addReview({
                productId: product._id || product.id,
                orderId,
                rating,
                review: comment,
                images
            });
            onClose();
            setComment('');
            setRating(5);
        } catch (error) {
            // Error handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Rate Product</h2>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Share your experience</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Product Summary */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 rounded-2xl object-cover border border-white shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-800 truncate uppercase text-sm tracking-tight">{product.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.unit || '1 Unit'}</p>
                                </div>
                            </div>

                            {/* Rating Selector */}
                            <div className="text-center">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Overall Rating</label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform active:scale-90"
                                        >
                                            <FiStar
                                                size={40}
                                                className={`${star <= (hoverRating || rating)
                                                    ? 'text-orange-400 fill-orange-400'
                                                    : 'text-slate-200'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-orange-500 font-black text-xs uppercase tracking-widest mt-3 h-4">
                                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : rating === 1 ? 'Poor' : ''}
                                </p>
                            </div>

                            {/* Review Text */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block">Your Review</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike? How was the quality?"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/20 transition-all min-h-[120px] resize-none text-sm"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0}
                                className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all active:scale-[0.98] shadow-xl ${isSubmitting || rating === 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary-600 text-white shadow-primary-200'
                                    }`}
                            >
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
