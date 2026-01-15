import { motion } from 'framer-motion';
import { brands as mockBrands } from '../../data/brands';
import LazyImage from '../LazyImage';

const BrandLogosScroll = ({ brands = [], loading = false }) => {
  const displayBrands = brands.length > 0 ? brands : mockBrands.slice(0, 10);

  // Duplicate brands for seamless infinite loop (x3 to ensure coverage on wide screens)
  const marqueeBrands = [...displayBrands, ...displayBrands, ...displayBrands];

  if (!loading && displayBrands.length === 0) return null;

  if (loading) {
    return (
      <section className="w-full overflow-hidden py-2 bg-transparent">
        <div className="flex gap-4 px-4 overflow-x-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden py-2 bg-transparent">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); } /* 1/3 since we triplicated */
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full overflow-hidden">
        <div className="marquee-track">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand._id || brand.id}-${index}`}
              className="flex-shrink-0 px-2 group cursor-pointer"
            >
              <div className="w-20 flex flex-col items-center">
                <div className="bg-white rounded-xl p-2 w-20 h-20 flex items-center justify-center shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300 group-hover:bg-gray-50 group-hover:border-primary-200 group-hover:scale-105">
                  <LazyImage
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-gray-700 text-center truncate w-full group-hover:text-primary-600">
                  {brand.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogosScroll;
