import { useEffect } from 'react';
import { FiArrowLeft, FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import { useNotificationStore } from '../../../store/notificationStore';
import { formatDateTime } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import { DivideCircle } from 'lucide-react';

const MobileNotifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 50 }).catch(() => {});
  }, [fetchNotifications]);

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch {}
  };

  const handleDeleteRead = async () => {
    try {
      await deleteAllRead();
      toast.success('Read notifications deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div showBottomNav={true} showCartBar={true}>
      <div className="w-full">
        <div className="px-4 py-4 bg-white sticky top-0 z-30 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAll}
              className="px-3 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
            >
              Mark all read
            </button>
            <button
              onClick={handleDeleteRead}
              className="px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              Delete read
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-12">
              <FiBell className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600 font-semibold">No notifications</p>
              <p className="text-sm text-gray-500">You will see updates here</p>
            </div>
          )}

          <div className="space-y-3">
            {notifications.map((n) => (
              <motion.div
                key={n._id || n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  n.isRead ? 'border-gray-200 bg-white' : 'border-primary-200 bg-primary-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.isRead && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
                      <span className="text-xs text-gray-500">{formatDateTime(n.createdAt || n.date)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 truncate">{n.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    {n.orderId && (
                      <button
                        onClick={() => navigate(`/app/orders/${n.orderId}`)}
                        className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        View order
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id || n.id)}
                        className="p-2 rounded-lg hover:bg-primary-100 text-primary-700"
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n._id || n.id)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNotifications;
