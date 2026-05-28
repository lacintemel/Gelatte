import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../lib/api';

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  // reviews: { [productId]: [{ id, name, rating, comment, date }] }
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async (productId) => {
    try {
      setLoading(true);
      const res = await api.reviews.getProductReviews(productId);
      if (res.success) {
        // Map backend Review model to frontend shape
        const mapped = res.data.map((r) => ({
          id: r.id,
          name: r.user?.name || 'Misafir',
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
        }));
        setReviews((prev) => ({ ...prev, [productId]: mapped }));
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = useCallback(async (productId, reviewData) => {
    try {
      const res = await api.reviews.createReview(productId, reviewData.rating, reviewData.comment);
      if (res.success) {
        await fetchReviews(productId); // Refresh
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to add review' };
    } catch (err) {
      return { success: false, error: 'Failed to add review' };
    }
  }, [fetchReviews]);

  const getReviews = useCallback(
    (productId) => reviews[productId] || [],
    [reviews]
  );

  const getAverageRating = useCallback(
    (productId) => {
      const productReviews = reviews[productId] || [];
      if (productReviews.length === 0) return 0;
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      return sum / productReviews.length;
    },
    [reviews]
  );

  const getReviewCount = useCallback(
    (productId) => (reviews[productId] || []).length,
    [reviews]
  );

  return (
    <ReviewContext.Provider
      value={{
        fetchReviews,
        addReview,
        getReviews,
        getAverageRating,
        getReviewCount,
        loading,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviews must be used within a ReviewProvider');
  return context;
}
