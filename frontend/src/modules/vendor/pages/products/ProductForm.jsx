import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiX,
  FiUpload,
  FiArrowLeft,
  FiLoader,
  FiPlus,
  FiLayers,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiTrello
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
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

  const { categories, fetchAdminCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [newAttr, setNewAttr] = useState({ name: "", value: "", group: "" });

  const [formData, setFormData] = useState({
    name: "",
    productType: "physical",
    enableSizes: true,
    mainColor: "",
    unit: "",
    price: "",
    originalPrice: "",
    image: "",
    images: [],
    categoryId: null,
    subcategoryId: null,
    brandId: null,
    stock: "in_stock",
    stockQuantity: "",
    totalAllowedQuantity: "",
    minimumOrderQuantity: "",
    warrantyPeriod: "",
    guaranteePeriod: "",
    hsnCode: "",
    eligibleForCoupon: true,
    flashSale: false,
    isNew: false,
    isFeatured: false,
    isCrazyDeal: false,
    isVisible: true,
    returnable: true,
    cancelable: true,
    taxIncluded: false,
    description: "",
    tags: [],
    applicablePromoCodes: [],
    customAttributes: [],
    colorVariants: [],
    variants: {
      sizes: [],
      colors: [],
      materials: [],
      prices: {},
      defaultVariant: {},
    },
    isTrending: false,
    seoTitle: "",
    seoDescription: "",
    isBuy: true
  });

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name, Category, Price', icon: <FiLayers /> },
    { id: 2, title: 'Attributes', description: 'Tags, Sizes, Details', icon: <FiTrello /> },
    { id: 3, title: 'Variations', description: 'Colors, Size Options', icon: <FiPlus /> },
  ];

  useEffect(() => {
    fetchAdminCategories();
    fetchBrands();
  }, [fetchAdminCategories, fetchBrands]);

  useEffect(() => {
    if (!vendorId) {
      toast.error("Please log in to edit products");
      navigate("/vendor/login");
      return;
    }

    if (isEdit) {
      loadProduct();
    }
  }, [isEdit, id, vendorId]);

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

      setFormData({
        ...product,
        categoryId: product.categoryId?._id || product.categoryId || null,
        subcategoryId: product.subcategoryId?._id || product.subcategoryId || null,
        brandId: product.brandId?._id || product.brandId || null,
        colorVariants: (product.variants?.colorVariants || product.colorVariants || []).map(cv => ({
          ...cv,
          colorName: cv.colorName || cv.color || "",
          thumbnail: cv.thumbnailImage || cv.thumbnail || "",
          sizes: (cv.sizeVariants || cv.sizes || []).map(sv => ({
            ...sv,
            size: sv.size,
            price: sv.price,
            originalPrice: sv.originalPrice,
            stock: sv.stockQuantity !== undefined ? sv.stockQuantity : sv.stock
          }))
        })),
        variants: {
          sizes: product.variants?.sizes || [],
          colors: product.variants?.colors || [],
          materials: product.variants?.materials || [],
          prices: product.variants?.prices || {},
          defaultVariant: product.variants?.defaultVariant || {},
        },
        mainColor: product.mainColor || (product.variants?.colors?.[0] || ""),
        customAttributes: (product.attributes || []).map(attr => ({
          name: attr.name || attr.attributeName || "",
          value: attr.value || (attr.values && attr.values.length > 0 ? attr.values[0].value || attr.values[0] : ""),
          group: attr.group || ""
        }))
      });
    } catch (error) {
      console.error("Load product error:", error);
      toast.error("Failed to load product details");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...results].slice(0, 4),
      }));
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = (e) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    if (tagInput.trim()) {
      const newTags = tagInput.split(',').map(t => t.trim()).filter(t => t && !formData.tags.includes(t));
      setFormData(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddSize = (e) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    if (sizeInput.trim()) {
      const newSizes = sizeInput.split(',').map(s => s.trim()).filter(s => s && !formData.variants.sizes.includes(s));
      setFormData(prev => ({
        ...prev,
        variants: { ...prev.variants, sizes: [...prev.variants.sizes, ...newSizes] }
      }));
      setSizeInput("");
    }
  };

  const handleRemoveSize = (size) => {
    setFormData(prev => ({
      ...prev,
      variants: { ...prev.variants, sizes: prev.variants.sizes.filter(s => s !== size) }
    }));
  };

  const addAttribute = () => {
    if (newAttr.name && newAttr.value) {
      setFormData(prev => ({
        ...prev,
        customAttributes: [...(prev.customAttributes || []), { ...newAttr }]
      }));
      setNewAttr({ name: "", value: "", group: "" });
    }
  };

  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.filter((_, i) => i !== index)
    }));
  };

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colorVariants: [
        ...(prev.colorVariants || []),
        { colorName: "", thumbnail: "", images: [], sizes: [] }
      ]
    }));
  };

  const removeColorVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index)
    }));
  };

  const updateColorVariant = (vIdx, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      newVariants[vIdx] = { ...newVariants[vIdx], [field]: value };
      return { ...prev, colorVariants: newVariants };
    });
  };

  const handleVariantThumbnail = (vIdx, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateColorVariant(vIdx, 'thumbnail', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantImages = (vIdx, e) => {
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
        newVariants[vIdx].images = [...(newVariants[vIdx].images || []), ...results].slice(0, 4);
        return { ...prev, colorVariants: newVariants };
      });
    });
  };

  const addSizeToVariant = (vIdx) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      newVariants[vIdx].sizes.push({
        size: "",
        price: prev.price || "",
        originalPrice: prev.originalPrice || "",
        stock: ""
      });
      return { ...prev, colorVariants: newVariants };
    });
  };

  const bulkAddSizes = (vIdx, sizesStr) => {
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      const existingSizes = (newVariants[vIdx].sizes || []).map(s => s.size);
      const newSizes = sizes
        .filter(s => !existingSizes.includes(s))
        .map(s => ({
          size: s,
          price: prev.price || "",
          originalPrice: prev.originalPrice || "",
          stock: ""
        }));
      newVariants[vIdx].sizes = [...(newVariants[vIdx].sizes || []), ...newSizes];
      return { ...prev, colorVariants: newVariants };
    });
  };

  const updateSizeData = (vIdx, sIdx, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      newVariants[vIdx].sizes[sIdx] = { ...newVariants[vIdx].sizes[sIdx], [field]: value };
      return { ...prev, colorVariants: newVariants };
    });
  };

  const removeSizeVariant = (vIdx, sIdx) => {
    setFormData(prev => {
      const newVariants = [...(prev.colorVariants || [])];
      newVariants[vIdx].sizes = newVariants[vIdx].sizes.filter((_, i) => i !== sIdx);
      return { ...prev, colorVariants: newVariants };
    });
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name) return "Product name is required";
      if (!formData.categoryId) return "Category is required";
      if (!formData.price) return "Price is required";
      if (!formData.mainColor) return "Main product color is required";
      if (!formData.unit) return "Unit is required";
      if (!formData.image) return "Main product image is required";
      if (formData.stockQuantity === "" || formData.stockQuantity === null) return "Stock quantity is required";
      if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.price)) {
        return "Original price must be greater than or equal to the selling price";
      }
      return true;
    }
    if (step === 2) {
      if (!formData.description || formData.description.length < 20) return "Description is required (min 20 characters)";
      return true;
    }
    if (step === 3) {
      if (formData.colorVariants && formData.colorVariants.length > 0) {
        for (let i = 0; i < formData.colorVariants.length; i++) {
          const cv = formData.colorVariants[i];
          if (!cv.colorName) return `Color name is required for Variant ${i + 1}`;
          if (!cv.sizes || cv.sizes.length === 0) return `At least one size variant is required for ${cv.colorName || `Variant ${i + 1}`}`;
          for (let j = 0; j < cv.sizes.length; j++) {
            const sz = cv.sizes[j];
            if (!sz.size) return `Size label is required for ${cv.colorName} - Size ${j + 1}`;
            if (!sz.price) return `Price is required for ${cv.colorName} - ${sz.size}`;
            if (sz.stock === "" || sz.stock === null) return `Stock is required for ${cv.colorName} - ${sz.size}`;
            if (sz.originalPrice && parseFloat(sz.originalPrice) < parseFloat(sz.price)) {
              return `Original price for ${cv.colorName} - ${sz.size} must be greater than or equal to the selling price`;
            }
          }
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (isValid === true) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error(isValid);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const isValid = validateStep(1) && validateStep(2) && validateStep(3);
    if (isValid !== true) {
      toast.error(isValid);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        brandId: formData.brandId || null,
        attributes: formData.customAttributes || [],
        variants: {
          ...formData.variants,
          colorVariants: (formData.colorVariants || []).map(cv => ({
            ...cv,
            colorName: cv.colorName,
            thumbnailImage: cv.thumbnail,
            sizeVariants: (cv.sizes || []).map(s => ({
              size: s.size,
              price: parseFloat(s.price),
              originalPrice: s.originalPrice ? parseFloat(s.originalPrice) : null,
              stockQuantity: parseInt(s.stock)
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

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FiLoader className="animate-spin text-4xl text-primary-600 mb-4" />
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header & Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor/products/manage-products")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowLeft className="text-xl text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-500">Update your product listing details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Step {currentStep} of 3</span>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                className="h-full bg-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Stepper UI */}
        <div className="grid grid-cols-3 gap-4 relative">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center group">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                ${currentStep === step.id ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' :
                  currentStep > step.id ? 'bg-green-500 border-green-500 text-white' :
                    'bg-white border-gray-200 text-gray-400'}
              `}>
                {currentStep > step.id ? <FiCheckCircle /> : step.icon}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="hidden md:block text-[10px] text-gray-500 mt-0.5">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`hidden md:block absolute top-5 left-[60%] w-[80%] h-[2px] -z-0 transition-colors duration-300
                  ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-100'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <form onSubmit={(e) => e.preventDefault()} className="p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Product Configuration */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">Active</span>
                    <h3 className="text-sm font-bold text-blue-900">Product Configuration</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                        Product Type <span className="text-red-500">*</span>
                      </label>
                      <AnimatedSelect
                        name="productType"
                        value={formData.productType}
                        onChange={handleChange}
                        options={[
                          { value: 'physical', label: 'Standard Product (Physical)' },
                          { value: 'digital', label: 'Digital Product' },
                          { value: 'service', label: 'Non Physical Product' },
                        ]}
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            name="enableSizes"
                            checked={formData.enableSizes}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable Sizes</span>
                          <p className="text-[10px] text-gray-500">Uncheck if this product doesn't have size attributes</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <AnimatedSelect
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="Select Unit"
                        options={[
                          { value: 'piece', label: 'Piece' },
                          { value: 'kg', label: 'Kilogram' },
                          { value: 'gram', label: 'Gram' },
                          { value: 'pair', label: 'Pair' },
                          { value: 'set', label: 'Set' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Main Product Color <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="mainColor"
                          value={formData.mainColor}
                          onChange={handleChange}
                          placeholder="Enter color name..."
                          className="w-full pl-4 pr-32 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer hover:text-primary-600 transition-colors">
                          <input
                            type="color"
                            value={/^#[0-9A-F]{6}$/i.test(formData.mainColor) ? formData.mainColor : "#000000"}
                            onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: formData.mainColor ? formData.mainColor.toLowerCase() : 'transparent' }}></span>
                          <span>Select Color</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <CategorySelector
                        value={formData.categoryId}
                        subcategoryId={formData.subcategoryId}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                      <AnimatedSelect
                        name="brandId"
                        value={formData.brandId || ""}
                        onChange={handleChange}
                        placeholder="Select Brand"
                        options={[
                          { value: "", label: "No Brand" },
                          ...brands
                            .filter((brand) => brand.isActive !== false)
                            .map((brand) => ({ value: String(brand._id || brand.id), label: brand.name })),
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Original Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Product Media</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Main Image <span className="text-red-500">*</span></label>
                      <div className="relative group aspect-[4/3] max-w-[320px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-all">
                        {formData.image ? (
                          <>
                            <img src={formData.image} className="w-full h-full object-cover" alt="Main" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-xs font-bold">Change Image</div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <FiUpload className="text-xl text-primary-600 mb-3" />
                            <p className="text-sm font-bold text-gray-700">Upload Main Image</p>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Gallery Images</label>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeGalleryImage(idx) }}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        ))}
                        {formData.images.length < 4 && (
                          <label className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-all">
                            <FiPlus className="text-gray-400" />
                            <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Status</label>
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
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Description <span className="text-red-500">*</span></h3>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Custom Attributes */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Custom Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Attribute Name</label>
                      <input type="text" placeholder="e.g. Material" value={newAttr.name} onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Value</label>
                      <input type="text" placeholder="e.g. 100% Cotton" value={newAttr.value} onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Group</label>
                      <input type="text" placeholder="e.g. Technical Specs" value={newAttr.group} onChange={(e) => setNewAttr({ ...newAttr, group: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end mb-8">
                    <button type="button" onClick={addAttribute} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-sm shadow-primary-100"><FiPlus size={18} /> Add Attribute</button>
                  </div>
                  <div className="space-y-3">
                    {formData.customAttributes.map((attr, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary-200 transition-all group">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[100px]">{attr.name}</span>
                            <span className="text-sm font-semibold text-gray-700">{attr.value}</span>
                          </div>
                          {attr.group && (
                            <span className="text-[10px] text-primary-500 font-medium mt-0.5 ml-[100px]">Group: {attr.group}</span>
                          )}
                        </div>
                        <button type="button" onClick={() => removeAttribute(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><FiTrash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sizes</h3>
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={handleAddSize} className="flex-1 px-4 py-2 bg-gray-50 rounded-xl" placeholder="Add size..." />
                      <button type="button" onClick={() => handleAddSize()} className="bg-primary-600 text-white px-4 rounded-xl"><FiPlus /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.variants.sizes.map(sz => (
                        <span key={sz} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold flex items-center gap-2">
                          {sz} <FiX className="cursor-pointer" onClick={() => handleRemoveSize(sz)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="flex-1 px-4 py-2 bg-gray-50 rounded-xl" placeholder="Add tag..." />
                      <button type="button" onClick={() => handleAddTag()} className="bg-gray-600 text-white px-4 rounded-xl"><FiPlus /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-2">
                          {t} <FiX className="cursor-pointer" onClick={() => handleRemoveTag(t)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { id: 'flashSale', label: 'Flash Sale', icon: '⚡' },
                    { id: 'isNew', label: 'New', icon: '✨' },
                    { id: 'isTrending', label: 'Trending', icon: '🔥' },
                    { id: 'isFeatured', label: 'Featured', icon: '⭐' },
                    { id: 'isCrazyDeal', label: 'Crazy', icon: '🤪' },
                    { id: 'isVisible', label: 'Visible', icon: '👁️' },
                    { id: 'isBuy', label: 'Buy/Cart', icon: '🛒' },
                  ].map(opt => (
                    <label key={opt.id} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${formData[opt.id] ? 'border-primary-500 bg-primary-50' : 'border-gray-50 bg-gray-50'}`}>
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                      <input type="checkbox" name={opt.id} checked={formData[opt.id]} onChange={handleChange} className="sr-only" />
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary-900 mb-1">Product Variations</h3>
                    <p className="text-xs text-primary-600 font-medium">Add color options with size variants.</p>
                  </div>
                  <button type="button" onClick={addColorVariant} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold"><FiPlus /> Add Variant</button>
                </div>

                <div className="space-y-8">
                  {(formData.colorVariants || []).map((variant, vIdx) => (
                    <div key={vIdx} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                      <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">{vIdx + 1}</div>
                          <h4 className="font-bold text-gray-900">Color Variant {vIdx + 1}</h4>
                        </div>
                        <button type="button" onClick={() => removeColorVariant(vIdx)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><FiTrash2 size={18} /></button>
                      </div>
                      <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <input
                              type="text"
                              placeholder="Color Name *"
                              value={variant.colorName}
                              onChange={(e) => updateColorVariant(vIdx, 'colorName', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-semibold transition-all"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary-400 transition-all overflow-hidden relative group">
                                {variant.thumbnail ? (
                                  <>
                                    <img src={variant.thumbnail} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Change</div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center text-gray-400">
                                    <FiUpload size={24} />
                                    <span className="text-[10px] uppercase font-bold mt-2">Thumbnail</span>
                                  </div>
                                )}
                                <input type="file" onChange={(e) => handleVariantThumbnail(vIdx, e)} className="hidden" />
                              </label>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-sm font-bold text-gray-700">Size Variants</h5>
                              <button type="button" onClick={() => addSizeToVariant(vIdx)} className="text-xs font-bold text-primary-600 flex items-center gap-1"><FiPlus /> Add Size</button>
                            </div>
                            <div className="mb-4">
                              <input
                                type="text"
                                placeholder="Bulk add sizes (e.g. S, M, L) and press Enter"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    bulkAddSizes(vIdx, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full px-4 py-2 border rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                              {(variant.sizes || []).map((sz, sIdx) => (
                                <div key={sIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group/size animate-in fade-in">
                                  <button type="button" onClick={() => removeSizeVariant(vIdx, sIdx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/size:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"><FiX size={12} /></button>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Size *</label>
                                      <input type="text" placeholder="e.g. S, M, XL" value={sz.size} onChange={(e) => updateSizeData(vIdx, sIdx, 'size', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all focus:bg-white focus:ring-2 focus:ring-primary-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Stock *</label>
                                      <input type="number" placeholder="0" value={sz.stock} onChange={(e) => updateSizeData(vIdx, sIdx, 'stock', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all focus:bg-white focus:ring-2 focus:ring-primary-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sale Price *</label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                        <input type="number" placeholder="0.00" value={sz.price} onChange={(e) => updateSizeData(vIdx, sIdx, 'price', e.target.value)} className="w-full pl-5 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all focus:bg-white focus:ring-2 focus:ring-primary-500/20" />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">MRP / Original</label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                        <input type="number" placeholder="0.00" value={sz.originalPrice || ""} onChange={(e) => updateSizeData(vIdx, sIdx, 'originalPrice', e.target.value)} className="w-full pl-5 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all focus:bg-white focus:ring-2 focus:ring-primary-500/20" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!formData.colorVariants || formData.colorVariants.length === 0) && (
                    <div className="py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center text-center px-6">
                      <FiLayers className="text-3xl text-gray-300 mb-6" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">No Variations</h4>
                      <button type="button" onClick={addColorVariant} className="flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold transition-all hover:bg-primary-700 shadow-lg shadow-primary-200"><FiPlus /> Start Adding Variations</button>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-gray-100 flex gap-4">
                  <label className="flex-1 flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2 border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200">
                    <input type="checkbox" name="returnable" checked={formData.returnable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Returnable</p>
                      <p className="text-[10px] text-gray-500">Allow customer returns</p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2 border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200">
                    <input type="checkbox" name="cancelable" checked={formData.cancelable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Cancelable</p>
                      <p className="text-[10px] text-gray-500">Allow order cancellation</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? () => navigate("/vendor/products/manage-products") : handleBack}
            className="flex items-center gap-2 px-6 py-2.5 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : <><FiChevronLeft /> Back</>}
          </button>

          <button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={loading}
            className={`
              flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all
              ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200'}
            `}
          >
            {currentStep === 3 ? (
              <>{loading ? 'Saving...' : 'Save Changes'} <FiSave /></>
            ) : (
              <>Next Step <FiChevronRight /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
