import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit, FiTrash2, FiFilter, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";
import DataTable from "../../../components/Admin/DataTable";
import ExportButton from "../../../components/Admin/ExportButton";
import Badge from "../../../components/Badge";
import ConfirmModal from "../../../components/Admin/ConfirmModal";
import ProductFormModal from "../../../components/Admin/ProductFormModal";
import ViewProductModal from "../../../components/Admin/ViewProductModal";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { formatCurrency } from "../../../utils/adminHelpers";
import { formatPrice } from "../../../utils/helpers";
import { useCategoryStore } from "../../../store/categoryStore";
import { useBrandStore } from "../../../store/brandStore";
import toast from "react-hot-toast";
import { fetchProducts, deleteProduct } from "../../../services/productApi";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { categories, fetchAdminCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
  });

  const [productFormModal, setProductFormModal] = useState({
    isOpen: false,
    productId: null,
  });

  const [viewModal, setViewModal] = useState({
    isOpen: false,
    productId: null,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        stock: selectedStatus !== "all" ? selectedStatus : undefined,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        brandId: selectedBrand !== "all" ? selectedBrand : undefined,
      });

      if (response?.products) {
        const formatted = response.products.map(p => ({
          ...p,
          id: p._id
        }));
        setProducts(formatted);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [pagination.page, pagination.limit, selectedStatus, selectedCategory, selectedBrand]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      if (searchQuery !== "") loadProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="w-10 h-10 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/50x50?text=Product";
            }}
          />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value) => formatPrice(value),
    },
    {
      key: "stockQuantity",
      label: "Stock",
      sortable: true,
      render: (value) => value.toLocaleString(),
    },
    {
      key: "stock",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === "in_stock"
              ? "success"
              : value === "low_stock"
                ? "warning"
                : "error"
          }>
          {value.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewModal({ isOpen: true, productId: row.id });
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ isOpen: true, productId: row.id });
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId);
      toast.success("Product deleted successfully");
      loadProducts();
      setDeleteModal({ isOpen: false, productId: null });
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Manage Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View, edit, and manage your product catalog
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Filters Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 w-full sm:min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
              />
            </div>

            <AnimatedSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' },
              ]}
              className="w-full sm:w-auto min-w-[140px]"
            />

            <AnimatedSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories
                  .filter((cat) => cat.isActive !== false)
                  .map((cat) => ({ value: String(cat.id || cat._id), label: cat.name })),
              ]}
              className="w-full sm:w-auto min-w-[160px]"
            />



            <div className="w-full sm:w-auto">
              <ExportButton
                data={products}
                headers={[
                  { label: "ID", accessor: (row) => row.id },
                  { label: "Name", accessor: (row) => row.name },
                  { label: "Price", accessor: (row) => formatPrice(row.price) },
                  { label: "Stock", accessor: (row) => row.stockQuantity },
                  { label: "Status", accessor: (row) => row.stock },
                ]}
                filename="products"
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={products}
          loading={loading}
          columns={columns}
          pagination={true}
          itemsPerPage={pagination.limit}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onRowClick={(row) => setViewModal({ isOpen: true, productId: row.id })}
        />
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ProductFormModal
        isOpen={productFormModal.isOpen}
        onClose={() => setProductFormModal({ isOpen: false, productId: null })}
        productId={productFormModal.productId}
        onSuccess={() => {
          loadProducts();
        }}
      />

      <ViewProductModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, productId: null })}
        productId={viewModal.productId}
      />
    </motion.div>
  );
};

export default ManageProducts;
