import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload, FiVideo, FiImage } from "react-icons/fi";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { createVendorReel } from "../../services/reelService";
import { getVendorProducts } from "../../services/productService";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import toast from "react-hot-toast";

const AddReel = () => {
  const navigate = useNavigate();
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
  });

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    loadVendorProducts();
    // Cleanup previews on unmount
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  const loadVendorProducts = async () => {
    try {
      const response = await getVendorProducts({ limit: 1000 });
      // Depending on API structure, products might be in data.products or just data
      const prodList = response?.data?.products || response?.data || response;
      if (Array.isArray(prodList)) {
        setVendorProducts(prodList);
      } else if (response?.products && Array.isArray(response.products)) {
        setVendorProducts(response.products);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
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
      setFormData(prev => ({
        ...prev,
        productId: productId,
        productName: "",
        productPrice: ""
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'video') {
        // Basic validation
        if (file.size > 50 * 1024 * 1024) { // 50MB
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

    if (!videoFile) {
      toast.error("Please upload a video file");
      return;
    }

    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("video", videoFile);
      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      data.append("productId", formData.productId);
      data.append("productName", formData.productName);
      data.append("productPrice", formData.productPrice);
      data.append("status", formData.status);
      if (formData.description) data.append("description", formData.description);

      const response = await createVendorReel(data);

      if (response.success) {
        toast.success("Reel created successfully!");
        navigate("/vendor/reels/all-reels");
      }
    } catch (error) {
      console.error("Error adding reel:", error);
      toast.error(error.response?.data?.message || "Failed to add reel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Reel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Showcase your products with engaging video content.</p>
        </div>
        <button
          onClick={() => navigate("/vendor/reels/all-reels")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiX className="text-xl" />
          <span className="font-medium">Cancel</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3 rounded-t-2xl">
              <span className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FiVideo className="text-xl" />
              </span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Reel Details</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <AnimatedSelect
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  options={[
                    { value: "", label: "Select a product to feature" },
                    ...vendorProducts.map((product) => ({
                      value: product._id || product.id,
                      label: `${product.name} - ₹${product.price}`,
                    })),
                  ]}
                  className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
                {/* Selected Product Details Card */}
                {vendorProducts.find(p => (p._id || p.id) === formData.productId) && (() => {
                  const prod = vendorProducts.find(p => (p._id || p.id) === formData.productId);
                  const img = prod.images?.[0] || prod.image || "https://via.placeholder.com/150";
                  return (
                    <div className="mt-4 flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        <img
                          src={img}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{prod.name}</h4>
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">₹{prod.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {prod.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Video Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Video File <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-900 h-40"
                  >
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="hidden"
                    />
                    {videoPreview ? (
                      <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden bg-black">
                        <video src={videoPreview} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">Video Selected</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="text-2xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload video</span>
                        <span className="text-xs text-gray-400 mt-1">MP4, WebM (Max 50MB)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail Image (Optional)
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
                          <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">Change</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FiImage className="text-2xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload cover</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description / Caption
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your reel..."
                  rows="3"
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Publication Status
                </label>
                <AnimatedSelect
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  options={[
                    { value: "draft", label: "Save as Draft" },
                    { value: "active", label: "Publish Immediately" },
                    { value: "archived", label: "Archived" },
                  ]}
                  className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/vendor/reels/all-reels")}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <FiSave />
              {loading ? "Uploading..." : "Publish Reel"}
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Mobile Preview</h3>
            <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800 relative aspect-[9/19] max-w-[300px] mx-auto">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

              {/* Video Content */}
              {(videoPreview || thumbnailPreview || (formData.productId && vendorProducts.find(p => (p._id || p.id) === formData.productId))) ? (
                <div className="relative w-full h-full">
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={thumbnailPreview || (vendorProducts.find(p => (p._id || p.id) === formData.productId)?.images?.[0])}
                    />
                  ) : (
                    <img
                      src={thumbnailPreview || (vendorProducts.find(p => (p._id || p.id) === formData.productId)?.images?.[0]) || "https://via.placeholder.com/300x600?text=No+Preview"}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>

                  {/* Right Actions Bar */}
                  <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <span className="text-xl">❤️</span>
                      </div>
                      <span className="text-white text-xs font-medium">0</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <span className="text-xl">💬</span>
                      </div>
                      <span className="text-white text-xs font-medium">0</span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-16 text-white text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                        {vendor?.storeName?.[0] || 'V'}
                      </div>
                      <span className="font-semibold text-sm shadow-sm">{vendor?.storeName || 'Your Store'}</span>
                    </div>
                    <p className="text-sm line-clamp-2 leading-snug opacity-90">
                      {formData.description || (formData.productName ? `Check out ${formData.productName}!` : 'Description...')}
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
                  <p className="text-xs">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddReel;
