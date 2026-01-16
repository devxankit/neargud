import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { getTheme } from '../utils/themes';
import { useContentStore } from '../store/contentStore';

interface PromoCard {
  id: string;
  badge: string;
  title: string;
  imageUrl?: string;
  categoryId?: string;
  bgColor?: string;
  productImages?: string[];
}

// Category mapping for this app
const categoryMap: Record<number, string[]> = {
  1: ['t-shirt', 'shirt', 'jeans', 'dress', 'gown', 'skirt', 'blazer', 'jacket', 'cardigan', 'sweater', 'flannel', 'maxi'],
  2: ['sneakers', 'pumps', 'boots', 'heels', 'shoes'],
  3: ['bag', 'crossbody', 'handbag'],
  4: ['necklace', 'watch', 'wristwatch'],
  5: ['sunglasses', 'belt', 'scarf'],
  6: ['athletic', 'running', 'track', 'sporty'],
};

// Icon mappings for each category
const getCategoryIcons = (categoryId: number) => {
  const iconMap: Record<number, string[]> = {
    1: ['👕', '👗', '🧥', '👔'], // Clothing
    2: ['👠', '👟', '🥿', '👢'], // Footwear
    3: ['👜', '💼', '🎒', '🛍️'], // Bags
    4: ['💍', '⌚', '📿', '💎'], // Jewelry
    5: ['🕶️', '🧣', '👓', '🎩'], // Accessories
    6: ['⚽', '🏃', '🎽', '🏋️'], // Athletic
  };
  return iconMap[categoryId] || ['📦', '📦', '📦', '📦'];
};

// Get products for a category
const getCategoryProducts = (categoryId: number) => {
  const keywords = categoryMap[categoryId] || [];
  return products.filter((product) => {
    const productName = product.name.toLowerCase();
    return keywords.some((keyword) => productName.includes(keyword));
  });
};

// Calculate discount percentage
const calculateDiscount = (product: any) => {
  if (!product.originalPrice) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
};

// Get promo cards based on actual categories
const getPromoCards = (): PromoCard[] => {
  return categories.slice(0, 4).map((category) => {
    const categoryProducts = getCategoryProducts(category.id);
    const discountedProducts = categoryProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
    const maxDiscount = discountedProducts.length > 0
      ? Math.max(...discountedProducts.map(calculateDiscount))
      : 30;

    return {
      id: `category-${category.id}`,
      badge: `Up to ${maxDiscount}% OFF`,
      title: category.name,
      categoryId: category.id.toString(),
      bgColor: 'bg-yellow-50',
    };
  });
};

// Get featured products based on active tab or categoryId - using actual products from the app
const getFeaturedProducts = (activeTab: string, categoryId?: number) => {
  // Get products with discounts
  const discountedProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

  // Filter by category based on categoryId or active tab
  let filteredProducts = discountedProducts;

  // If categoryId is provided, filter by that specific category
  if (categoryId && categoryMap[categoryId]) {
    const keywords = categoryMap[categoryId];
    filteredProducts = discountedProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      return keywords.some((keyword) => productName.includes(keyword));
    });
  } else if (activeTab === 'fashion') {
    // Fashion tab - show clothing, footwear, bags, jewelry, accessories
    const fashionKeywords = [...categoryMap[1], ...categoryMap[2], ...categoryMap[3], ...categoryMap[4], ...categoryMap[5]];
    filteredProducts = discountedProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      return fashionKeywords.some((keyword) => productName.includes(keyword));
    });
  } else if (activeTab === 'sports') {
    // Sports tab - show athletic products
    const sportsKeywords = categoryMap[6];
    filteredProducts = discountedProducts.filter((product) => {
      const productName = product.name.toLowerCase();
      return sportsKeywords.some((keyword) => productName.includes(keyword));
    });
  }

  // Get top 4 discounted products
  const topProducts = filteredProducts
    .sort((a, b) => {
      const discountA = calculateDiscount(a);
      const discountB = calculateDiscount(b);
      return discountB - discountA;
    })
    .slice(0, 4);

  // Convert to featured products format
  return topProducts.map((product) => ({
    id: product.id.toString(),
    name: product.name,
    originalPrice: product.originalPrice || product.price * 1.2,
    discountedPrice: product.price,
  }));
};

