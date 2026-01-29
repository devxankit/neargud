import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import VendorShowcaseCard from './VendorShowcaseCard';
import { getApprovedVendors } from '../../../modules/vendor/data/vendors';

const FeaturedVendorsSection = ({ vendors = [], loading = false, theme = null }) => {
  const location = useLocation();
  const isMobileApp = location.pathname.startsWith('/app');
  const vendorsLink = isMobileApp ? '/app/search' : '/search';

  const featuredVendors = [...vendors]
    .filter(v => v.isVerified || v.status === 'active')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  if (!loading && featuredVendors.length === 0) return null;

  return (
    <div className="px-4 py-6 mt-1">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2
            className="text-xl font-black tracking-tight"
            style={{
              color: '#000000',
              textShadow: '0 1px 1px rgba(255,255,255,0.4)'
            }}
          >
            Featured Vendors
          </h2>
          <p
            className="text-[10px] font-black mt-0.5 opacity-80 uppercase tracking-wider"
            style={{ color: '#000000' }}
          >
            Shop from trusted stores
          </p>
        </div>
        <Link
          to={vendorsLink}
          className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 bg-white/40 backdrop-blur-md rounded-full shadow-sm hover:bg-white/60 transition-all active:scale-95"
          style={{ color: '#000000' }}
        >
          <span>See All</span>
          <FiArrowRight className="text-sm" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-32 h-40 bg-gray-200 animate-pulse rounded-xl" />
          ))
        ) : (
          featuredVendors.map((vendor, index) => (
            <VendorShowcaseCard key={vendor._id || vendor.id} vendor={vendor} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturedVendorsSection;

