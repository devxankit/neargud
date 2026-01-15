import { FiMail, FiPhone, FiShoppingBag, FiDollarSign, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../Badge';
import { formatCurrency } from '../../../utils/adminHelpers';

const CustomerCard = ({ customer, onView }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/20 flex items-center justify-center text-primary-600 font-bold text-xl border border-primary-500/10 transition-transform group-hover:scale-105">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                customer.firstName ? customer.firstName.charAt(0) : customer.email.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
                {customer.name || 'Anonymous User'}
              </h3>
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">
                ID: {customer._id || customer.id ? (customer._id || customer.id).slice(-8).toUpperCase() : 'N/A'}
              </p>
            </div>
          </div>
          <Badge
            variant={customer.status === 'active' ? 'success' : 'error'}
            className={`shadow-sm ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'} border-0 px-3 py-1`}
          >
            {customer.status || 'unknown'}
          </Badge>
        </div>

        <div className="space-y-3.5 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <FiMail className="text-sm" />
            </div>
            <span className="text-[14px] font-medium truncate max-w-[200px]">{customer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <FiPhone className="text-sm" />
            </div>
            <span className="text-[14px] font-medium">{customer.phone || 'No phone provided'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <FiShoppingBag className="text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
            </div>
            <p className="text-lg font-black text-gray-900 leading-none">{customer.orders || 0}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-gray-400 mb-1">
              <FiDollarSign className="text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Spent</span>
            </div>
            <p className="text-lg font-black text-primary-600 leading-none">
              {formatCurrency(customer.totalSpent || 0)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onView(customer)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 font-bold text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <FiEye className="text-base" />
          View Full Profile
        </button>
      </div>
    </motion.div>
  );
};

export default CustomerCard;