interface PromoStripProps {
  activeTab?: string;
  heroBanner?: React.ReactNode;
  categoryName?: string; // Optional category name to display in banner
  categoryId?: number; // Optional category ID to filter content to this category only
  categories?: any[];
  categoryProducts?: Record<string, any[]>;
  crazyDeals?: any[];
}

// Subcategory mappings for each main category
const subcategoryMap: Record<number, Array<{ name: string; keywords: string[]; icons: string[] }>> = {
  // ... (Keep existing if needed, but we focus on dynamic first)
  1: [ // Clothing
    { name: 'T-Shirts & Tops', keywords: ['t-shirt', 'shirt', 'top'], icons: ['👕', '👔', '👚', '🎽'] },
    { name: 'Jeans & Pants', keywords: ['jeans', 'pants', 'trousers'], icons: ['👖', '🩳', '👔', '👕'] },
    { name: 'Dresses & Skirts', keywords: ['dress', 'gown', 'skirt', 'maxi'], icons: ['👗', '👘', '👙', '👚'] },
    { name: 'Jackets & Outerwear', keywords: ['jacket', 'blazer', 'cardigan', 'sweater'], icons: ['🧥', '🧣', '👔', '🧤'] },
  ],
  // ... other maps can stay or be removed if purely dynamic
};

// Start 2045: Helper to get cards from dynamic categories
const getDynamicCategoryCards = (categories: any[], categoryProductsMap?: Record<string, any[]>): PromoCard[] => {
  if (!categories || categories.length === 0) return [];
  
  return categories.slice(0, 4).map((category, index) => {
    if (!category) return null;
    
    // Generate some mock discount/badge if no data
    const discount = 20 + (index * 5);
    const bgColors = ['bg-purple-50', 'bg-blue-50', 'bg-yellow-50', 'bg-red-50'];
    const catId = category._id || category.id;

    if (!catId) return null;

    // Get product images for this category
    const productImages = categoryProductsMap && categoryProductsMap[catId]
      ? categoryProductsMap[catId].slice(0, 4).map(p => p?.images?.[0] || p?.image).filter(Boolean)
      : [];

    return {
      id: catId,
      badge: `Up to ${discount}% OFF`,
      title: category.name || 'Category',
      categoryId: catId.toString(),
      imageUrl: category.image,
      bgColor: bgColors[index % bgColors.length],
      productImages: productImages.length > 0 ? productImages : undefined
    };
  }).filter(Boolean) as PromoCard[];
};

// Get category cards based on active tab or categoryId - using actual categories
const getCategoryCards = (activeTab: string, categoryId?: number, dynamicCategories?: any[], categoryProductsMap?: Record<string, any[]>): PromoCard[] => {
  if (dynamicCategories && dynamicCategories.length > 0) {
    return getDynamicCategoryCards(dynamicCategories, categoryProductsMap);
  }

  // If categoryId is provided, show subcategories/types within that category
  if (categoryId && subcategoryMap[categoryId]) {
    // ... (existing logic)
    const subcategories = subcategoryMap[categoryId];
    return subcategories.map((subcat, index) => {
      // ... (existing logic simplified for brevity in plan, but keeping full in replacement)
      return {
        id: `subcategory-${categoryId}-${index}`,
        badge: `EXTRA 10% OFF`,
        title: subcat.name,
        categoryId: categoryId.toString(),
        bgColor: 'bg-red-50',
      }
    });
  }

  // Otherwise, use activeTab logic (fallback to static if no dynamic categories passed)
  if (activeTab === 'fashion') {
    // ...
  }

  // Default - show first 4 categories
  return getPromoCards();
};

