import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiPlus, FiEye, FiArrowLeft, FiCalendar, FiTag, FiSend, FiPaperclip, FiUser, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import toast from 'react-hot-toast';
import {
  getVendorTickets,
  createVendorTicket,
  getVendorTicket,
  replyToTicket,
  updateTicketStatus,
  getTicketTypes
} from '../services/supportTicketService';

const SupportTickets = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const vendorId = vendor?.id || vendor?._id;

  useEffect(() => {
    if (!vendorId) return;

    // Only fetch list if we are NOT in detail view or if we want to keep list updated in background
    if (!id) {
      loadTickets();
    }
  }, [vendorId, id, statusFilter, refreshTrigger]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await getVendorTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (response.success) {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load tickets', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateTicket = async (ticketData) => {
    try {
      const response = await createVendorTicket(ticketData);
      if (response.success) {
        toast.success('Ticket created successfully');
        setShowForm(false);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to create ticket', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default',
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-700 font-medium truncate max-w-[200px] block" title={value}>{value}</span>,
    },
    {
      key: 'ticketType',
      label: 'Type',
      sortable: true,
      render: (value) => <span>{value?.name || 'N/A'}</span>
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => <span className="capitalize">{value}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(value)} capitalize`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={getStatusVariant(value)}>{value.replace('_', ' ')}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/vendor/support-tickets/${row._id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <FiEye />
        </button>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view tickets</p>
      </div>
    );
  }

  // Render detail view if ID is present
  if (id) {
    return <TicketDetail
      ticketId={id}
      navigate={navigate}
      getStatusVariant={getStatusVariant}
      getPriorityColor={getPriorityColor}
      currentVendorId={vendorId}
    />;
  }

  // Render list view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiMessageSquare className="text-primary-600" />
            Support Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage support tickets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
          <FiPlus />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <DataTable
        data={filteredTickets}
        columns={columns}
        pagination={true}
        itemsPerPage={10}
        loading={loading}
      />

      {showForm && (
        <TicketForm
          onSave={handleCreateTicket}
          onClose={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};

const TicketDetail = ({ ticketId, navigate, getStatusVariant, getPriorityColor, currentVendorId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await getVendorTicket(ticketId);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
      navigate('/vendor/support-tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    // Optional: Setup polling or socket listener here for real-time updates
  }, [ticketId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (ticket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await replyToTicket(ticketId, { message: newMessage });
      if (response.success) {
        setNewMessage('');
        // Optimistically update or re-fetch
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    try {
      const response = await updateTicketStatus(ticketId, { status: 'closed' });
      if (response.success) {
        toast.success('Ticket closed');
        fetchTicketDetails(); // Re-fetch to show updated status
      }
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  if (!ticket) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/vendor/support-tickets')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Ticket Details</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage ticket information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Messages */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{ticket.subject}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto mb-6 pr-2">
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex gap-4 ${msg.senderRole === 'vendor' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.senderRole === 'admin' ? 'bg-primary-100 text-primary-600' :
                      msg.senderRole === 'vendor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                      }`}>
                      {msg.senderRole === 'admin' ? 'A' : <FiUser />}
                    </div>
                    <div className={`flex flex-col ${msg.senderRole === 'vendor' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`p-4 rounded-xl ${msg.senderRole === 'vendor'
                        ? 'bg-blue-50 text-blue-900 rounded-tr-none'
                        : msg.senderRole === 'admin'
                          ? 'bg-primary-50 text-primary-900 rounded-tl-none'
                          : 'bg-gray-50 text-gray-900 rounded-tl-none'
                        }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleString()} • {msg.senderRole === 'vendor' ? 'You' : msg.senderId?.name || msg.senderRole}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 italic">
                  No messages yet.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <FiSend />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar - Meta Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FiInfo /> Ticket Info
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 block">Ticket Number</span>
                <span className="font-semibold text-gray-800">{ticket.ticketNumber}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Status</span>
                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Ticket Type</span>
                <span className="text-gray-800">{ticket.ticketType?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Category</span>
                <span className="capitalize text-gray-800">{ticket.category}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Priority</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)} capitalize`}>
                  {ticket.priority}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Created</span>
                <span className="text-sm text-gray-800">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {ticket.status !== 'closed' && (
              <button
                onClick={handleCloseTicket}
                className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold mt-4">
                Close Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TicketForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    issueType: 'other',
    priority: 'medium',
    description: '',
    ticketType: '',
  });
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setFetchingTypes(true);
      try {
        const response = await getTicketTypes();
        if (response.success) {
          setTicketTypes(response.data);
          if (response.data.length > 0) {
            setFormData(prev => ({ ...prev, ticketType: response.data[0]._id }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticket types', error);
      } finally {
        setFetchingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Create Support Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Ticket Type *</label>
              <select
                value={formData.ticketType}
                onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                required
                disabled={fetchingTypes}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:bg-gray-100">
                <option value="" disabled>Select Type</option>
                {ticketTypes.map(type => (
                  <option key={type._id} value={type._id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none">
              <option value="subscription">Subscription</option>
              <option value="payment">Payment</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="6"
              placeholder="Detailed explanation of the issue..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingTypes}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportTickets;
