import { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical, 
  FiMessageCircle,
  FiBox,
  FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useProductFaqStore } from "../../../../store/productFaqStore";
import { useVendorProductsStore } from "../../../../store/vendorProductsStore"; // Need this to select product
import toast from "react-hot-toast";
import DataTable from "../../../../components/Admin/DataTable";
import Badge from "../../../../components/Badge";
import ConfirmModal from "../../../../components/Admin/ConfirmModal";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";

const ProductFAQs = () => {
  const { faqs, loading, getFAQs, addFAQ, editFAQ, removeFAQ, pagination } = useProductFaqStore();
  const { products, fetchVendorProducts } = useVendorProductsStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const [formData, setFormData] = useState({
    productId: "",
    question: "",
    answer: "",
    status: "active",
    order: 0
  });

  useEffect(() => {
    getFAQs({ page: 1, limit: 10 });
    fetchVendorProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add debounce if needed
  };

  const openAddModal = () => {
    setCurrentFaq(null);
    setFormData({
      productId: "",
      question: "",
      answer: "",
      status: "active",
      order: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setCurrentFaq(faq);
    setFormData({
      productId: faq.productIdStr || faq.productId?._id || faq.productId,
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
      order: faq.order || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentFaq) {
        await editFAQ(currentFaq._id, formData);
        toast.success("FAQ updated successfully");
      } else {
        await addFAQ(formData);
        toast.success("FAQ added successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const confirmDelete = (faq) => {
    setFaqToDelete(faq);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await removeFAQ(faqToDelete._id);
      toast.success("FAQ deleted successfully");
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
            {row.productImage ? (
              <img src={row.productImage} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <FiBox />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
              {row.productName || "Product Deleted"}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">SKU: {row.productSku || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: "question",
      label: "Question",
      render: (value) => (
        <div className="max-w-[300px]">
          <p className="text-sm font-semibold text-gray-800 line-clamp-2">{value}</p>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'error'}>
          {value.toUpperCase()}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openEditModal(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <FiMessageCircle />
            </div>
            Product FAQs
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage frequently asked questions for your products</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
        >
          <FiPlus /> Add New FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search questions or products..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="w-[250px]">
          <AnimatedSelect 
            options={[
              { value: "all", label: "All Products" },
              ...products.map(p => ({ value: p._id, label: p.name }))
            ]}
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={faqs}
          loading={loading}
          pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => getFAQs({ page, limit: 10 })}
        />
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900">
                    {currentFaq ? 'Edit FAQ' : 'Add New FAQ'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FiX size={24} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Select Product *</label>
                    <AnimatedSelect 
                      options={products.map(p => ({ value: p._id, label: p.name }))}
                      value={formData.productId}
                      onChange={(e) => setFormData({...formData, productId: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Question *</label>
                    <input 
                      type="text"
                      placeholder="e.g. How to care for this product?"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-gray-700"
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Answer *</label>
                    <textarea 
                      placeholder="Enter the detailed answer..."
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium text-gray-700 resize-none"
                      value={formData.answer}
                      onChange={(e) => setFormData({...formData, answer: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Order</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                      <AnimatedSelect 
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' }
                        ]}
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                    >
                      {loading ? 'Processing...' : currentFaq ? 'Update FAQ' : 'Create FAQ'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete FAQ?"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

export default ProductFAQs;
