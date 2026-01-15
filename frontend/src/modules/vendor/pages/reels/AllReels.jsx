import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiEye, FiX, FiHeart, FiMessageCircle, FiSend, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../../../../components/Admin/DataTable";
import Badge from "../../../../components/Badge";
import ConfirmModal from "../../../../components/Admin/ConfirmModal";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { getVendorReels, deleteVendorReel } from "../../services/reelService";
import toast from "react-hot-toast";

const AllReels = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reelId: null,
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    reel: null,
  });

  const vendorId = vendor?.id || vendor?._id;

  useEffect(() => {
    if (vendorId) {
      loadReels();
    }
  }, [vendorId]);

  const loadReels = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const response = await getVendorReels({ limit: 1000 });
      if (response.success && response.data?.reels) {
        setReels(response.data.reels);
      } else if (response.data && Array.isArray(response.data)) {
        setReels(response.data);
      }
    } catch (error) {
      console.error("Error loading reels:", error);
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  };

  const filteredReels = useMemo(() => {
    let filtered = reels;

    if (searchQuery) {
      filtered = filtered.filter((reel) =>
        reel.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((reel) => reel.status === selectedStatus);
    }

    return filtered;
  }, [reels, searchQuery, selectedStatus]);

  const handleDelete = (reelId) => {
    setDeleteModal({ isOpen: true, reelId });
  };

  const confirmDelete = async () => {
    if (deleteModal.reelId) {
      try {
        await deleteVendorReel(deleteModal.reelId);
        toast.success("Reel deleted successfully");
        loadReels();
      } catch (error) {
        console.error("Delete error", error);
        toast.error("Failed to delete reel");
      } finally {
        setDeleteModal({ isOpen: false, reelId: null });
      }
    }
  };

  const handleEdit = (reelId) => {
    navigate(`/vendor/reels/edit-reel/${reelId}`);
  };

  const handleView = (reel) => {
    setViewModal({ isOpen: true, reel });
  };

  const columns = [
    {
      label: "Thumbnail",
      key: "thumbnail",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative group cursor-pointer" onClick={() => handleView(row)}>
            <img
              src={row.thumbnail}
              alt={row.productName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/64?text=No+Img";
              }}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <FiEye className="text-white text-xl" />
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Product",
      key: "productName",
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {row.productName || 'No Product'}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
              ₹{row.productPrice?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Engagement",
      key: "engagement",
      render: (val, row) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-lg">
              <FiHeart className="text-sm fill-current" />
              <span className="text-xs font-bold">{row.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
              <FiMessageCircle className="text-sm" />
              <span className="text-xs font-bold">{row.comments || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium px-1">
            <span className="flex items-center gap-1">👀 {row.views || 0} Views</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">↗️ {row.shares || 0} Shares</span>
          </div>
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (val, row) => (
        <Badge
          value={row.status || "active"}
          variant={
            row.status === "active"
              ? "success"
              : row.status === "draft"
                ? "warning"
                : "error"
          }
        >
          {(row.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Quick Preview"
          >
            <FiEye className="text-lg" />
          </button> */}
          <button
            onClick={() => window.open(`/app/reels?reel=${row._id || row.id}`, "_blank")}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            title="View in App"
          >
            <FiEye className="text-lg" />
          </button>
          <button
            onClick={() => handleEdit(row._id || row.id)}
            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Edit Reel"
          >
            <FiEdit className="text-lg" />
          </button>
          <button
            onClick={() => handleDelete(row._id || row.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Reel"
          >
            <FiTrash2 className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search reels by product or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <AnimatedSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]}
            className="w-full sm:w-56"
          />
        </div>
      </div>


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search reels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <AnimatedSelect
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Reels</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {reels.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Reels</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {reels.filter((r) => r.status === "active").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {reels.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <DataTable
          data={filteredReels}
          columns={columns}
          // Remove searchQuery and onSearchChange as they are NOT in DataTable props props usually handled externally
          // Wait, DataTable in Step 449 does not accept searchQuery prop.
          // It only accepts pagination props.
          pagination={true}
          itemsPerPage={10}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reelId: null })}
        onConfirm={confirmDelete}
        title="Delete Reel"
        message="Are you sure you want to delete this reel? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* View Reel Modal */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.reel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-[350px] aspect-[9/19]"
            >
              {/* Close Button */}
              <button
                onClick={() => setViewModal({ isOpen: false, reel: null })}
                className="absolute -right-12 top-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <FiX className="text-xl" />
              </button>

              {/* Phone Frame */}
              <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800 relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

                {/* Content */}
                <div className="relative w-full h-full">
                  <video
                    src={viewModal.reel.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    controls={true}
                    poster={viewModal.reel.thumbnail}
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>

                  {/* Right Actions Bar */}
                  <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <FiHeart className="text-xl" />
                      </div>
                      <span className="text-white text-xs font-medium">{viewModal.reel.likes || 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <FiMessageCircle className="text-xl" />
                      </div>
                      <span className="text-white text-xs font-medium">{viewModal.reel.comments || 0}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                        <FiSend className="text-xl" />
                      </div>
                      <span className="text-white text-xs font-medium">{viewModal.reel.shares || 0}</span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-16 text-white text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold border border-white">
                        {vendor?.storeName?.[0] || 'V'}
                      </div>
                      <span className="font-semibold text-sm shadow-sm">{vendor?.storeName || 'Your Store'}</span>
                    </div>
                    <p className="text-sm line-clamp-2 leading-snug opacity-90 font-medium">
                      {viewModal.reel.description || viewModal.reel.productName || 'No description'}
                    </p>
                    {viewModal.reel.productPrice > 0 && (
                      <div className="mt-2 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                        ₹ {viewModal.reel.productPrice}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllReels;
