import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiUpload,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiInfo,
  FiLayers,
  FiPlus,
  FiShoppingBag,
  FiTrello,
  FiCheckCircle,
  FiTrash2
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useCategoryStore } from "../../../../store/categoryStore";
import { useBrandStore } from "../../../../store/brandStore";
import { usePromoCodeStore } from "../../../../store/promoCodeStore";
import CategorySelector from "../../../../components/Admin/CategorySelector";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import toast from "react-hot-toast";
import { createVendorProduct } from "../../services/productService";

const AddProduct = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const { categories, fetchAdminCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();
  const { promoCodes, fetchPromoCodes } = usePromoCodeStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const vendorId = vendor?._id || vendor?.id;
  const vendorName = vendor?.storeName || vendor?.name || "Vendor";

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

  const [newAttr, setNewAttr] = useState({ name: "", value: "", group: "" });
  const [sizeInput, setSizeInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchAdminCategories();
    fetchBrands();
    fetchPromoCodes();
  }, [fetchAdminCategories, fetchBrands, fetchPromoCodes]);

  useEffect(() => {
    if (!vendorId) {
      toast.error("Please log in to add products");
      navigate("/vendor/login");
    }
  }, [vendorId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
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
        images: [...prev.images, ...results],
      }));
    });
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
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
        newVariants[vIdx].images = [...(newVariants[vIdx].images || []), ...results];
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
      if (formData.colorVariants.length > 0) {
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
        brandId: formData.brandId || null,
        vendorId: vendorId,
        vendorName: vendorName,
        applicableCoupons: formData.applicablePromoCodes,
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

      await createVendorProduct(payload);
      toast.success("Product created successfully");
      navigate("/vendor/products/manage-products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name, Category, Price', icon: <FiLayers /> },
    { id: 2, title: 'Attributes', description: 'Tags, Sizes, Details', icon: <FiTrello /> },
    { id: 3, title: 'Variations', description: 'Colors, Size Options', icon: <FiPlus /> },
  ];

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header & Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-500">List a new product to your store</p>
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
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">New</span>
                    <h3 className="text-sm font-bold text-blue-900">Product Configuration</h3>
                  </div>
                  <p className="text-xs text-blue-700/80 mb-6 leading-relaxed">
                    Select the type of product you're adding. For products like perfumes or sunglasses that don't need size variations, uncheck "Enable Sizes".
                  </p>
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
                          <p className="text-[10px] text-gray-500">Uncheck if this product doesn't have size attributes (e.g. Perfumes)</p>
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
                          placeholder="Enter color name (e.g. Red, Blue)..."
                          className="w-full pl-4 pr-32 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer hover:text-primary-600 transition-colors">
                          <input
                            type="color"
                            value={/^#[0-9A-F]{6}$/i.test(formData.mainColor) ? formData.mainColor : "#000000"}
                            onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Pick visual color"
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Brand</label>
                      </div>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Original Price (for discount)</label>
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

                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Promotions</h4>
                      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-primary-100">
                        <input
                          type="checkbox"
                          name="eligibleForCoupon"
                          checked={formData.eligibleForCoupon}
                          onChange={handleChange}
                          className="w-5 h-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Eligible for Coupon Codes</span>
                      </label>

                      {formData.eligibleForCoupon && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-white border border-gray-200 rounded-2xl p-4 mt-2"
                        >
                          <h5 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" /> Select Applicable Promo Codes
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {promoCodes.filter(p => p.status === 'active').length > 0 ? (
                              promoCodes.filter(p => p.status === 'active').map((promo) => {
                                const promoId = promo._id || promo.id;
                                const isSelected = formData.applicablePromoCodes.includes(promoId);
                                return (
                                  <div
                                    key={promoId}
                                    onClick={() => {
                                      const newCodes = isSelected
                                        ? formData.applicablePromoCodes.filter(c => c !== promoId)
                                        : [...formData.applicablePromoCodes, promoId];
                                      setFormData({ ...formData, applicablePromoCodes: newCodes });
                                    }}
                                    className={`
                                        p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1
                                        ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}
                                      `}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-gray-900">{promo.code}</span>
                                      {isSelected && <FiCheckCircle className="text-primary-600" />}
                                    </div>
                                    <span className="text-[10px] text-gray-500">
                                      {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-gray-500 col-span-full py-4 text-center">No active promo codes found.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
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
                            <button
                              onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: "" }) }}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-md hover:bg-red-50 transition-all scale-0 group-hover:scale-100"
                            >
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                              <FiUpload className="text-xl text-primary-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-700">Upload Main Image</p>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Product Gallery</label>
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
                          <label className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-all group">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-50">
                              <FiPlus className="text-gray-400 group-hover:text-primary-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Add Image</span>
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
                        placeholder="0"
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
                    placeholder="Enter detailed product description (min 20 characters)..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Highlight your product's key features, materials, and benefits.</p>
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Custom Attributes</h3>
                      <p className="text-xs text-gray-500 mt-1">Add specific details like fragrance notes, lens type, or material</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Attribute Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Material"
                        value={newAttr.name}
                        onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Value</label>
                      <input
                        type="text"
                        placeholder="e.g. 100% Cotton"
                        value={newAttr.value}
                        onChange={(e) => setNewAttr({ ...newAttr, value: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Group</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Specifications"
                        value={newAttr.group}
                        onChange={(e) => setNewAttr({ ...newAttr, group: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mb-8">
                    <button
                      type="button"
                      onClick={addAttribute}
                      disabled={!newAttr.name || !newAttr.value}
                      className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                        ${newAttr.name && newAttr.value
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                      `}
                    >
                      <FiPlus size={18} />
                      Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.customAttributes && formData.customAttributes.length > 0 ? (
                      formData.customAttributes.map((attr, idx) => (
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
                          <button
                            type="button"
                            onClick={() => removeAttribute(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                        <p className="text-xs text-gray-400">No custom attributes added yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Product Sizes</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Add available sizes for this product (e.g. S, M, L, XL).</p>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add sizes..."
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyDown={handleAddSize}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                        />
                        <button type="button" onClick={() => handleAddSize()} className="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700transition-all shadow-sm"><FiPlus /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.variants.sizes.map((size) => (
                          <span key={size} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-xs font-bold border border-primary-100">
                            {size}
                            <button type="button" onClick={() => handleRemoveSize(size)}><FiX size={14} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Tags</h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">Add tags to improve discoverability.</p>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                        />
                        <button type="button" onClick={() => handleAddTag()} className="p-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all shadow-sm"><FiPlus /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)}><FiX size={14} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Product Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { id: 'flashSale', label: 'Flash Sale', icon: '⚡' },
                      { id: 'isNew', label: 'New Arrival', icon: '✨' },
                      { id: 'isTrending', label: 'Trending Now', icon: '🔥' },
                      { id: 'isFeatured', label: 'Featured Product', icon: '⭐' },
                      { id: 'isCrazyDeal', label: 'Crazy Deal', icon: '🤪' },
                      { id: 'isVisible', label: 'Visible to Customers', icon: '👁️' },
                      { id: 'isBuy', label: 'Enable Buy/Cart', icon: '🛒' },
                    ].map(opt => (
                      <label key={opt.id} className={`
                        flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2
                        ${formData[opt.id] ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'}
                      `}>
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-[10px] font-bold text-center uppercase tracking-wider text-gray-700">{opt.label}</span>
                        <div className="relative inline-flex items-center">
                          <input type="checkbox" name={opt.id} checked={formData[opt.id]} onChange={handleChange} className="sr-only peer" />
                          <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                        </div>
                      </label>
                    ))}
                  </div>
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
                    <p className="text-xs text-primary-600 font-medium tracking-tight">Add color options with size variants. Each color can have different sizes with individual price and stock.</p>
                  </div>
                  <button type="button" onClick={addColorVariant} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold"><FiPlus /> Add Variation</button>
                </div>

                <div className="space-y-8">
                  {formData.colorVariants.map((variant, vIdx) => (
                    <div key={vIdx} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                      <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">{vIdx + 1}</div>
                          <h4 className="font-bold text-gray-900">Color Variant {vIdx + 1}</h4>
                        </div>
                        <button type="button" onClick={() => removeColorVariant(vIdx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FiTrash2 size={18} /></button>
                      </div>
                      <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <input
                              type="text"
                              placeholder="Color Name (e.g. Red, Blue) *"
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
                                  <>
                                    <FiUpload className="text-xl text-gray-300 mb-2" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thumbnail</span>
                                  </>
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
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-4">
                              {variant.sizes.map((sz, sIdx) => (
                                <div key={sIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group/size animate-in fade-in duration-300">
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
                </div>

                <div className="pt-8 border-t border-gray-100 flex gap-4">
                  <label className="flex-1 flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2 border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200">
                    <input type="checkbox" name="returnable" checked={formData.returnable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Returnable</p>
                      <p className="text-[10px] text-gray-500">Allow customers to return this product</p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2 border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200">
                    <input type="checkbox" name="cancelable" checked={formData.cancelable} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Cancelable</p>
                      <p className="text-[10px] text-gray-500">Allow order cancellation before shipping</p>
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
              <>{loading ? 'Creating...' : 'Finish & Create'} <FiSave /></>
            ) : (
              <>Next Step <FiChevronRight /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
