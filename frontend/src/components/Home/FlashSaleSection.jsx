import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiZap } from 'react-icons/fi';
import ProductCard from '../ProductCard';
import { getFlashSale } from '../../data/products';

const FlashSaleSection = () => {
  const products = getFlashSale();

  if (products.length === 0) return null;

  return (
    <section className="py-4 md:py-0 bg-transparent relative">
      {/* Desktop Layout */}
      <div className="hidden md:block bg-gradient-to-r from-red-50 to-orange-50 rounded-lg mb-4 p-4 shadow-sm border border-red-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <FiZap className="fill-red-600" /> Flash Sale
          </h2>
          <Link
            to="/app/flash-sale"
            className="text-sm text-red-600 font-semibold hover:text-red-700 transition-colors flex items-center gap-1"
          >
            See All <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4 min-w-max pb-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: '200px' }}
              >
                <div className="h-full">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden container mx-auto px-2 relative">
        <div className="flex items-center justify-between mb-3 relative z-20 px-1 bg-gradient-to-r from-red-500/10 to-transparent p-2 rounded-lg">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <FiZap className="fill-red-600 animate-pulse" /> Flash Sale
          </h2>
          <Link
            to="/app/flash-sale"
            className="text-xs font-semibold text-red-600 flex items-center gap-1"
          >
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {products.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;

