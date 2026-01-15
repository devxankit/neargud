import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch, FiEye, FiMessageSquare, FiSend, FiUser, FiInfo, FiTag, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatDateTime } from '../../../utils/adminHelpers';
import toast from 'react-hot-toast';
import {
  getAllTickets,
  getTicket,
  respondToTicket,
  updateTicketStatus
} from '../../../services/adminSupportTicketApi';

const Tickets = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await getAllTickets({
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
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.vendorId?.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
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
      key: 'createdBy',
      label: 'Created By',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-800">
            {row.createdByRole === 'vendor' ? row.vendorId?.businessName : row.userId?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 capitalize">{row.createdByRole}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => <span className="capitalize">{value}</span>
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: false,
      render: (value) => <p className="text-sm text-gray-800 max-w-xs truncate" title={value}>{value}</p>,
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
      render: (value) => <Badge variant={getStatusColor(value)}>{value.replace('_', ' ')}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setSelectedTicketId(row._id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FiEye />
        </button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Support Tickets</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage support tickets</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Subject, or Name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="min-w-[140px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <DataTable
          data={filteredTickets}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
          loading={loading}
        />
      </div>

      <AnimatePresence>
        {selectedTicketId && (
          <TicketModal 
            ticketId={selectedTicketId} 
            onClose={() => {
              setSelectedTicketId(null);
              loadTickets(); // Refresh list on close
            }}
            isAppRoute={isAppRoute}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TicketModal = ({ ticketId, onClose, isAppRoute, getStatusColor, getPriorityColor }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getTicket(ticketId);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (error) {
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [ticketId]);

  useEffect(() => {
    if (ticket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await respondToTicket(ticketId, { 
        response: newMessage,
        status: ticket.status === 'open' ? 'in_progress' : undefined // Auto update status to in_progress first time
      });
      if (response.success) {
        setNewMessage('');
        fetchDetails(); // Refresh
      }
    } catch (error) {
      toast.error('Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await updateTicketStatus(ticketId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchDetails();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[10000]"
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[10000] flex ${isAppRoute ? 'items-start pt-[10px]' : 'items-center'} justify-center p-4 pointer-events-none`}
      >
        <motion.div
          variants={{
            hidden: { 
              y: isAppRoute ? '-100%' : '10%',
              scale: 0.95,
              opacity: 0
            },
            visible: { 
              y: 0,
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', damping: 25, stiffness: 300 }
            },
            exit: { 
              y: isAppRoute ? '-100%' : '10%',
              scale: 0.95,
              opacity: 0
            }
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden`}
        >
          {loading ? (
             <div className="p-12 text-center text-gray-500">Loading details...</div>
          ) : ticket ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-800">{ticket.ticketNumber}</h2>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{ticket.subject}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col border-r border-gray-100 min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Initial Description as first message */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <FiUser />
                      </div>
                      <div className="max-w-[85%]">
                        <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {formatDateTime(ticket.createdAt)} • {ticket.createdByRole === 'vendor' ? ticket.vendorId?.businessName : ticket.userId?.name}
                        </span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    {ticket.messages && ticket.messages.map((msg) => (
                      <div 
                        key={msg._id} 
                        className={`flex gap-4 ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          msg.senderRole === 'admin' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100'
                        }`}>
                          {msg.senderRole === 'admin' ? 'A' : <FiUser />}
                        </div>
                        <div className={`max-w-[85%] flex flex-col ${msg.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-xl ${
                            msg.senderRole === 'admin' 
                              ? 'bg-primary-50 text-blue-900 rounded-tr-none' 
                              : 'bg-gray-50 text-gray-900 rounded-tl-none'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {formatDateTime(msg.createdAt)} • {msg.senderId?.name || msg.senderRole}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-100">
                     <form onSubmit={handleSendMessage} className="relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px] text-sm"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <FiSend />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full md:w-80 bg-gray-50 p-6 overflow-y-auto border-l border-gray-100 shrink-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Actions</h4>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Details</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500 block">Created By</span>
                          <span className="text-sm font-medium text-gray-900">
                             {ticket.createdByRole === 'vendor' ? ticket.vendorId?.businessName : ticket.userId?.name || 'Unknown'}
                          </span>
                           <span className="text-xs text-gray-400 block capitalize">({ticket.createdByRole})</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Category</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{ticket.category}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Priority</span>
                           <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)} capitalize mt-1`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Date</span>
                          <span className="text-sm text-gray-900">{formatDateTime(ticket.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription/Transaction Info if applicable */}
                    {(ticket.subscriptionId || ticket.amount) && (
                       <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Context</h4>
                        <div className="space-y-2 text-sm">
                           {ticket.subscriptionId && <p>Subscription Plan linked</p>}
                           {ticket.amount && <p>Amount: {ticket.amount}</p>}
                           {ticket.transactionId && <p>Txn: {ticket.transactionId}</p>}
                        </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="p-12 text-center text-gray-500">Ticket not found</div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Tickets;
