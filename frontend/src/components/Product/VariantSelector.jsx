import { useState, useEffect, useMemo } from 'react';
import { FiCheck } from 'react-icons/fi';

const VariantSelector = ({ variants, onVariantChange, currentPrice }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // New Structure: variants.colorVariants [ { colorName, thumbnailImage, sizeVariants: [ { size, price, stockQuantity } ] } ]
  const hasColorVariants = useMemo(() =>
    variants?.colorVariants && variants.colorVariants.length > 0,
    [variants]
  );

  // Initialize
  useEffect(() => {
    if (hasColorVariants) {
      const firstColor = variants.colorVariants[0];
      setSelectedColor(firstColor);
      if (firstColor.sizeVariants && firstColor.sizeVariants.length > 0) {
        setSelectedSize(firstColor.sizeVariants[0]);
      }
    } else if (variants) {
      // Legacy Structure
      if (variants.colors && variants.colors.length > 0) {
        setSelectedColor({ colorName: variants.colors[0] });
      }
      if (variants.sizes && variants.sizes.length > 0) {
        setSelectedSize({ size: variants.sizes[0] });
      }
    }
  }, [variants, hasColorVariants]);

  // Handle color change
  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    // If we changed color, we might need to reset or update the size
    if (hasColorVariants) {
      if (colorObj.sizeVariants && colorObj.sizeVariants.length > 0) {
        // Try to find same size name in new color
        const sameSize = colorObj.sizeVariants.find(sv => sv.size === selectedSize?.size);
        setSelectedSize(sameSize || colorObj.sizeVariants[0]);
      } else {
        setSelectedSize(null);
      }
    }
  };

  // Notify parent
  useEffect(() => {
    if (onVariantChange) {
      if (hasColorVariants) {
        onVariantChange({
          color: selectedColor?.colorName,
          size: selectedSize?.size,
          price: selectedSize?.price,
          originalPrice: selectedSize?.originalPrice,
          stock: selectedSize?.stockQuantity,
          image: selectedColor?.thumbnailImage
        });
      } else {
        // Legacy
        onVariantChange({
          color: selectedColor?.colorName,
          size: selectedSize?.size
        });
      }
    }
  }, [selectedColor, selectedSize, onVariantChange, hasColorVariants]);

  if (!variants) return null;

  return (
    <div className="space-y-6">
      {/* Colors */}
      {(hasColorVariants || (variants.colors && variants.colors.length > 0)) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Color</span>
            <span className="text-xs font-bold text-slate-900">{selectedColor?.colorName || selectedColor?.color}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {hasColorVariants ? (
              variants.colorVariants.map((cv, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorChange(cv)}
                  className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${selectedColor?.colorName === cv.colorName
                    ? 'border-primary-600 scale-105 shadow-lg shadow-primary-100'
                    : 'border-slate-100 opacity-60'
                    }`}
                >
                  <img src={cv.thumbnailImage || "https://via.placeholder.com/50"} alt={cv.colorName} className="w-full h-full object-cover" />
                  {selectedColor?.colorName === cv.colorName && (
                    <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                      <FiCheck className="text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))
            ) : (
              variants.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor({ colorName: color })}
                  className={`relative px-4 py-2 rounded-xl border-2 font-bold text-xs transition-all ${selectedColor?.colorName === color
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-slate-100 text-slate-400'
                    }`}
                >
                  {color}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sizes */}
      {((hasColorVariants && selectedColor?.sizeVariants?.length > 0) || (variants.sizes && variants.sizes.length > 0)) && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Size</span>
            <span className="text-xs font-bold text-slate-900">{selectedSize?.size || 'Select Size'}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {hasColorVariants && selectedColor ? (
              selectedColor.sizeVariants.map((sv, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(sv)}
                  disabled={sv.stockQuantity <= 0}
                  className={`min-w-[50px] px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${selectedSize?.size === sv.size
                      ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-200'
                      : sv.stockQuantity > 0
                        ? 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                        : 'border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {sv.size}
                </button>
              ))
            ) : !hasColorVariants && variants.sizes && (
              variants.sizes.map((sz, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize({ size: sz })}
                  className={`min-w-[50px] px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${selectedSize?.size === sz
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg'
                    : 'border-slate-100 bg-white text-slate-600'
                    }`}
                >
                  {sz}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;