// Helper function to convert RGB string to RGBA with opacity
const rgbToRgba = (rgbString: string, opacity: number): string => {
  // Extract RGB values from string like "rgb(196, 181, 253)"
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
  }
  return rgbString; // Fallback if parsing fails
};

export default function PromoStrip({
  activeTab = 'all',
  heroBanner,
  categoryName,
  categoryId,
  categories: dynamicCategories = [],
  categoryProducts = {},
  crazyDeals = []
}: PromoStripProps) {
  const { content } = useContentStore();
  const { housefullText = 'HOUSEFULL', saleDateText = '30TH NOV, 2025 - 7TH DEC, 2025', crazyDealsText = { line1: 'CRAZY', line2: 'DEALS' } } = content?.homepage?.promoStrip || {};

  const theme = getTheme(activeTab);
  const bannerText = categoryName ? categoryName.toUpperCase() : (activeTab === 'all' ? housefullText : theme.bannerText);

  const categoryCards = getCategoryCards(activeTab, categoryId, dynamicCategories, categoryProducts) || [];



  // If crazyDeals props is provided and has items, use it. Otherwise fallback to static getFeaturedProducts
  const featuredProducts = (crazyDeals && crazyDeals.length > 0)
    ? crazyDeals.map(p => ({
      id: p._id || p.id,
      name: p.name,
      originalPrice: p.originalPrice || (p.price * 1.2).toFixed(0),
      discountedPrice: p.price,
      image: p.images?.[0] || p.image
    })).filter(p => p.id) // Filter out any items without an id
    : (getFeaturedProducts(activeTab, categoryId) || []);

  // ... (refs and effects) ...
  const containerRef = useRef<HTMLDivElement>(null);
  const snowflakesRef = useRef<HTMLDivElement>(null);
  const housefullRef = useRef<HTMLDivElement>(null);
  const saleRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const productNameRef = useRef<HTMLDivElement>(null);
  const productImageRef = useRef<HTMLDivElement>(null);


  // Reset product index when activeTab changes
  useEffect(() => {
    setCurrentProductIndex(0);
  }, [activeTab]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context((self) => {
      if (!container) return;

      const q = gsap.utils.selector(container);

      // 1. Initial cards stagger
      const cards = q('.promo-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
          }
        );
      }

      // 2. Snowflake animation
      const snowflakesContainer = snowflakesRef.current;
      if (snowflakesContainer) {
        const snowflakes = q('.snowflake');
        snowflakes.forEach((snowflake, index) => {
          const delay = index * 0.3;
          const duration = 3 + Math.random() * 2;
          const xOffset = (Math.random() - 0.5) * 40;

          gsap.set(snowflake, {
            y: -20,
            x: xOffset,
            opacity: 0.8 + Math.random() * 0.2,
            scale: 0.6 + Math.random() * 0.4,
          });

          gsap.to(snowflake, {
            y: '+=200',
            x: `+=${xOffset}`,
            duration: duration,
            delay: delay,
            ease: 'none',
            repeat: -1,
          });
        });
      }

      // 3. HOUSEFULL SALE animation (Timeline with repeat)
      const housefullContainer = housefullRef.current;
      const saleText = saleRef.current;
      const dateText = dateRef.current;

      if (housefullContainer) {
        const letters = q('.housefull-letter');
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        const targets = [housefullContainer, saleText, dateText].filter(Boolean);
        if (targets.length > 0) {
          tl.set(targets as any, { scale: 1, opacity: 1 })
            .to(targets as any, {
              scale: 0,
              opacity: 0,
              duration: 0.6,
              ease: 'power2.in',
              delay: 2 // Wait before starting loop
            })
            .to(targets as any, {
              scale: 1.2,
              opacity: 1,
              duration: 0.5,
              ease: 'back.out(1.7)',
            })
            .to(targets as any, {
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
            })
            .to({}, { duration: 0.4 });

          if (letters.length > 0) {
            tl.to(letters, {
              y: -15,
              duration: 0.2,
              stagger: 0.06,
              ease: 'power2.out',
            })
              .to(letters, {
                y: 0,
                duration: 0.2,
                stagger: 0.06,
                ease: 'power2.in',
              });
          }
        }
      }
    }, container);

    return () => {
      try {
        ctx.revert();
      } catch (e) {
        // Safe catch
      }
    };
  }, [activeTab, bannerText]);

  // Product rotation animation
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 3000); // Change product every 3 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create scoped selector
      const q = gsap.utils.selector(containerRef);

      const priceTag = q('.crazy-price-container');
      const nameTag = q('.crazy-product-name');
      const imageTag = q('.crazy-product-image');

      if (priceContainerRef.current && productNameRef.current && productImageRef.current) {
        // Swipe left (out)
        try {
          gsap.to([priceContainerRef.current, productNameRef.current, productImageRef.current], {
            opacity: 0,
            x: -30,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              // Double check refs and component mounted status
              if (!priceContainerRef.current || !productNameRef.current || !productImageRef.current) return;

              // Reset position and update content
              gsap.set([priceContainerRef.current, productNameRef.current, productImageRef.current], {
                x: 30,
                opacity: 0,
              });

              // Swipe in from right (only if still mounted)
              gsap.to([priceContainerRef.current, productNameRef.current, productImageRef.current], {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: 'power2.out',
              });
            },
          });
        } catch (e) {
          // Inner catch for immediate animation errors
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [currentProductIndex]);

  const currentProduct = featuredProducts[currentProductIndex] || featuredProducts[0] || {
    id: 'default',
    name: 'Product',
    originalPrice: 0,
    discountedPrice: 0,
    image: undefined
  };
  
  // Try to find in static products first (legacy), otherwise use currentProduct which has the necessary fields mapped from dynamic data
  const product = currentProduct?.id ? (
    products.find(p => p.id.toString() === currentProduct.id) ||
    products.find(p => p.id === parseInt(currentProduct.id)) ||
    currentProduct
  ) : currentProduct;

  // Check if this is the leather/bags theme
  const isLeatherTheme = activeTab === 'leather' || categoryId === 3;

  // Check if this is the jewelry/golden theme
  const isJewelryTheme = activeTab === 'jewelry' || categoryId === 4;

  // Check if this is the fashion/clothing theme
  const isFashionTheme = activeTab === 'fashion' || categoryId === 1;

  // Leather texture pattern using CSS - tan/brown tones
  const leatherTexture = isLeatherTheme ? {
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 90, 43, 0.08) 2px, rgba(139, 90, 43, 0.08) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(101, 67, 33, 0.06) 2px, rgba(101, 67, 33, 0.06) 4px),
      repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.05) 0px, transparent 1px, transparent 2px, rgba(139, 90, 43, 0.05) 2px),
      repeating-linear-gradient(-45deg, rgba(101, 67, 33, 0.05) 0px, transparent 1px, transparent 2px, rgba(101, 67, 33, 0.05) 2px),
      radial-gradient(ellipse at 20% 30%, rgba(180, 130, 70, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(210, 180, 140, 0.1) 0%, transparent 70%)
    `,
    backgroundBlendMode: 'multiply, multiply, overlay, overlay, normal, normal, normal',
  } : {};

  // Golden shiny texture pattern using CSS - rich golden with metallic shine effect
  const goldenTexture = isJewelryTheme ? {
    backgroundImage: `
      radial-gradient(ellipse at 15% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 85% 75%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 50%, rgba(184, 134, 11, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 70%, rgba(218, 165, 32, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
      repeating-linear-gradient(0deg, rgba(184, 134, 11, 0.15) 0px, transparent 1px, transparent 2px, rgba(218, 165, 32, 0.1) 2px),
      repeating-linear-gradient(90deg, rgba(184, 134, 11, 0.12) 0px, transparent 1px, transparent 2px, rgba(218, 165, 32, 0.08) 2px),
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2) 0px, transparent 0.5px, transparent 1.5px, rgba(255, 255, 255, 0.15) 1.5px),
      repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.18) 0px, transparent 0.5px, transparent 1.5px, rgba(255, 255, 255, 0.12) 1.5px)
    `,
    backgroundBlendMode: 'overlay, overlay, multiply, multiply, normal, multiply, multiply, overlay, overlay',
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 6px 6px, 6px 6px, 3px 3px, 3px 3px',
  } : {};

  // Jeans/denim texture pattern using CSS - blue denim fabric effect
  const jeansTexture = isFashionTheme ? {
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(30, 58, 138, 0.08) 1px, rgba(30, 58, 138, 0.08) 2px),
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(37, 99, 235, 0.06) 1px, rgba(37, 99, 235, 0.06) 2px),
      repeating-linear-gradient(45deg, rgba(30, 58, 138, 0.1) 0px, transparent 0.5px, transparent 1px, rgba(30, 58, 138, 0.08) 1px),
      repeating-linear-gradient(-45deg, rgba(37, 99, 235, 0.08) 0px, transparent 0.5px, transparent 1px, rgba(37, 99, 235, 0.06) 1px),
      radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(30, 58, 138, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 70%),
      linear-gradient(90deg, rgba(30, 58, 138, 0.05) 0%, transparent 50%, rgba(30, 58, 138, 0.05) 100%)
    `,
    backgroundBlendMode: 'multiply, multiply, overlay, overlay, normal, normal, normal, normal',
    backgroundSize: '3px 3px, 3px 3px, 2px 2px, 2px 2px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
  } : {};

  return (
    <div
      className="relative w-full overflow-x-hidden"
      style={{
        background: `linear-gradient(to bottom, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]}, ${theme.primary[3]}, ${theme.primary[3]})`,
        paddingTop: '12px',
        paddingBottom: '0px',
        marginTop: 0,
        ...leatherTexture,
        ...goldenTexture,
        ...jeansTexture,
      }}
    >
      {/* HOUSEFULL SALE Banner */}
      <div className="px-4 mb-3 text-center relative" style={{ minHeight: '80px' }}>
        {/* Snowflakes Container */}
        <div
          ref={snowflakesRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ top: 0, bottom: 'auto', height: '100px' }}
        >
          {/* Left side snowflakes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`left-${i}`}
              className="snowflake absolute"
              style={{
                left: `${5 + (i % 4) * 12}%`,
                top: `${(Math.floor(i / 4)) * 30}px`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))' }}>
                {/* Longer, thinner stems */}
                <path d="M12 1V5M12 19V23M3 12H1M23 12H21M20.5 20.5L18.5 18.5M20.5 3.5L18.5 5.5M3.5 20.5L5.5 18.5M3.5 3.5L5.5 5.5M18.5 18.5L16.5 16.5M18.5 5.5L16.5 7.5M5.5 18.5L7.5 16.5M5.5 5.5L7.5 7.5" stroke="rgba(255, 255, 255, 1)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.8" fill="rgba(255, 255, 255, 1)" />
              </svg>
            </div>
          ))}
          {/* Right side snowflakes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`right-${i}`}
              className="snowflake absolute"
              style={{
                right: `${5 + (i % 4) * 12}%`,
                top: `${(Math.floor(i / 4)) * 30}px`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))' }}>
                {/* Longer, thinner stems */}
                <path d="M12 1V5M12 19V23M3 12H1M23 12H21M20.5 20.5L18.5 18.5M20.5 3.5L18.5 5.5M3.5 20.5L5.5 18.5M3.5 3.5L5.5 5.5M18.5 18.5L16.5 16.5M18.5 5.5L16.5 7.5M5.5 18.5L7.5 16.5M5.5 5.5L7.5 7.5" stroke="rgba(255, 255, 255, 1)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.8" fill="rgba(255, 255, 255, 1)" />
              </svg>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-0">
            {/* Left Lightning Bolt */}
            <svg width="28" height="36" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill={isLeatherTheme ? "#D2B48C" : isJewelryTheme ? "#DAA520" : "#FFD700"}
                stroke={isLeatherTheme ? "#8B6F47" : isJewelryTheme ? "#B8860B" : "#FFA500"}
                strokeWidth="0.5"
                style={isJewelryTheme ? { filter: 'drop-shadow(0 0 6px rgba(218, 165, 32, 0.9)) drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))' } : {}}
              />
            </svg>

            {/* HOUSEFULL Text */}
            <h1
              ref={housefullRef}
              className="text-3xl font-black text-white whitespace-pre-line"
              style={{
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                lineHeight: '1.1',
                textShadow:
                  `-2px -2px 0 ${theme.accentColor}, 2px -2px 0 ${theme.accentColor}, -2px 2px 0 ${theme.accentColor}, 2px 2px 0 ${theme.accentColor}, ` +
                  `-2px 0px 0 ${theme.accentColor}, 2px 0px 0 ${theme.accentColor}, 0px -2px 0 ${theme.accentColor}, 0px 2px 0 ${theme.accentColor}, ` +
                  `-1px -1px 0 ${theme.accentColor}, 1px -1px 0 ${theme.accentColor}, -1px 1px 0 ${theme.accentColor}, 1px 1px 0 ${theme.accentColor}, ` +
                  '0px 2px 0px rgba(0, 0, 0, 0.8), 0px 4px 0px rgba(0, 0, 0, 0.6), ' +
                  '0px 6px 0px rgba(0, 0, 0, 0.4), 0px 8px 8px rgba(0, 0, 0, 0.3), ' +
                  '2px 2px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              {bannerText.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="flex justify-center">
                  {line.split('').map((letter, index) => (
                    <span
                      key={`${lineIndex}-${index}`}
                      className="housefull-letter inline-block"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              ))}
            </h1>


            {/* Right Lightning Bolt */}
            <svg width="28" height="36" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" style={{ transform: 'scaleX(-1)' }}>
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill={isLeatherTheme ? "#D2B48C" : isJewelryTheme ? "#DAA520" : "#FFD700"}
                stroke={isLeatherTheme ? "#8B6F47" : isJewelryTheme ? "#B8860B" : "#FFA500"}
                strokeWidth="0.5"
                style={isJewelryTheme ? { filter: 'drop-shadow(0 0 6px rgba(218, 165, 32, 0.9)) drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))' } : {}}
              />
            </svg>
          </div>

          {/* SALE Text */}
          <div className="flex justify-center mb-0.5" style={{ marginTop: '-3px' }}>
            <h2
              ref={saleRef}
              className="text-xl font-black text-white"
              style={{
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                textShadow:
                  `-1.5px -1.5px 0 ${theme.accentColor}, 1.5px -1.5px 0 ${theme.accentColor}, -1.5px 1.5px 0 ${theme.accentColor}, 1.5px 1.5px 0 ${theme.accentColor}, ` +
                  `-1.5px 0px 0 ${theme.accentColor}, 1.5px 0px 0 ${theme.accentColor}, 0px -1.5px 0 ${theme.accentColor}, 0px 1.5px 0 ${theme.accentColor}, ` +
                  `-1px -1px 0 ${theme.accentColor}, 1px -1px 0 ${theme.accentColor}, -1px 1px 0 ${theme.accentColor}, 1px 1px 0 ${theme.accentColor}, ` +
                  '0px 2px 0px rgba(0, 0, 0, 0.8), 0px 4px 0px rgba(0, 0, 0, 0.6), ' +
                  '0px 6px 0px rgba(0, 0, 0, 0.4), 0px 8px 8px rgba(0, 0, 0, 0.3), ' +
                  '2px 2px 2px rgba(0, 0, 0, 0.5)',
              } as React.CSSProperties}
            >
              {/* {theme.saleText} */}
            </h2>
          </div>

          {/* Dates */}
          <div ref={dateRef} className="font-bold text-xs text-center mt-1" style={{ color: 'rgba(255, 255, 255, 1)' }}>
            {saleDateText}
          </div>
        </div>
      </div>

      {/* Hero Banner Carousel - Inserted between HOUSEFULL SALE and Category Cards */}
      {heroBanner && (
        <div className="pl-0 mb-2">
          {heroBanner}
        </div>
      )}

      {/* Main Content: Crazy Deals + Category Cards */}
      <div className="px-4 mt-2 w-full overflow-x-hidden">
        <div ref={containerRef} className="flex gap-2 w-full">
          {/* Crazy Deals Section - Left */}
          <div className="flex-shrink-0 w-[100px] promo-card">
            <div
              className="h-full rounded-lg p-1 flex flex-col items-center justify-between relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 60%), linear-gradient(to bottom, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]})`,
                minHeight: '110px',
              }}
            >
              {/* CRAZY DEALS - Two lines, bigger */}
              <div className="text-center mb-1.5" style={{ marginTop: '4px' }}>
                <div
                  className="text-white font-black leading-tight"
                  style={{
                    fontSize: '13px',
                    fontFamily: 'sans-serif',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.9)',
                    letterSpacing: '0.5px',
                  }}
                >
                  <div>{crazyDealsText.line1}</div>
                  <div>{crazyDealsText.line2}</div>
                </div>
              </div>

              {/* Price Banners - Compact */}
              <div ref={priceContainerRef} className="flex flex-col items-center mb-0.5 relative">
                {/* Original Price - Darker Gray, Smaller Banner */}
                <div className="bg-neutral-600 rounded px-1.5 inline-block relative z-10" style={{ height: 'fit-content', lineHeight: '1', paddingTop: '2px', paddingBottom: '2px' }}>
                  <span className="text-white text-[8px] font-medium line-through leading-none">₹{currentProduct?.originalPrice || 0}</span>
                </div>
                {/* Discounted Price - Theme colored Banner */}
                <div
                  className="rounded px-2 inline-block relative -mt-0.5 z-20"
                  style={{
                    height: 'fit-content',
                    lineHeight: '1',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    backgroundColor: isLeatherTheme ? '#8B6F47' : isJewelryTheme ? '#B8860B' : '#f97316', // Tan brown for leather, rich gold for jewelry, orange for others
                  }}
                >
                  <span className="text-white text-[9px] font-bold leading-none">₹{currentProduct?.discountedPrice || 0}</span>
                </div>
              </div>

              {/* Product Name - Compact */}
              <div ref={productNameRef} className="text-neutral-900 font-black text-[9px] text-center mb-0.5">
                {currentProduct?.name || 'Product'}
              </div>

              {/* Product Thumbnail - Bottom Center, sized to container */}
              <div ref={productImageRef} className="flex-1 flex items-end justify-center w-full" style={{ minHeight: '50px', maxHeight: '65px' }}>
                <div className="w-12 h-16 rounded flex items-center justify-center overflow-visible" style={{ background: 'transparent' }}>
                  {product?.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      style={{
                        mixBlendMode: 'normal',
                        backgroundColor: 'transparent',
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: isLeatherTheme
                          ? 'linear-gradient(to bottom, rgb(245, 222, 179), rgb(222, 184, 135))'
                          : 'linear-gradient(to bottom, rgb(254, 249, 195), rgb(254, 243, 199))'
                      }}
                    >
                      <div
                        className="w-7 h-9 rounded-sm relative"
                        style={{
                          backgroundColor: isLeatherTheme ? 'rgb(210, 180, 140)' : 'rgb(254, 240, 138)'
                        }}
                      >
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/80"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Category Cards Grid - Right */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {categoryCards.map((card, cardIndex) => {
              // If categoryId is provided, use subcategory icons, otherwise use category icons
              let categoryIcons: string[];
              if (categoryId && subcategoryMap[categoryId] && subcategoryMap[categoryId][cardIndex]) {
                categoryIcons = subcategoryMap[categoryId][cardIndex].icons;
              } else {
                categoryIcons = getCategoryIcons(parseInt(card.categoryId || '0'));
              }

              // For subcategories, link stays to main category (they're filters within the same category page)
              const linkTo = categoryId ? `/app/category/${categoryId}` : (card.categoryId ? `/app/category/${card.categoryId}` : '#');

              return (
                <div
                  key={card.id}
                  className="promo-card"
                >
                  <Link
                    to={linkTo}
                    className="group block rounded-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] h-full flex flex-col overflow-hidden relative"
                    style={{
                      minHeight: '90px',
                      background: isLeatherTheme
                        ? `linear-gradient(135deg, rgba(245, 222, 179, 0.9) 0%, rgba(222, 184, 135, 0.85) 50%, rgba(245, 222, 179, 0.9) 100%)`
                        : `linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.85) 100%)`,
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1.5px solid ${rgbToRgba(theme.primary[1], 0.35)}`,
                      boxShadow: `
                        0 4px 6px -1px ${rgbToRgba(theme.primary[1], 0.25)}, 
                        0 2px 4px -1px ${rgbToRgba(theme.primary[0], 0.2)}, 
                        0 0 0 1px ${rgbToRgba(theme.primary[2], 0.15)} inset,
                        0 1px 3px 0 ${rgbToRgba(theme.primary[0], 0.15)},
                        0 0 20px ${rgbToRgba(theme.primary[2], 0.1)}
                      `,
                      ...(isLeatherTheme ? {
                        backgroundImage: `
                          repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(139, 90, 43, 0.1) 1px, rgba(139, 90, 43, 0.1) 2px),
                          repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(101, 67, 33, 0.08) 1px, rgba(101, 67, 33, 0.08) 2px),
                          radial-gradient(ellipse at 30% 40%, rgba(139, 90, 43, 0.2) 0%, transparent 40%),
                          radial-gradient(ellipse at 70% 60%, rgba(101, 67, 33, 0.15) 0%, transparent 40%)
                        `,
                        backgroundBlendMode: 'multiply, multiply, overlay, overlay',
                      } : {}),
                    }}
                  >
                    {/* Discount Banner - Only around text, centered at top - Theme colored */}
                    <div className="w-full flex justify-center" style={{ paddingTop: '0', paddingBottom: '2px' }}>
                      <div
                        className="text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tight text-center inline-block"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        {card.badge}
                      </div>
                    </div>

                    <div className="px-1 pb-1 flex flex-col flex-1 justify-between" style={{ paddingTop: '2px' }}>
                      {/* Category Title */}
                      <div
                        className="font-bold text-center"
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.2',
                          marginBottom: '6px',
                          color: theme.textColor || '#212121',
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {card.title}
                      </div>

                      {/* Product Icons or Dynamic Image */}
                      <div className="flex items-center justify-center gap-1 overflow-hidden" style={{ marginTop: 'auto' }}>
                        {card.productImages && card.productImages.length > 0 ? (
                          <div className="flex gap-1 justify-center w-full">
                            {card.productImages.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="w-7 h-7 rounded bg-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <img src={img} alt="Product" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : card.imageUrl ? (
                          <div className="w-full h-[30px] flex items-center justify-center overflow-hidden rounded bg-white/20">
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="h-full w-auto object-contain mix-blend-multiply"
                            />
                          </div>
                        ) : (
                          categoryIcons.slice(0, 4).map((icon, idx) => (
                            <div
                              key={idx}
                              className="flex-shrink-0 bg-transparent rounded flex items-center justify-center overflow-hidden"
                              style={{ width: '24px', height: '24px', fontSize: '18px' }}
                            >
                              {icon}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

