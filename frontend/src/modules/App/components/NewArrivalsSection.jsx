import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FiTag } from 'react-icons/fi';
import LazyImage from '../../../components/LazyImage';


const NewArrivalsSection = ({ products = [], loading = false, theme = null }) => {
  const location = useLocation();
  const isMobileApp = location.pathname.startsWith('/app');
  const newArrivals = products.slice(0, 6);

  if (!loading && newArrivals.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className={`relative mx-4 my-4 rounded-2xl overflow-hidden shadow-xl border-2 transition-all duration-500 ${!theme ? "border-cyan-200 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500" : ""}`}
      style={theme ? {
        background: `linear-gradient(135deg, ${theme.primary[0]} 0%, ${theme.primary[1]} 50%, ${theme.primary[2]} 100%)`,
        borderColor: theme.accentColor + '40'
      } : {}}
    >
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'linear-gradient(225deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'linear-gradient(315deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Decorative Background Pattern with Floating Animation */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl"
          animate={{
            x: [0, -15, 0],
            y: [0, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative px-4 py-3">
        {/* Header with Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className="bg-black/10 backdrop-blur-sm rounded-full p-2"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.15, rotate: 10 }}
            >
              <motion.div
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <FiTag className="text-black text-lg" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2
                className="text-xl font-black tracking-tight"
                style={{
                  color: '#000',
                  textShadow: '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff'
                }}
              >
                New Arrivals
              </motion.h2>
              <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: '#000', opacity: 0.8, textShadow: '0.5px 0.5px 0px #fff' }}>Fresh products just added</p>
            </motion.div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/app/search"
              className="bg-white/30 backdrop-blur-md text-black text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full border border-white/20 hover:bg-white/50 transition-all block"
            >
              See All
            </Link>
          </motion.div>
        </div>

        {/* Products Grid - Image Only */}
        <div className="flex flex-wrap md:flex-nowrap md:overflow-x-visible gap-2 md:gap-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="w-[calc(33.333%-0.5rem)] aspect-square bg-white/20 animate-pulse rounded-xl" />
            ))
          ) : (
            newArrivals.map((product, index) => {
              const productLink = isMobileApp ? `/app/product/${product._id || product.id}` : `/product/${product._id || product.id}`;
              return (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                  }}
                  className="w-[calc(33.333%-0.5rem)] md:w-0 md:flex-1 md:min-w-0"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 4px 6px rgba(0,0,0,0.1)',
                        '0 8px 12px rgba(59, 130, 246, 0.3)',
                        '0 4px 6px rgba(0,0,0,0.1)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                    className="rounded-xl overflow-hidden"
                  >
                    <Link to={productLink} className="group">
                      <div className="relative rounded-xl overflow-hidden bg-white shadow-md border border-white/50 group-hover:shadow-xl transition-all duration-300">
                        <div className="w-full aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden relative">
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                            }}
                          />
                          {/* Top Badge */}
                          <div className="absolute top-1 right-1 bg-cyan-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            NEW
                          </div>
                        </div>
                        {/* Info Overlay at bottom */}
                        <div className="p-1.5 bg-white/95 backdrop-blur-sm border-t border-gray-100">
                          <h3 className="text-[9px] font-bold text-gray-800 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] font-black text-gray-900">
                              ₹{product.price}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-[8px] text-green-600 font-bold">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NewArrivalsSection;

