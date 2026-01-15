export const getAvailableSlots = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { slots: [], settings: {} },
    message: 'Booking system is currently managed by direct admin upload.'
  });
};

export const createBannerBooking = async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Direct hero banner booking is currently disabled. Please contact admin for banner placements.'
  });
};

export const getMyBookings = async (req, res) => {
  res.status(200).json({
    success: true,
    data: []
  });
};

export const confirmPayment = async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Payment system for banners is disabled.'
  });
};

export const cancelBooking = async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Booking system is disabled.'
  });
};

export const getBookingDetails = async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Booking details not found.'
  });
};
