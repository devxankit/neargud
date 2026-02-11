import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DataTable from "../../../components/Admin/DataTable";
import ExportButton from "../../../components/Admin/ExportButton";
import Badge from "../../../components/Badge";
import ConfirmModal from "../../../components/Admin/ConfirmModal";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { formatPrice } from "../../../utils/helpers";

import {
  fetchVendors,
  updateVendorStatusApi,
  updateVendorActiveStatusApi,
} from "../../../services/vendorApi";

const ManageVendors = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    vendorId: null,
    vendorName: null,
  });


  // ================= LOAD VENDORS =================
  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await fetchVendors({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      if (response?.data?.vendors) {
        // 🔥 normalize _id to id
        const formattedVendors = response.data.vendors.map((v) => ({
          ...v,
          id: v._id,
        }));

        setVendors(formattedVendors);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages,
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    loadVendors();
  }, [pagination.page, pagination.limit, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadVendors();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ================= COLUMNS =================
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => <span className="text-xs text-gray-500">#{value.slice(-6).toUpperCase()}</span>,
    },
    {
      key: "storeName",
      label: "Store Name",
      render: (value) => <span className="font-semibold">{value || "N/A"}</span>,
    },
    {
      key: "documentIds",
      label: "Document IDs",
      render: (_, row) => (
        <div className="text-[10px] leading-tight text-gray-500">
          <p><span className="font-medium">Lic:</span> {row.businessLicenseNumber || "N/A"}</p>
          <p><span className="font-medium">PAN:</span> {row.panCardNumber || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "approved"
              ? "success"
              : value === "pending"
                ? "warning"
                : "error"
          }
        >
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Profile Status",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge variant={value ? "success" : "error"}>
            {value ? "ACTIVE" : "INACTIVE"}
          </Badge>
          {value ? (
            <button
              onClick={() => setActionModal({ isOpen: true, type: "deactivate", vendorId: row.id, vendorName: row.storeName })}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Deactivate"
            >
              <FiXCircle size={14} />
            </button>
          ) : (
            <button
              onClick={() => setActionModal({ isOpen: true, type: "activate", vendorId: row.id, vendorName: row.storeName })}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Activate"
            >
              <FiCheckCircle size={14} />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "performance",
      label: "Performance",
      render: (_, row) => (
        <div className="text-xs">
          <p className="font-medium text-gray-700">{row.totalOrders || 0} orders</p>
          <p className="text-green-600 font-bold">{formatPrice(row.totalRevenue || 0)} earned</p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/vendors/${row.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <FiEye />
          </button>
        </div>
      ),
    },
  ];

  // ================= ACTIONS =================
  const handleApprove = async () => {
    await updateVendorStatusApi(actionModal.vendorId, "approved");
    toast.success("Vendor approved");
    loadVendors();
    closeModal();
  };

  const handleSuspend = async () => {
    await updateVendorStatusApi(actionModal.vendorId, "rejected");
    toast.success("Vendor rejected");
    loadVendors();
    closeModal();
  };


  const handleToggleActive = async () => {
    const isActive = actionModal.type === "activate";
    await updateVendorActiveStatusApi(actionModal.vendorId, isActive);
    toast.success(`Vendor ${isActive ? "activated" : "deactivated"}`);
    loadVendors();
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
        message: `Approve ${actionModal.vendorName}?`,
        confirmText: "Approve",
        onConfirm: handleApprove,
        type: "success",
      };
    }

    if (actionModal.type === "suspend") {
      return {
        title: "Suspend Vendor?",
        message: `Suspend ${actionModal.vendorName}?`,
        confirmText: "Suspend",
        onConfirm: handleSuspend,
        type: "danger",
      };
    }

    if (actionModal.type === "activate") {
      return {
        title: "Activate Vendor?",
        message: `Activate profile for ${actionModal.vendorName}?`,
        confirmText: "Activate",
        onConfirm: handleToggleActive,
        type: "success",
      };
    }

    if (actionModal.type === "deactivate") {
      return {
        title: "Deactivate Vendor?",
        message: `Deactivate profile for ${actionModal.vendorName}?`,
        confirmText: "Deactivate",
        onConfirm: handleToggleActive,
        type: "danger",
      };
    }


    return null;
  };

  const modalContent = getModalContent();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-white p-6 rounded-xl shadow border">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <AnimatedSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
          />

          <ExportButton data={vendors} filename="vendors" />
        </div>

        {/* Table */}
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
        />
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
          customContent={modalContent.customContent}
        />
      )}
    </motion.div>
  );
};

export default ManageVendors;
