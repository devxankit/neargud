import { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
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
}

// Subcategory mappings for each main category
const subcategoryMap: Record<number, Array<{ name: string; keywords: string[]; icons: string[] }>> = {
  1: [ // Clothing
    { name: 'T-Shirts & Tops', keywords: ['t-shirt', 'shirt', 'top'], icons: ['👕', '👔', '👚', '🎽'] },
    { name: 'Jeans & Pants', keywords: ['jeans', 'pants', 'trousers'], icons: ['👖', '🩳', '👔', '👕'] },
    { name: 'Dresses & Skirts', keywords: ['dress', 'gown', 'skirt', 'maxi'], icons: ['👗', '👘', '👙', '👚'] },
    { name: 'Jackets & Outerwear', keywords: ['jacket', 'blazer', 'cardigan', 'sweater'], icons: ['🧥', '🧣', '👔', '🧤'] },
  ],
  2: [ // Footwear
    { name: 'Sneakers', keywords: ['sneakers', 'sneaker'], icons: ['👟', '🏃', '⚽', '🎽'] },
    { name: 'Boots', keywords: ['boots', 'boot'], icons: ['🥾', '👢', '🧥', '🎒'] },
    { name: 'Heels', keywords: ['heels', 'heel', 'pumps'], icons: ['👠', '💃', '✨', '👗'] },
    { name: 'Casual Shoes', keywords: ['shoes', 'flats', 'loafers'], icons: ['🥿', '👞', '👟', '👠'] },
  ],
  3: [ // Bags
    { name: 'Handbags', keywords: ['handbag', 'bag'], icons: ['👜', '💼', '👛', '🛍️'] },
    { name: 'Crossbody Bags', keywords: ['crossbody'], icons: ['👝', '👜', '💼', '🎒'] },
    { name: 'Backpacks', keywords: ['backpack', 'back pack'], icons: ['🎒', '🏃', '🎓', '📚'] },
    { name: 'Tote Bags', keywords: ['tote'], icons: ['🛍️', '👜', '👛', '💼'] },
  ],
  4: [ // Jewelry
    { name: 'Necklaces', keywords: ['necklace'], icons: ['📿', '💎', '✨', '👑'] },
    { name: 'Watches', keywords: ['watch', 'wristwatch'], icons: ['⌚', '⏰', '💫', '✨'] },
    { name: 'Rings', keywords: ['ring'], icons: ['💍', '💎', '✨', '👑'] },
    { name: 'Bracelets', keywords: ['bracelet', 'bangle'], icons: ['📿', '💫', '✨', '💎'] },
  ],
  5: [ // Accessories
    { name: 'Sunglasses', keywords: ['sunglasses', 'glasses'], icons: ['🕶️', '👓', '😎', '✨'] },
    { name: 'Belts', keywords: ['belt'], icons: ['👔', '🧥', '💼', '👖'] },
    { name: 'Scarves', keywords: ['scarf'], icons: ['🧣', '🧥', '❄️', '✨'] },
    { name: 'Hats & Caps', keywords: ['hat', 'cap'], icons: ['🎩', '🧢', '👒', '🎓'] },
  ],
  6: [ // Athletic
    { name: 'Running Gear', keywords: ['running', 'athletic'], icons: ['🏃', '👟', '🎽', '⚡'] },
    { name: 'Training Wear', keywords: ['training', 'sporty'], icons: ['🏋️', '💪', '🎽', '⚽'] },
    { name: 'Sports Equipment', keywords: ['track', 'sport'], icons: ['⚽', '🏀', '🏐', '🎾'] },
    { name: 'Fitness Accessories', keywords: ['fitness'], icons: ['🏋️', '💪', '⚡', '🎯'] },
  ],
};

