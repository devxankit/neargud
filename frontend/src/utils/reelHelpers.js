// Helper functions for managing vendor reels

// Mock Data for Initial State
export const MOCK_VENDOR_REELS = [
  {
    id: 101,
    vendorId: 1, // Assumption: Mock vendor ID is 1
    vendorName: "Fashion Hub",
    productId: 1, // Mapped to 'Classic White T-Shirt'
    productName: "Classic White T-Shirt",
    productPrice: 24.99,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    description: "Classic white tee for every casual occasion.",
    likes: 124,
    comments: 18,
    shares: 45,
    views: 1205,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    vendorId: 1,
    vendorName: "Fashion Hub",
    productId: 9, // Mapped to 'Denim Jacket'
    productName: "Denim Jacket",
    productPrice: 69.99,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    description: "Stylish denim jacket for all seasons. Premium quality.",
    likes: 89,
    comments: 12,
    shares: 23,
    views: 850,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 103,
    vendorId: 1,
    vendorName: "Fashion Hub",
    productId: 7, // Mapped to 'Wool Winter Scarf'
    productName: "Wool Winter Scarf",
    productPrice: 34.99,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400",
    description: "Stay warm with our premium wool scarf.",
    likes: 256,
    comments: 45,
    shares: 89,
    views: 3400,
    status: 'active',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Get all reels for a vendor
export const getVendorReels = (vendorId) => {
  const savedReels = localStorage.getItem('vendor-reels');
  let allReels = savedReels ? JSON.parse(savedReels) : [];

  // If no reels in storage, fallback to mock data (without persisting to avoid zombie data issues)
  // Logic: If I haven't edited/deleted anything, I see mock data.
  // When adding, we merge/copy mock data if needed or just start fresh.
  // For this demo, let's include mock data if empty.

  if (allReels.length === 0) {
    return MOCK_VENDOR_REELS.filter((reel) => reel.vendorId === parseInt(vendorId));
  }

  return allReels.filter((reel) => reel.vendorId === parseInt(vendorId));
};

// Get a single reel by ID
export const getReelById = (reelId) => {
  const savedReels = localStorage.getItem('vendor-reels');
  const allReels = savedReels ? JSON.parse(savedReels) : MOCK_VENDOR_REELS;
  return allReels.find((reel) => reel.id === parseInt(reelId));
};

// Add a new reel
export const addVendorReel = (reelData) => {
  const savedReels = localStorage.getItem('vendor-reels');
  // Initialize with MOCK data if storage is empty so we don't lose the mock ones when adding the first real one
  const allReels = savedReels ? JSON.parse(savedReels) : [...MOCK_VENDOR_REELS];

  const newReel = {
    id: Date.now(), // Simple ID generation
    ...reelData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: reelData.status || 'draft',
    likes: reelData.likes || 0,
    comments: reelData.comments || 0,
    shares: reelData.shares || 0,
    views: reelData.views || 0,
  };

  allReels.unshift(newReel); // Add to top
  localStorage.setItem('vendor-reels', JSON.stringify(allReels));
  return newReel;
};

// Update an existing reel
export const updateVendorReel = (reelId, updatedData) => {
  const savedReels = localStorage.getItem('vendor-reels');
  const allReels = savedReels ? JSON.parse(savedReels) : [...MOCK_VENDOR_REELS];

  const index = allReels.findIndex((reel) => reel.id === parseInt(reelId));
  if (index === -1) {
    throw new Error('Reel not found');
  }

  allReels[index] = {
    ...allReels[index],
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem('vendor-reels', JSON.stringify(allReels));
  return allReels[index];
};

// Delete a reel
export const deleteVendorReel = (reelId) => {
  const savedReels = localStorage.getItem('vendor-reels');
  const allReels = savedReels ? JSON.parse(savedReels) : [...MOCK_VENDOR_REELS];

  const filteredReels = allReels.filter((reel) => reel.id !== parseInt(reelId));
  localStorage.setItem('vendor-reels', JSON.stringify(filteredReels));
  return true;
};

// Get all active reels (for user app)
// Get all active reels (for user app)
export const getActiveReels = () => {
  const savedReels = localStorage.getItem('vendor-reels');
  let allReels = savedReels ? JSON.parse(savedReels) : MOCK_VENDOR_REELS;

  // Patch local storage data with updated mock fields if mock IDs exist in storage
  allReels = allReels.map(reel => {
    const mockMatch = MOCK_VENDOR_REELS.find(m => m.id === reel.id);
    if (mockMatch) {
      // Merge mock data to ensure new fields like productId exist, but keep user edits if any (though for structural fixes, mock takes precedence for missing fields)
      return { ...mockMatch, ...reel, productId: mockMatch.productId, productName: mockMatch.productName };
    }
    return reel;
  });

  return allReels.filter((reel) => reel.status === 'active');
};
