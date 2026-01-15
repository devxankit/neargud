import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiX, FiUpload, FiVideo, FiImage } from "react-icons/fi";
import { motion } from "framer-motion";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { getVendorReelById, updateVendorReel } from "../../services/reelService";
import { getVendorProducts } from "../../services/productService";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import toast from "react-hot-toast";

const EditReel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const [loading, setLoading] = useState(false);
  const [vendorProducts, setVendorProducts] = useState([]);

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  // Preview states
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    productPrice: "",
    status: "draft",
    description: "",
    likes: 0,
    comments: 0,
    shares: 0,
  });

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    loadData();
    // Cleanup previews on unmount (only if blob url)
    return () => {
      if (videoPreview && videoPreview.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [id, vendor?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products
      const prodResponse = await getVendorProducts({ limit: 1000 });
      const prodList = prodResponse?.data?.products || prodResponse?.data || prodResponse;
      if (Array.isArray(prodList)) setVendorProducts(prodList);
      else if (prodResponse?.products) setVendorProducts(prodResponse.products);

      // Load Reel
      if (id) {
        const reelResponse = await getVendorReelById(id);
        const reel = reelResponse?.data?.reel || reelResponse?.data || reelResponse;
        
        if (reel) {
          setFormData({
            productId: reel.productId?._id || reel.productId?.id || reel.productId || "",
            productName: reel.productName || "",
            productPrice: reel.productPrice || "",
            status: reel.status || "draft",
            description: reel.description || "",
            likes: reel.likes || 0,
            comments: reel.comments || 0,
            shares: reel.shares || 0,
          });
          setVideoPreview(reel.videoUrl || "");
          setThumbnailPreview(reel.thumbnail || "");
        }
      }
    } catch (error) {
       console.error("Error loading data", error);
       toast.error("Failed to load reel data");
       navigate("/vendor/reels/all-reels");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId) => {
    const product = vendorProducts.find((p) => (p._id || p.id) === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: productId,
        productName: product.name,
        productPrice: product.price
      }));
    } else {
       setFormData(prev => ({ ...prev, productId: productId }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'video') {
         if (file.size > 50 * 1024 * 1024) { 
             toast.error("Video file is too large (Max 50MB)");
             return;
         }
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoPreview(url);
      } else if (type === 'thumbnail') {
        const url = URL.createObjectURL(file);
        setThumbnailFile(file);
        setThumbnailPreview(url);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      if (videoFile) data.append("video", videoFile);
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      
      data.append("productId", formData.productId);
      data.append("productName", formData.productName);
      data.append("productPrice", formData.productPrice);
      data.append("status", formData.status);
      if (formData.description) data.append("description", formData.description);
      
      // Preserve engagement stats if editable
      data.append("likes", formData.likes);
      data.append("comments", formData.comments);
      data.append("shares", formData.shares);
      
      if (!videoFile && videoPreview && !videoPreview.startsWith('blob:')) {
           data.append("videoUrl", videoPreview);
      }
      if (!thumbnailFile && thumbnailPreview && !thumbnailPreview.startsWith('blob:')) {
           data.append("thumbnail", thumbnailPreview);
      }

      await updateVendorReel(id, data);
      toast.success("Reel updated successfully!");
      navigate("/vendor/reels/all-reels");
    } catch (error) {
      console.error("Error updating reel:", error);
      toast.error("Failed to update reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6 max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Edit Reel
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update reel information and content
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/reels/all-reels")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiX className="text-xl text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* Product Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Product <span className="text-red-500">*</span>
                </label>
                <AnimatedSelect
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                options={[
                    { value: "", label: "Select a product" },
                    ...vendorProducts.map((product) => ({
                    value: product._id || product.id,
                    label: `${product.name} - ₹${product.price}`,
                    })),
                ]}
                />
            </div>

            {/* Video File */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Video content
                  </label>
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-900 h-40"
                  >
                     <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'video')}
                        className="hidden"
                     />
                     {videoPreview ? (
                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden bg-black">
                            <video src={videoPreview} className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                                     {videoFile ? 'New Video Selected' : 'Change Video'}
                                </span>
                            </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center">
                            <FiUpload className="text-2xl text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Video</span>
                        </div>
                     )}
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail
                  </label>
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-900 h-40"
                  >
                     <input
                        type="file"
                        ref={thumbnailInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'thumbnail')}
                        className="hidden"
                     />
                     {thumbnailPreview ? (
                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
                            <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                                    {thumbnailFile ? 'New Image Selected' : 'Change Image'}
                                </span>
                            </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center">
                            <FiImage className="text-2xl text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Cover</span>
                        </div>
                     )}
                  </div>
                </div>
            </div>

            {/* Description */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
                </label>
                <AnimatedSelect
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "archived", label: "Archived" },
                ]}
                />
            </div>

            {/* Engagement Stats (Optional View/Edit) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Likes included (Seed)
                </label>
                <input
                    type="number"
                    value={formData.likes}
                    onChange={(e) => setFormData(p => ({...p, likes: e.target.value}))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
                </div>
                 <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comments
                </label>
                <input
                    type="number"
                    value={formData.comments}
                    onChange={(e) => setFormData(p => ({...p, comments: e.target.value}))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
                </div>
                 <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shares
                </label>
                <input
                    type="number"
                    value={formData.shares}
                    onChange={(e) => setFormData(p => ({...p, shares: e.target.value}))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
                </div>
            </div>
            </div>

            <div className="flex items-center justify-end gap-4">
            <button
                type="button"
                onClick={() => navigate("/vendor/reels/all-reels")}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <FiSave className="text-lg" />
                {loading ? "Updating..." : "Update Reel"}
            </button>
            </div>
         </div>

         {/* Preview Column */}
          <div className="lg:col-span-4">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Mobile Preview</h3>
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800 relative aspect-[9/19] max-w-[300px] mx-auto">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

              {/* Video Content */}
              {videoPreview || thumbnailPreview ? (
                <div className="relative w-full h-full">
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      // controls // Optional
                    />
                  ) : (
                    <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>

                  {/* Right Actions Bar */}
                  <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <span className="text-xl">❤️</span>
                      </div>
                      <span className="text-white text-xs font-medium">{formData.likes}</span>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <span className="text-xl">💬</span>
                      </div>
                      <span className="text-white text-xs font-medium">{formData.comments}</span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-16 text-white text-left">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                        {vendor?.storeName?.[0] || 'V'}
                      </div>
                      <span className="font-semibold text-sm shadow-sm">{vendor?.storeName || 'Store'}</span>
                    </div>
                    <p className="text-sm line-clamp-2 leading-snug opacity-90">
                      {formData.description || (formData.productName ? `Check out ${formData.productName}!` : '...')}
                    </p>
                    {formData.productPrice && (
                      <div className="mt-2 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                        ₹ {formData.productPrice}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                  <FiVideo className="text-4xl mb-2 opacity-50" />
                  <p className="text-xs">Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default EditReel;
