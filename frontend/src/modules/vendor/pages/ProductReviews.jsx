import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiSearch, FiEye, FiMessageSquare, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { useVendorStore } from '../store/vendorStore';
import { useVendorReviewStore } from '../store/vendorReviewStore';
import toast from 'react-hot-toast';

const ProductReviews = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const { getVendorProducts } = useVendorStore();
  const {
    reviews,
    fetchReviews,
    respond,
    moderate,
    isLoading,
    total
  } = useVendorReviewStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');

  const vendorId = vendor?.id || vendor?._id;

  // Fetch reviews from API
  useEffect(() => {
    if (vendorId) {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedRating !== 'all') params.rating = selectedRating;
      if (selectedProduct !== 'all') params.productId = selectedProduct;

      const debounceTimer = setTimeout(() => {
        fetchReviews(params);
      }, searchQuery ? 500 : 0);

      return () => clearTimeout(debounceTimer);
    }
  }, [vendorId, searchQuery, selectedRating, selectedProduct, fetchReviews]);

  const vendorProducts = vendorId ? getVendorProducts(vendorId) : [];

  const handleResponse = async (reviewId) => {
    try {
      if (!responseText.trim()) return;
      await respond(reviewId, responseText);
      setSelectedReview(null);
      setResponseText('');
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const handleModerate = async (reviewId, action) => {
    try {
      if (!reviewId) return;
      await moderate(reviewId, action);
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.productId?.image && (
            <img src={row.productId.image} className="w-8 h-8 rounded object-cover" alt="" />
          )}
          <div>
            <p className="font-medium text-gray-800">{row.productId?.name || value || 'Unknown Product'}</p>
            <p className="text-[10px] text-gray-400">ID: {row.productId?._id || row.productId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-800">{value || row.userId?.name || 'Customer'}</p>
          {(row.customerEmail || row.userId?.email) && (
            <p className="text-xs text-gray-500">{row.customerEmail || row.userId?.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => renderStars(value),
    },
    {
      key: 'comment',
      label: 'Review',
      sortable: false,
      render: (value, row) => (
        <p className="max-w-xs truncate text-sm text-gray-600">{row.review || value || 'No comment'}</p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'approved' ? 'success' : value === 'hidden' ? 'warning' : 'pending'}>
          {value || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value || new Date()).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedReview(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View & Respond">
            <FiEye />
          </button>
          {row.status !== 'hidden' && (
            <button
              onClick={() => handleModerate(row._id || row.id, 'hide')}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Hide Review">
              <FiX />
            </button>
          )}
        </div>
      ),
    },
  ];

  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating) stats[review.rating] = (stats[review.rating] || 0) + 1;
    });
    return stats;
  }, [reviews]);

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view reviews</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Product Reviews</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage customer reviews and ratings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm text-gray-600">{rating} Star</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">{ratingStats[rating] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            options={[
              { value: 'all', label: 'All Ratings' },
              { value: '5', label: '5 Stars' },
              { value: '4', label: '4 Stars' },
              { value: '3', label: '3 Stars' },
              { value: '2', label: '2 Stars' },
              { value: '1', label: '1 Star' },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <AnimatedSelect
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            options={[
              { value: 'all', label: 'All Products' },
              ...vendorProducts.map((p) => ({
                value: (p._id || p.id).toString(),
                label: p.name,
              })),
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <div className="w-full sm:w-auto">
            <ExportButton
              data={reviews}
              headers={[
                { label: 'Product', accessor: (row) => row.productId?.name || row.productName },
                { label: 'Customer', accessor: (row) => row.customerName || row.userId?.name },
                { label: 'Rating', accessor: (row) => row.rating },
                { label: 'Review', accessor: (row) => row.review || row.comment },
                { label: 'Status', accessor: (row) => row.status },
                { label: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
              ]}
              filename="vendor-reviews"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      {reviews.length > 0 ? (
        <DataTable
          data={reviews}
          columns={columns}
          pagination={true}
          totalItems={total}
          itemsPerPage={10}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No reviews found</p>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
          onClick={() => {
            setSelectedReview(null);
            setResponseText('');
          }}>
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Review Details</h3>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Product</label>
                <p className="text-base text-gray-800 mt-1">{selectedReview.productName}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Customer</label>
                <p className="text-base text-gray-800 mt-1">{selectedReview.customerName}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Rating</label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Review</label>
                <p className="text-base text-gray-800 mt-1 whitespace-pre-wrap">
                  {selectedReview.comment || 'No comment provided'}
                </p>
              </div>

              {selectedReview.vendorResponse && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Your Response</label>
                  <p className="text-base text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg">
                    {selectedReview.vendorResponse}
                  </p>
                </div>
              )}

              {!selectedReview.vendorResponse && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Respond to Review</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="4"
                  />
                  <button
                    onClick={() => handleResponse(selectedReview._id || selectedReview.id)}
                    disabled={!responseText.trim()}
                    className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiMessageSquare className="inline mr-2" />
                    Submit Response
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200 gap-2">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductReviews;

