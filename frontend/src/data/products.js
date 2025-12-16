export const products = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    unit: 'Piece',
    price: 24.99,
    originalPrice: 29.99,
    image: '/images/products/white t shirt.png',
    images: [
      '/images/products/white t shirt.png',
      '/images/products/white t shirt.png',
      '/images/products/white t shirt.png',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      prices: {
        'S': 24.99,
        'M': 24.99,
        'L': 26.99,
        'XL': 26.99,
      },
      defaultVariant: { size: 'M' },
    },
    flashSale: true,
    stock: 'in_stock',
    stockQuantity: 45,
    rating: 4.5,
    reviewCount: 128,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 2,
    name: 'Slim Fit Blue Jeans',
    unit: 'Piece',
    price: 79.99,
    originalPrice: 89.99,
    image: '/images/products/blue jeans.png',
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 120,
    rating: 4.2,
    reviewCount: 89,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 3,
    name: 'Floral Summer Dress',
    unit: 'Piece',
    price: 59.99,
    image: '/images/products/summer dress.png',
    flashSale: false,
    stock: 'low_stock',
    stockQuantity: 8,
    rating: 4.0,
    reviewCount: 45,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 4,
    name: 'Leather Crossbody Bag',
    unit: 'Piece',
    price: 89.99,
    originalPrice: 119.99,
    image: '/images/products/leather bag.png',
    flashSale: true,
    stock: 'in_stock',
    stockQuantity: 65,
    rating: 4.7,
    reviewCount: 156,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 5,
    name: 'Casual Canvas Sneakers',
    unit: 'Pair',
    price: 49.99,
    image: '/images/products/sneakers.png',
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 30,
    rating: 4.3,
    reviewCount: 72,
    vendorId: 2,
    vendorName: 'Tech Gear Pro',
  },
  {
    id: 6,
    name: 'Designer Sunglasses',
    unit: 'Piece',
    price: 125.99,
    originalPrice: 179.99,
    image: '/images/products/sunglass.png',
    images: [
      '/images/products/sunglass.png',
      '/images/products/sunglass.png',
      '/images/products/sunglass.png',
    ],
    variants: {
      colors: ['Black', 'Brown', 'Tortoise', 'Silver'],
      prices: {
        Black: 125.99,
        Brown: 129.99,
        Tortoise: 135.99,
        Silver: 139.99,
      },
      defaultVariant: { color: 'Black' },
    },
    flashSale: true,
    stock: 'in_stock',
    stockQuantity: 15,
    rating: 4.8,
    reviewCount: 234,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 7,
    name: 'Wool Winter Scarf',
    unit: 'Piece',
    price: 34.99,
    image: '/images/products/winter scarf.png',
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 200,
    rating: 4.1,
    reviewCount: 112,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 8,
    name: 'Formal Blazer Jacket',
    unit: 'Piece',
    price: 149.99,
    originalPrice: 199.99,
    image: '/images/products/blazer.png',
    flashSale: true,
    stock: 'low_stock',
    stockQuantity: 5,
    rating: 4.6,
    reviewCount: 98,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 9,
    name: 'Denim Jacket',
    unit: 'Piece',
    price: 69.99,
    image: '/images/products/denim jacket.png',
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 85,
    rating: 4.4,
    reviewCount: 67,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 10,
    name: 'High Heel Pumps',
    unit: 'Pair',
    price: 89.99,
    originalPrice: 129.99,
    image: '/images/products/heals.png',
    flashSale: true,
    stock: 'in_stock',
    stockQuantity: 55,
    rating: 4.5,
    reviewCount: 143,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 11,
    name: 'Sporty Track Pants',
    unit: 'Piece',
    price: 54.99,
    originalPrice: 69.99,
    image: '/images/products/track pants.png',
    images: [
      '/images/products/track pants.png',
      '/images/products/track pants.png',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      prices: {
        'S': 54.99,
        'M': 54.99,
        'L': 56.99,
        'XL': 56.99,
        'XXL': 59.99,
      },
      defaultVariant: { size: 'M' },
    },
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 42,
    rating: 4.3,
    reviewCount: 189,
    vendorId: 2,
    vendorName: 'Tech Gear Pro',
  },
  {
    id: 12,
    name: 'Knit Cardigan Sweater',
    unit: 'Piece',
    price: 74.99,
    originalPrice: 99.99,
    image: '/images/products/sweater.png',
    flashSale: false,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 78,
    rating: 4.6,
    reviewCount: 201,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 13,
    name: 'Leather Ankle Boots',
    unit: 'Pair',
    price: 119.99,
    image: '/images/products/leather boots.png',
    flashSale: false,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 95,
    rating: 4.4,
    reviewCount: 167,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 14,
    name: 'Designer Wristwatch',
    unit: 'Piece',
    price: 249.99,
    originalPrice: 349.99,
    image: '/images/products/stylish watch.png',
    flashSale: false,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 150,
    rating: 4.7,
    reviewCount: 278,
    vendorId: 2,
    vendorName: 'Tech Gear Pro',
  },
  {
    id: 15,
    name: 'Silk Evening Gown',
    unit: 'Piece',
    price: 189.99,
    image: '/images/products/gown.png',
    flashSale: false,
    stock: 'in_stock',
    stockQuantity: 28,
    rating: 4.2,
    reviewCount: 94,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 16,
    name: 'Casual Flannel Shirt',
    unit: 'Piece',
    price: 44.99,
    originalPrice: 59.99,
    image: '/images/products/shirt.png',
    flashSale: true,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 60,
    rating: 4.5,
    reviewCount: 145,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 17,
    name: 'Boho Maxi Skirt',
    unit: 'Piece',
    price: 64.99,
    originalPrice: 79.99,
    image: '/images/products/maxi.png',
    flashSale: true,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 88,
    rating: 4.6,
    reviewCount: 192,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 18,
    name: 'Statement Necklace',
    unit: 'Piece',
    price: 39.99,
    originalPrice: 49.99,
    image: '/images/products/neckless.png',
    flashSale: true,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 35,
    rating: 4.8,
    reviewCount: 256,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
  {
    id: 19,
    name: 'Athletic Running Shoes',
    unit: 'Pair',
    price: 94.99,
    originalPrice: 129.99,
    image: '/images/products/athlatic shoes.png',
    flashSale: true,
    isNew: true,
    stock: 'low_stock',
    stockQuantity: 12,
    rating: 4.4,
    reviewCount: 178,
    vendorId: 2,
    vendorName: 'Tech Gear Pro',
  },
  {
    id: 20,
    name: 'Classic Leather Belt',
    unit: 'Piece',
    price: 34.99,
    originalPrice: 49.99,
    image: '/images/products/belt.png',
    flashSale: true,
    isNew: true,
    stock: 'in_stock',
    stockQuantity: 52,
    rating: 4.5,
    reviewCount: 134,
    vendorId: 1,
    vendorName: 'Fashion Hub',
  },
];

