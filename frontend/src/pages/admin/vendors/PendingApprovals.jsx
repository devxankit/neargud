import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import DataTable from "../../../components/Admin/DataTable";
import Badge from "../../../components/Badge";
import ConfirmModal from "../../../components/Admin/ConfirmModal";
import { 
  fetchPendingVendors, 
  updateVendorStatusApi 
} from "../../../services/vendorApi";
import toast from "react-hot-toast";

const PendingApprovals = () => {
  const navigate = useNavigate();
  
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // approve | reject
    vendorId: null,
    vendorName: null,
  });

  // ================= LOAD PENDING VENDORS =================
  const loadPendingVendors = async () => {
    setLoading(true);
    try {
      const response = await fetchPendingVendors({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery
      });

      if (response?.vendors) {
        // 🔥 normalize _id to id
        const formattedVendors = response.vendors.map(v => ({
          ...v,
          id: v._id
        }));

        setVendors(formattedVendors);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      }
    } catch (error) {
      console.error("Failed to fetch pending vendors:", error);
      toast.error("Failed to load pending vendors");
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    loadPendingVendors();
  }, [pagination.page, pagination.limit]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadPendingVendors();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ================= TABLE COLUMNS =================
  const columns = useMemo(() => [
    {
      key: "id",
      label: "ID",
      render: (value) => <span className="text-xs text-gray-500">#{value}</span>
    },
    {
      key: "storeName",
      label: "Store Name",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.storeLogo && (
            <img
              src={row.storeLogo}
              alt="logo"
              className="w-10 h-10 object-cover rounded-lg"
            />
          )}
          <div>
            <span className="font-medium text-gray-800">
              {value || row.name}
            </span>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => (
        <span className="text-sm text-gray-700">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "joinDate",
      label: "Registration Date",
      render: (_, row) => (
        <span className="text-sm text-gray-700">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant="warning">{value.toUpperCase()}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/vendors/${row.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <FiEye />
          </button>

          <button
            onClick={() =>
              setActionModal({
                isOpen: true,
                type: "approve",
                vendorId: row.id,
                vendorName: row.storeName || row.name,
              })
            }
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
          >
            <FiCheckCircle />
          </button>

          <button
            onClick={() =>
              setActionModal({
                isOpen: true,
                type: "reject",
                vendorId: row.id,
                vendorName: row.storeName || row.name,
              })
            }
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FiXCircle />
          </button>
        </div>
      ),
    },
  ], [navigate]);

  // ================= ACTIONS =================
  const handleApprove = async () => {
    try {
      await updateVendorStatusApi(actionModal.vendorId, "approved");
      toast.success("Vendor approved successfully");
      loadPendingVendors();
    } catch (error) {
      toast.error("Failed to approve vendor");
    }
    closeModal();
  };

  const handleReject = async () => {
    try {
      await updateVendorStatusApi(actionModal.vendorId, "suspended");
      toast.success("Vendor rejected successfully");
      loadPendingVendors();
    } catch (error) {
      toast.error("Failed to reject vendor");
    }
    closeModal();
  };

  const closeModal = () => {
    setActionModal({
      isOpen: false,
      type: null,
      vendorId: null,
      vendorName: null,
    });
  };

  // ================= MODAL CONTENT =================
  const getModalContent = () => {
    if (actionModal.type === "approve") {
      return {
        title: "Approve Vendor?",
        message: `Approve "${actionModal.vendorName}"?`,
        confirmText: "Approve",
        onConfirm: handleApprove,
        type: "success",
      };
    }

    if (actionModal.type === "reject") {
      return {
        title: "Reject Vendor?",
        message: `Reject "${actionModal.vendorName}"?`,
        confirmText: "Reject",
        onConfirm: handleReject,
        type: "danger",
      };
    }

    return null;
  };

  const modalContent = getModalContent();

  // ================= UI =================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">

        {/* Search */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pending vendors..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        {vendors.length > 0 ? (
          <DataTable
            data={vendors}
            columns={columns}
            loading={loading}
            pagination
            itemsPerPage={pagination.limit}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
            onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)}
          />
        ) : (
          <div className="text-center py-12">
            <FiCheckCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No pending approvals</p>
            <p className="text-sm text-gray-400">
              All vendor registrations have been reviewed
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalContent && (
        <ConfirmModal
          isOpen={actionModal.isOpen}
          onClose={closeModal}
          onConfirm={modalContent.onConfirm}
          title={modalContent.title}
          message={modalContent.message}
          confirmText={modalContent.confirmText}
          cancelText="Cancel"
          type={modalContent.type}
        />
      )}
    </motion.div>
  );
};

export default PendingApprovals;
