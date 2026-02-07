import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiX, FiUpload, FiArrowLeft, FiLoader, FiPlus, FiLayers, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useCategoryStore } from "../../../../store/categoryStore";
import { useBrandStore } from "../../../../store/brandStore";
import CategorySelector from "../../../../components/Admin/CategorySelector";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import toast from "react-hot-toast";
import { getVendorProductById, updateVendorProduct } from "../../services/productService";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const isEdit = id && id !== "new";

  const vendorId = vendor?._id || vendor?.id;
  const vendorName = vendor?.storeName || vendor?.name || "Vendor";

  const { categories, fetchAdminCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    price: "",
    originalPrice: "",
    image: "",
    images: [],
    categoryId: null,
    subcategoryId: null,
    subSubCategoryId: null,
    brandId: null,
    stock: "in_stock",
    stockQuantity: "",
    totalAllowedQuantity: "",
    minimumOrderQuantity: "",
    warrantyPeriod: "",
    guaranteePeriod: "",
    hsnCode: "",
    flashSale: false,
    isNew: false,
    isTrending: false,
    isFeatured: false,
    isVisible: true,
    codAllowed: true,
    returnable: true,
    cancelable: true,
    taxIncluded: false,
    description: "",
    tags: [],
    colorVariants: [],
    variants: {
      sizes: [],
      colors: [],
      materials: [],
      prices: {},
      defaultVariant: {},
    },
    seoTitle: "",
    seoDescription: "",
    relatedProducts: [],
    isBuy: true,
  });

  useEffect(() => {
    fetchAdminCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!vendorId) {
      toast.error("Please log in to edit products");
      navigate("/vendor/login");
      return;
    }

    if (isEdit) {
      loadProduct();
    }
  }, [isEdit, id, vendorId, navigate]);

  const loadProduct = async () => {
    setFetching(true);
    try {
      const response = await getVendorProductById(id);
      const product = response.data?.product || response.product || response;

      if (!product) {
        toast.error("Product not found");
        navigate("/vendor/products/manage-products");
        return;
      }

      // Extract category IDs from product
      const categoryId = product.categoryId?._id || product.categoryId;
      const subcategoryId = product.subcategoryId?._id || product.subcategoryId;
      const subSubCategoryId = product.subSubCategoryId?._id || product.subSubCategoryId;
      const brandId = product.brandId?._id || product.brandId;

      setFormData({
        name: product.name || "",
        unit: product.unit || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        image: product.image || "",
        images: product.images || [],
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        subSubCategoryId: subSubCategoryId || null,
        brandId: brandId || null,
        stock: product.stock || "in_stock",
        stockQuantity: product.stockQuantity || "",
        totalAllowedQuantity: product.totalAllowedQuantity || "",
        minimumOrderQuantity: product.minimumOrderQuantity || "",
        warrantyPeriod: product.warrantyPeriod || "",
        guaranteePeriod: product.guaranteePeriod || "",
        hsnCode: product.hsnCode || "",
        flashSale: product.flashSale || false,
        isNew: product.isNew || false,
        isTrending: product.isTrending || false,
        isFeatured: product.isFeatured || false,
        isVisible: product.isVisible !== undefined ? product.isVisible : true,
        codAllowed: product.codAllowed !== undefined ? product.codAllowed : true,
        returnable: product.returnable !== undefined ? product.returnable : true,
        cancelable: product.cancelable !== undefined ? product.cancelable : true,
        taxIncluded: product.taxIncluded || false,
        description: product.description || "",
        tags: product.tags || [],
        colorVariants: product.variants?.colorVariants || product.colorVariants || [],
        variants: {
          sizes: product.variants?.sizes || product.sizes || [],
          colors: product.variants?.colors || [],
          materials: product.variants?.materials || [],
          prices: product.variants?.prices || {},
          defaultVariant: product.variants?.defaultVariant || {},
        },
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        relatedProducts: product.relatedProducts || [],
        isBuy: product.isBuy !== undefined ? product.isBuy : true,
      });
    } catch (error) {
      console.error("Load product error:", error);
      toast.error(error.response?.data?.message || "Failed to load product");
      navigate("/vendor/products/manage-products");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
        });
      };
      reader.onerror = () => {
        toast.error("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} size should be less than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const readers = validFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setFormData({
          ...formData,
          images: [...formData.images, ...results],
        });
        toast.success(`${validFiles.length} image(s) added to gallery`);
      })
      .catch(() => {
        toast.error("Error reading image files");
      });
  };

  const removeGalleryImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colorVariants: [
        ...(prev.colorVariants || []),
        {
          color: "",
          thumbnail: "",
          images: [],
          sizes: []
        }
      ]
    }));
  };

  const removeColorVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index)
    }));
  };

  const updateColorVariant = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, colorVariants: newVariants };
    });
  };

  const handleVariantThumbnail = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateColorVariant(index, 'thumbnail', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantImages = (index, e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setFormData(prev => {
        const newVariants = [...(prev.colorVariants || [])];
        newVariants[index] = {
          ...newVariants[index],
          images: [...(newVariants[index].images || []), ...results]
        };
        return { ...prev, colorVariants: newVariants };
      });
    });
  };

  const addSizeToVariant = (index) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      if (!newVariants[index].sizes) newVariants[index].sizes = [];
      newVariants[index].sizes.push({
        size: "",
        price: prev.price || "",
        originalPrice: prev.originalPrice || "",
        stock: ""
      });
      return { ...prev, colorVariants: newVariants };
    });
  };

  const bulkAddSizes = (index, sizesStr) => {
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      if (!newVariants[index].sizes) newVariants[index].sizes = [];
      const existingSizes = newVariants[index].sizes.map(s => s.size);
      const newSizes = sizes
        .filter(s => !existingSizes.includes(s))
        .map(s => ({
          size: s,
          price: prev.price || "",
          originalPrice: prev.originalPrice || "",
          stock: ""
        }));
      newVariants[index].sizes = [...newVariants[index].sizes, ...newSizes];
      return { ...prev, colorVariants: newVariants };
    });
  };

  const updateSizeData = (vIdx, sIdx, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      if (!newVariants[vIdx].sizes) newVariants[vIdx].sizes = [];
      newVariants[vIdx].sizes[sIdx] = {
        ...newVariants[vIdx].sizes[sIdx],
        [field]: value
      };
      return { ...prev, colorVariants: newVariants };
    });
  };

  const removeSizeVariant = (vIdx, sIdx) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      if (!newVariants[vIdx].sizes) return prev;
      newVariants[vIdx].sizes = newVariants[vIdx].sizes.filter((_, i) => i !== sIdx);
      return { ...prev, colorVariants: newVariants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId) {
      toast.error("Please log in to save products");
      return;
    }

    // Validation
    if (!formData.name || !formData.price || !formData.stockQuantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        totalAllowedQuantity: formData.totalAllowedQuantity ? parseInt(formData.totalAllowedQuantity) : null,
        minimumOrderQuantity: formData.minimumOrderQuantity ? parseInt(formData.minimumOrderQuantity) : null,
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        subSubCategoryId: formData.subSubCategoryId || null,
        brandId: formData.brandId || null,
        variants: {
          ...formData.variants,
          colorVariants: (formData.colorVariants || []).map(cv => ({
            ...cv,
            sizes: (cv.sizes || []).map(s => ({
              ...s,
              price: parseFloat(s.price),
              originalPrice: s.originalPrice ? parseFloat(s.originalPrice) : null,
              stock: parseInt(s.stock)
            }))
          }))
        }
      };

      await updateVendorProduct(id, payload);
      toast.success("Product updated successfully");
      navigate("/vendor/products/manage-products");
    } catch (error) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to manage products</p>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FiLoader className="animate-spin text-4xl text-primary-600 mb-4" />
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate("/vendor/products/manage-products")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="text-xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? "Update your product details" : "Create a new product listing"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Unit
              </label>
              <AnimatedSelect
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Select Unit"
                options={[
                  { value: '', label: 'Select Unit' },
                  { value: 'piece', label: 'Piece' },
                  { value: 'kg', label: 'Kilogram' },
                  { value: 'gram', label: 'Gram' },
                  { value: 'pair', label: 'Pair' },
                  { value: 'set', label: 'Set' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <CategorySelector
                value={formData.categoryId}
                subcategoryId={formData.subcategoryId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Brand
              </label>
              <AnimatedSelect
                name="brandId"
                value={formData.brandId || ""}
                onChange={handleChange}
                placeholder="Select Brand"
                options={[
                  { value: "", label: "No Brand" },
                  ...brands
                    .filter((brand) => brand.isActive !== false)
                    .map((brand) => ({ value: brand._id || brand.id, label: brand.name })),
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                placeholder="Enter product description..."
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Original Price (for discount)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Media */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 sm:p-5 border-2 border-primary-200">
          <h2 className="text-base font-bold text-primary-800 mb-4 flex items-center gap-2">
            <FiUpload className="text-lg" />
            Product Media
          </h2>

          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl p-4 border border-primary-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Main Image
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Main Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="main-image-upload"
                  />
                  <label
                    htmlFor="main-image-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-primary-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors bg-white">
                    <FiUpload className="text-base text-primary-600" />
                    <span className="text-xs font-medium text-gray-700">
                      {formData.image
                        ? "Change Main Image"
                        : "Choose Main Image"}
                    </span>
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-3 flex items-start gap-4">
                    <img
                      src={formData.image}
                      alt="Main Preview"
                      className="w-28 h-28 object-cover rounded-xl border-2 border-primary-300 shadow-md"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="mt-2 px-4 py-2 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium">
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Product Gallery */}
            <div className="bg-white rounded-xl p-4 border border-primary-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Product Gallery
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Gallery Images (Multiple)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-primary-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors bg-white">
                    <FiUpload className="text-base text-primary-600" />
                    <span className="text-xs font-medium text-gray-700">
                      Choose Gallery Images
                    </span>
                  </label>
                </div>
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border-2 border-primary-300 shadow-md"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove image">
                            <FiX className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {formData.images.length} image(s) in gallery
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Stock Status
              </label>
              <AnimatedSelect
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                options={[
                  { value: 'in_stock', label: 'In Stock' },
                  { value: 'low_stock', label: 'Low Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Total Allowed Quantity
              </label>
              <input
                type="number"
                name="totalAllowedQuantity"
                value={formData.totalAllowedQuantity}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Max per order"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                name="minimumOrderQuantity"
                value={formData.minimumOrderQuantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Min per order"
              />
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            Product Variants
          </h2>
          <div className="space-y-6">
            <div className="bg-primary-50 p-4 sm:p-6 rounded-2xl border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-primary-900 mb-1">Color & Size Variations</h3>
                <p className="text-xs text-primary-600 font-medium">Manage color options, images, and size-specific stock.</p>
              </div>
              <button
                type="button"
                onClick={addColorVariant}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-primary-700 transition-all shadow-md hover:shadow-lg shadow-primary-200"
              >
                <FiPlus /> Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {formData.colorVariants && formData.colorVariants.map((variant, vIdx) => (
                <div key={vIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                        {vIdx + 1}
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">Variant {vIdx + 1}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColorVariant(vIdx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Color & Images */}
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Color Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Red, Blue..."
                            value={variant.color}
                            onChange={(e) => updateColorVariant(vIdx, 'color', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Thumbnail</label>
                            <div className="relative group">
                              {variant.thumbnail ? (
                                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary-100">
                                  <img src={variant.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                                  <button
                                    type="button"
                                    onClick={() => updateColorVariant(vIdx, 'thumbnail', '')}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <FiX size={12} />
                                  </button>
                                </div>
                              ) : (
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                                  <FiUpload className="text-xl text-gray-400 mb-1" />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Upload</span>
                                  <input type="file" accept="image/*" onChange={(e) => handleVariantThumbnail(vIdx, e)} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Images</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(variant.images || []).slice(0, 3).map((img, iIdx) => (
                                <div key={iIdx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                  <img src={img} className="w-full h-full object-cover" alt={`Var ${iIdx}`} />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImgs = [...variant.images];
                                      newImgs.splice(iIdx, 1);
                                      updateColorVariant(vIdx, 'images', newImgs);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100"
                                  >
                                    <FiX size={10} />
                                  </button>
                                </div>
                              ))}
                              {(!variant.images || variant.images.length < 4) && (
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                                  <FiPlus className="text-gray-400" />
                                  <input type="file" multiple accept="image/*" onChange={(e) => handleVariantImages(vIdx, e)} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Sizes */}
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-bold text-gray-700">Size Variants</h5>
                          <button
                            type="button"
                            onClick={() => addSizeToVariant(vIdx)}
                            className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-white px-2 py-1 rounded border border-primary-100 shadow-sm"
                          >
                            <FiPlus /> Add Size
                          </button>
                        </div>

                        <div className="mb-3">
                          <input
                            type="text"
                            placeholder="Bulk add (e.g. S, M, L)... Press Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                bulkAddSizes(vIdx, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none text-xs"
                          />
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 space-y-3 custom-scrollbar">
                          {variant.sizes && variant.sizes.length > 0 ? (
                            variant.sizes.map((sz, sIdx) => (
                              <div key={sIdx} className="bg-white p-3 rounded-xl border border-gray-200 relative group">
                                <button
                                  type="button"
                                  onClick={() => removeSizeVariant(vIdx, sIdx)}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm"
                                >
                                  <FiX size={10} />
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-0.5">Size</label>
                                    <input
                                      type="text"
                                      value={sz.size}
                                      onChange={(e) => updateSizeData(vIdx, sIdx, 'size', e.target.value)}
                                      className="w-full px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-0.5">Stock</label>
                                    <input
                                      type="number"
                                      value={sz.stock}
                                      onChange={(e) => updateSizeData(vIdx, sIdx, 'stock', e.target.value)}
                                      className="w-full px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-0.5">Price</label>
                                    <input
                                      type="number"
                                      value={sz.price}
                                      onChange={(e) => updateSizeData(vIdx, sIdx, 'price', e.target.value)}
                                      className="w-full px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-0.5">Orig. Price</label>
                                    <input
                                      type="number"
                                      value={sz.originalPrice}
                                      onChange={(e) => updateSizeData(vIdx, sIdx, 'originalPrice', e.target.value)}
                                      className="w-full px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-[10px] text-gray-400">No sizes added yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}


            </div>
          </div>
        </div>



        {/* Tags */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">Tags</h2>
          <div>
            <input
              type="text"
              value={(formData.tags || []).join(", ")}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t);
                setFormData({ ...formData, tags });
              }}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Separate tags with commas
            </p>
          </div>
        </div>

        {/* Options */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            Product Options
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="flashSale"
                checked={formData.flashSale}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Flash Sale
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                New Arrival
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Trending
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Featured
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Visible
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="isBuy"
                checked={formData.isBuy}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Enable Buy/Cart
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="codAllowed"
                checked={formData.codAllowed}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                COD Allowed
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="returnable"
                checked={formData.returnable}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Returnable
              </span>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="cancelable"
                checked={formData.cancelable}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-gray-700">
                Cancelable
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/vendor/products/manage-products")}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 gradient-green text-white rounded-xl hover:shadow-glow-green transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                {isEdit ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
