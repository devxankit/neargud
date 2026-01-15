import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import VendorShowcaseCard from './VendorShowcaseCard';
import { getApprovedVendors } from '../../../modules/vendor/data/vendors';

const FeaturedVendorsSection = ({ vendors = [], loading = false }) => {
  const location = useLocation();
  const isMobileApp = location.pathname.startsWith('/app');
  const vendorsLink = isMobileApp ? '/app/search' : '/search';

  const featuredVendors = [...vendors]
    .filter(v => v.isVerified || v.status === 'active')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  if (!loading && featuredVendors.length === 0) return null;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Featured Vendors</h2>
          <p className="text-xs text-gray-600 mt-0.5">Shop from trusted stores</p>
        </div>
        <Link
          to={vendorsLink}
          className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
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

