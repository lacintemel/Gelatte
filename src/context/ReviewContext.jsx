import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ReviewContext = createContext(null);
const STORAGE_KEY = 'gelatte_reviews';

function loadReviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function ReviewProvider({ children }) {
  // reviews: { [productId]: [{ id, name, rating, comment, date }] }
  const [reviews, setReviews] = useState(loadReviews);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const addReview = useCallback((productId, review) => {
    setReviews((prev) => {
      const productReviews = prev[productId] || [];
      return {
        ...prev,
        [productId]: [
          {
            id: `rv_${Date.now()}`,
            ...review,
            date: new Date().toISOString(),
          },
          ...productReviews,
        ],
      };
    });
  }, []);

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
        addReview,
        getReviews,
        getAverageRating,
        getReviewCount,
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