export const getMostPopular = () => products.slice(0, 10);
export const getTrending = () => products.slice(10, 15);
export const getFlashSale = () => products.filter((p) => p.flashSale);
export const getProductById = (id) => products.find((p) => p.id === parseInt(id));

// Get all products with offers (discounted products)
export const getOffers = () => {
  return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
};

// Get daily deals (time-limited offers, can be subset of flash sale or special products)
export const getDailyDeals = () => {
  // For now, return a mix of flash sale products and products with good discounts
  const flashSaleProducts = products.filter((p) => p.flashSale);
  const discountedProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price && !p.flashSale
  );
  // Combine and return unique products
  const allDeals = [...flashSaleProducts, ...discountedProducts.slice(0, 5)];
  return allDeals.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));
};

// Get similar/recommended products
export const getSimilarProducts = (currentProductId, limit = 6) => {
  const currentProduct = getProductById(currentProductId);
  if (!currentProduct) return [];

  // Filter out current product
  let similar = products.filter((p) => p.id !== currentProduct.id);

  // Try to find products in similar price range (±30%)
  const priceRange = {
    min: currentProduct.price * 0.7,
    max: currentProduct.price * 1.3,
  };

  // First, try to get products in similar price range
  let priceSimilar = similar.filter(
    (p) => p.price >= priceRange.min && p.price <= priceRange.max
  );

  // If we have enough products in price range, use them
  if (priceSimilar.length >= limit) {
    // Shuffle and take limit
    return priceSimilar.sort(() => Math.random() - 0.5).slice(0, limit);
  }

  // Otherwise, mix price-similar with other products
  const remaining = limit - priceSimilar.length;
  const otherProducts = similar
    .filter((p) => !priceSimilar.some((ps) => ps.id === p.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, remaining);

  return [...priceSimilar, ...otherProducts].slice(0, limit);
};

// Get new arrivals (products marked as new)
export const getNewArrivals = (limit = 8) => {
  return products.filter((p) => p.isNew).slice(0, limit);
};

// Get recommended products based on user behavior
export const getRecommendedProducts = (limit = 6) => {
  // Try to get wishlist and cart data from localStorage
  let wishlistItems = [];
  let cartItems = [];
  
  try {
    const wishlistStorage = localStorage.getItem('wishlist-storage');
    if (wishlistStorage) {
      const parsed = JSON.parse(wishlistStorage);
      wishlistItems = parsed.state?.items || [];
    }
    
    const cartStorage = localStorage.getItem('cart-storage');
    if (cartStorage) {
      const parsed = JSON.parse(cartStorage);
      cartItems = parsed.state?.items || [];
    }
  } catch (error) {
    // If localStorage access fails, continue with empty arrays
  }

  let recommended = [];
  const usedIds = new Set();

  // 1. Get products similar to wishlist items
  if (wishlistItems.length > 0) {
    wishlistItems.forEach((item) => {
      const similar = getSimilarProducts(item.id, 2);
      similar.forEach((product) => {
        if (!usedIds.has(product.id) && !wishlistItems.some((w) => w.id === product.id)) {
          recommended.push(product);
          usedIds.add(product.id);
        }
      });
    });
  }

  // 2. Get products similar to cart items
  if (cartItems.length > 0) {
    cartItems.forEach((item) => {
      const similar = getSimilarProducts(item.id, 2);
      similar.forEach((product) => {
        if (!usedIds.has(product.id) && !cartItems.some((c) => c.id === product.id)) {
          recommended.push(product);
          usedIds.add(product.id);
        }
      });
    });
  }

  // 3. Fill remaining slots with trending products
  const trending = getTrending();
  trending.forEach((product) => {
    if (recommended.length < limit && !usedIds.has(product.id)) {
      recommended.push(product);
      usedIds.add(product.id);
    }
  });

  // 4. Fill remaining slots with popular products
  if (recommended.length < limit) {
    const popular = getMostPopular();
    popular.forEach((product) => {
      if (recommended.length < limit && !usedIds.has(product.id)) {
        recommended.push(product);
        usedIds.add(product.id);
      }
    });
  }

  // 5. If still not enough, add any remaining products
  if (recommended.length < limit) {
    products.forEach((product) => {
      if (recommended.length < limit && !usedIds.has(product.id)) {
        recommended.push(product);
        usedIds.add(product.id);
      }
    });
  }

  // Return products in their determined priority order (wishlist -> cart -> trending -> popular)
  // No random shuffle to maintain stability across renders
  return recommended.slice(0, limit);
};

