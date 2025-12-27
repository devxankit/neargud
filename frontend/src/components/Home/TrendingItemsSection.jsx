import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { getTrending } from '../../data/products';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TrendingItemsSection = () => {
  const products = getTrending();

  return (
    <section className="py-4 md:py-0 bg-transparent relative">
      {/* Desktop Layout */}
      <div className="hidden md:block bg-white rounded-lg mb-4 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Trending Items</h2>
          <Link
            to="/app/trending"
            className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-1"
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
        <div className="flex items-center justify-between mb-3 relative z-20 px-1">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Trending Items 🔥
          </h2>
          <Link to="/app/trending" className="text-xs font-semibold text-primary-600">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {products.slice(0, 4).map((product, index) => ( // Show limited items initially for speed
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
          {/* Show remaining without animation to reduce overhead if expanded, or just link to 'See All' */}
        </div>
      </div>
    </section>
  );
};

export default TrendingItemsSection;

