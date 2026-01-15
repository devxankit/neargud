import { useState, useEffect } from "react";
import { FiX, FiPackage, FiTag, FiDollarSign, FiLayers, FiImage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductById } from "../../services/productApi";
import { formatPrice } from "../../utils/helpers";
import toast from "react-hot-toast";

const ViewProductModal = ({ isOpen, onClose, productId }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeImage, setActiveImage] = useState("");

    useEffect(() => {
        if (isOpen && productId) {
            loadProductDetails();
        } else {
            setProduct(null);
        }
    }, [isOpen, productId]);

    const loadProductDetails = async () => {
        setLoading(true);
        try {
            const response = await fetchProductById(productId);
            const productData = response.data?.product || response.product || response;
            setProduct(productData);
            setActiveImage(productData.image || "");
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const DetailRow = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="font-medium text-gray-900 text-sm text-right">{value || '-'}</span>
        </div>
    );

    const StatusBadge = ({ label, isActive }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
            {label}: {isActive ? 'Yes' : 'No'}
        </span>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[10000]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
                                    <p className="text-sm text-gray-500">View complete information for {product?.name}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <FiX className="text-xl text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : product ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Left Column: Media & Quick Stats (4 cols) */}
                                        <div className="lg:col-span-4 space-y-6">
                                            {/* Image Gallery */}
                                            <div className="space-y-4">
                                                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shadow-sm">
                                                    {activeImage ? (
                                                        <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <FiImage className="text-4xl text-gray-300" />
                                                    )}
                                                </div>
                                                {product.images && product.images.length > 0 && (
                                                    <div className="grid grid-cols-4 gap-2">
                                                        <button
                                                            onClick={() => setActiveImage(product.image)}
                                                            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImage === product.image ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100 hover:border-gray-300'}`}
                                                        >
                                                            <img src={product.image} className="w-full h-full object-cover" alt="Main" />
                                                        </button>
                                                        {product.images.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setActiveImage(img)}
                                                                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImage === img ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100 hover:border-gray-300'}`}
                                                            >
                                                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Key Stats Card */}
                                            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 space-y-4">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500 mb-1">Selling Price</p>
                                                    <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            <span className="line-through">{formatPrice(product.originalPrice)}</span>
                                                            <span className="ml-2 text-green-600 font-medium">
                                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                                                        <p className="font-bold text-gray-900 text-lg">{product.stockQuantity}</p>
                                                        <p className={`text-xs font-medium ${product.stock === 'in_stock' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {product.stock?.replace('_', ' ').toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Rating</p>
                                                        <p className="font-bold text-gray-900 text-lg">{product.rating || 0} ⭐</p>
                                                        <p className="text-xs text-gray-400">({product.reviewCount || 0} Reviews)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Detailed Info (8 cols) */}
                                        <div className="lg:col-span-8 space-y-8">

                                            {/* General Info */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <FiPackage /> General Information
                                                </h3>
                                                <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                                    <DetailRow label="Product Name" value={product.name} />
                                                    <DetailRow label="SKU" value={product.sku} />
                                                    <DetailRow label="Category" value={`${product.categoryId?.name || '-'} ${product.subcategoryId ? '> ' + product.subcategoryId.name : ''}`} />
                                                    <DetailRow label="Brand" value={product.brandId?.name} />
                                                    <DetailRow label="Vendor" value={product.vendorName} />
                                                    <DetailRow label="Unit" value={product.unit} />
                                                    <DetailRow label="Weight" value={product.weight ? `${product.weight} kg` : '-'} />
                                                    <DetailRow label="Product Type" value={product.productType} />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-700 leading-relaxed text-sm">
                                                    {product.description || "No description provided."}
                                                </div>
                                            </div>

                                            {/* Specifications & Tax */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                        <FiTag /> Specs & Tax
                                                    </h3>
                                                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
                                                        <DetailRow label="HSN Code" value={product.hsnCode} />
                                                        <DetailRow label="Warranty" value={product.warrantyPeriod} />
                                                        <DetailRow label="Guarantee" value={product.guaranteePeriod} />
                                                        <DetailRow label="Tax Included" value={product.taxIncluded ? "Yes" : "No"} />
                                                        {product.taxRate > 0 && <DetailRow label="Tax Rate" value={`${product.taxRate}%`} />}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                        <FiLayers /> Settings & Flags
                                                    </h3>
                                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <StatusBadge label="Active" isActive={product.isActive} />
                                                            <StatusBadge label="Visible" isActive={product.isVisible} />
                                                            <StatusBadge label="Featured" isActive={product.isFeatured} />
                                                            <StatusBadge label="New" isActive={product.isNew} />
                                                            <StatusBadge label="Trending" isActive={product.isTrending} />
                                                            <StatusBadge label="Flash Sale" isActive={product.flashSale} />
                                                            <StatusBadge label="COD" isActive={product.codAllowed} />
                                                            <StatusBadge label="Returnable" isActive={product.returnable} />
                                                            <StatusBadge label="Cancelable" isActive={product.cancelable} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SEO Info */}
                                            {(product.seoTitle || product.seoDescription) && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-3">SEO Configuration</h3>
                                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-semibold">Meta Title</p>
                                                            <p className="text-gray-900 text-sm font-medium">{product.seoTitle || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-semibold">Meta Description</p>
                                                            <p className="text-gray-700 text-sm">{product.seoDescription || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">Product details not available.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ViewProductModal;