// Get category cards based on active tab or categoryId - using actual categories
const getCategoryCards = (activeTab: string, categoryId?: number): PromoCard[] => {
  // If categoryId is provided, show subcategories/types within that category
  if (categoryId && subcategoryMap[categoryId]) {
    const subcategories = subcategoryMap[categoryId];
    return subcategories.map((subcat, index) => {
      // Get products matching these keywords
      const matchingProducts = products.filter((product) => {
        const productName = product.name.toLowerCase();
        return subcat.keywords.some((keyword) => productName.includes(keyword));
      });

      const discountedProducts = matchingProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
      const maxDiscount = discountedProducts.length > 0
        ? Math.max(...discountedProducts.map(calculateDiscount))
        : 25 + (index * 5); // Fallback discount that varies

      return {
        id: `subcategory-${categoryId}-${index}`,
        badge: `Up to ${maxDiscount}% OFF`,
        title: subcat.name,
        categoryId: categoryId.toString(), // Link to main category
        bgColor: 'bg-red-50',
      };
    });
  }

  // Otherwise, use activeTab logic
  if (activeTab === 'fashion') {
    // Fashion tab - show all fashion categories
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
        bgColor: 'bg-purple-50',
      };
    });
  } else if (activeTab === 'sports') {
    // Sports tab - show athletic category
    const athleticCategory = categories.find(c => c.id === 6);
    if (athleticCategory) {
      const categoryProducts = getCategoryProducts(6);
      const discountedProducts = categoryProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
      const maxDiscount = discountedProducts.length > 0
        ? Math.max(...discountedProducts.map(calculateDiscount))
        : 30;

      return [{
        id: 'category-6',
        badge: `Up to ${maxDiscount}% OFF`,
        title: athleticCategory.name,
        categoryId: '6',
        bgColor: 'bg-blue-50',
      }];
    }
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

export default function PromoStrip({ activeTab = 'all', heroBanner, categoryName, categoryId }: PromoStripProps) {
  const { content } = useContentStore();
  const { housefullText = 'HOUSEFULL', saleDateText = '30TH NOV, 2025 - 7TH DEC, 2025', crazyDealsText = { line1: 'CRAZY', line2: 'DEALS' } } = content?.homepage?.promoStrip || {};

  const theme = getTheme(activeTab);
  // Use category name if provided, otherwise use theme's banner text
  // If activeTab is 'all', we prefer the editable housefullText from store
  const bannerText = categoryName ? categoryName.toUpperCase() : (activeTab === 'all' ? housefullText : theme.bannerText);
  const categoryCards = getCategoryCards(activeTab, categoryId);
  const featuredProducts = getFeaturedProducts(activeTab, categoryId);

  // Get light background color for cards based on theme (use the lightest primary color with high opacity)
  const cardBackground = rgbToRgba(theme.primary[3], 0.9); // Use primary[3] which is the lightest
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

    const ctx = gsap.context(() => {
      const cards = container.querySelectorAll('.promo-card');
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
    }, container);

    return () => ctx.revert();
  }, []);

  // Snowflake animation
  useLayoutEffect(() => {
    const snowflakesContainer = snowflakesRef.current;
    if (!snowflakesContainer) return;

    const snowflakes = snowflakesContainer.querySelectorAll('.snowflake');

    snowflakes.forEach((snowflake, index) => {
      const delay = index * 0.3;
      const duration = 3 + Math.random() * 2; // 3-5 seconds
      const xOffset = (Math.random() - 0.5) * 40; // Random horizontal drift

      gsap.set(snowflake, {
        y: -20,
        x: xOffset,
        opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0 opacity for better visibility
        scale: 0.6 + Math.random() * 0.4, // 0.6-1.0 scale for better visibility
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

    return () => {
      snowflakes.forEach(snowflake => {
        gsap.killTweensOf(snowflake);
      });
    };
  }, []);

  // HOUSEFULL SALE animation: shrink down, pop out, then letter-by-letter pop - repeats every few seconds
  useLayoutEffect(() => {
    const housefullContainer = housefullRef.current;
    const saleText = saleRef.current;
    const dateText = dateRef.current;
    if (!housefullContainer) return;

    const letters = housefullContainer.querySelectorAll('.housefull-letter');

    const animate = () => {
      // Animation timeline
      const tl = gsap.timeline();

      // Set initial state - start at normal size
      gsap.set([housefullContainer, saleText, dateText], { scale: 1, opacity: 1 });

      // Step 1: Shrink down (going into a hole) - all elements together
      tl.to([housefullContainer, saleText, dateText], {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      })
        // Step 2: Pop out with bounce - all elements together
        .to([housefullContainer, saleText, dateText], {
          scale: 1.2,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        })
        // Step 3: Pop back to normal size - all elements together
        .to([housefullContainer, saleText, dateText], {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        })
        // Step 4: Wait a bit before letter animation
        .to({}, { duration: 0.4 })
        // Step 5: Letter-by-letter pop up animation (first to last)
        .to(letters, {
          y: -15,
          duration: 0.2,
          stagger: 0.06,
          ease: 'power2.out',
        })
        // Step 6: Letters go back to place
        .to(letters, {
          y: 0,
          duration: 0.2,
          stagger: 0.06,
          ease: 'power2.in',
        })
        // Step 7: Wait before repeating
        .to({}, {
          duration: 2,
          onComplete: () => {
            // Repeat animation after delay
            setTimeout(animate, 1000);
          }
        });
    };

    // Start initial animation
    animate();

    return () => {
      gsap.killTweensOf([housefullContainer, saleText, dateText, letters]);
    };
  }, []);

  // Product rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 3000); // Change product every 3 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  // Animate product change with left swipe
  useEffect(() => {
    if (priceContainerRef.current && productNameRef.current && productImageRef.current) {
      // Swipe left (out)
      try {
        gsap.to([priceContainerRef.current, productNameRef.current, productImageRef.current], {
          opacity: 0,
          x: -30,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            // Check if refs are still valid before setting state
            if (!priceContainerRef.current || !productNameRef.current || !productImageRef.current) return;

            // Reset position and update content
            gsap.set([priceContainerRef.current, productNameRef.current, productImageRef.current], {
              x: 30,
              opacity: 0,
            });

            // Swipe in from right
            gsap.to([priceContainerRef.current, productNameRef.current, productImageRef.current], {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: 'power2.out',
            });
          },
        });
      } catch (e) {
        console.warn("GSAP animation error:", e);
      }
    }
  }, [currentProductIndex]);

  const currentProduct = featuredProducts[currentProductIndex];
  const product = products.find(p => p.id.toString() === currentProduct.id) || products.find(p => p.id === parseInt(currentProduct.id));

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
              className="text-3xl font-black text-white"
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
              } as React.CSSProperties}
            >
              {bannerText.split('').map((letter, index) => (
                <span
                  key={index}
                  className="housefull-letter inline-block"
                >
                  {letter}
                </span>
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
              {theme.saleText}
            </h2>
          </div>

          {/* Dates */}
          <div ref={dateRef} className="font-bold text-xs text-center mt-1" style={{ color: 'rgba(255, 255, 255, 1)' }}>
            {saleDateText}
          </div>
        </div>
      </div>

      {/* Hero Banner Carousel - Inserted between HOUSEFULL SALE and CRAZY DEALS */}
      {heroBanner && (
        <div className="pl-4 mb-2">
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
                  <span className="text-white text-[8px] font-medium line-through leading-none">₹{currentProduct.originalPrice}</span>
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
                  <span className="text-white text-[9px] font-bold leading-none">₹{currentProduct.discountedPrice}</span>
                </div>
              </div>

              {/* Product Name - Compact */}
              <div ref={productNameRef} className="text-neutral-900 font-black text-[9px] text-center mb-0.5">
                {currentProduct.name}
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

                      {/* Product Icons - Horizontal Layout */}
                      <div className="flex items-center justify-center gap-1 overflow-hidden" style={{ marginTop: 'auto' }}>
                        {categoryIcons.slice(0, 4).map((icon, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 bg-transparent rounded flex items-center justify-center overflow-hidden"
                            style={{ width: '24px', height: '24px', fontSize: '18px' }}
                          >
                            {icon}
                          </div>
                        ))}
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

