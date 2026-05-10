import { useState } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

/* ── Star Rating Input ── */
function StarRating({ rating, onRate, size = 'w-6 h-6' }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-200 hover:scale-110"
        >
          <Star
            className={`${size} transition-colors duration-200 ${
              star <= (hover || rating)
                ? 'text-gold fill-current'
                : 'text-cream-dark'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ── Review Card ── */
function ReviewCard({ review, t }) {
  const date = new Date(review.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="p-5 rounded-xl bg-ivory border border-cream-dark/15 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
            <User className="w-5 h-5 text-warm-gray" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-espresso">{review.name}</p>
            <p className="text-[11px] text-warm-gray">{formattedDate}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-gold fill-current' : 'text-cream-dark'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-walnut-light leading-relaxed">{review.comment}</p>
    </div>
  );
}

/* ── Product Reviews Section ── */
export default function ProductReviews({ productId }) {
  const { addReview, getReviews, getAverageRating, getReviewCount } = useReviews();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const reviews = getReviews(productId);
  const avgRating = getAverageRating(productId);
  const reviewCount = getReviewCount(productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating === 0) return;

    addReview(productId, { name: name.trim(), rating, comment: comment.trim() });
    addToast(t('rv_submitted'), 'success');
    setName('');
    setRating(0);
    setComment('');
    setShowForm(false);
  };

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: reviewCount > 0 ? (reviews.filter((r) => r.rating === star).length / reviewCount) * 100 : 0,
  }));

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
      <div className="luxury-divider-wide mx-auto mb-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-accent text-sm tracking-[0.15em] uppercase text-gold block mb-1">
            {t('rv_title')}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso">
            {t('rv_title')} ({reviewCount})
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {t('rv_write')}
        </button>
      </div>

      {/* Stats + Form Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Rating Summary */}
        <div className="p-6 rounded-2xl bg-ivory border border-cream-dark/15">
          <div className="text-center mb-5">
            <span className="font-display text-5xl font-bold text-espresso">
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </span>
            <div className="flex justify-center gap-0.5 mt-2 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-gold fill-current' : 'text-cream-dark'}`}
                />
              ))}
            </div>
            <p className="text-xs text-warm-gray">
              {t('rv_based_on')} {reviewCount} {t('rv_reviews_count')}
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-2">
            {distribution.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs font-medium text-walnut w-3">{star}</span>
                <Star className="w-3 h-3 text-gold fill-current" />
                <div className="flex-1 h-2 bg-cream-dark/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[11px] text-warm-gray w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form (conditionally shown) */}
        {showForm && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-ivory border border-cream-dark/15 animate-fade-in-up">
            <h3 className="font-display text-lg font-semibold text-espresso mb-5">{t('rv_write')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
                  {t('rv_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('rv_name_ph')}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
                  {t('rv_rating')}
                </label>
                <StarRating rating={rating} onRate={setRating} />
              </div>

              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
                  {t('rv_comment')}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('rv_comment_ph')}
                  rows={4}
                  className="form-input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !comment.trim() || rating === 0}
                className="w-full py-3.5 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {t('rv_submit')}
              </button>
            </form>
          </div>
        )}

        {/* No form placeholder */}
        {!showForm && (
          <div className="lg:col-span-2" />
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} t={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-warm-gray" />
          </div>
          <p className="font-display text-lg text-espresso mb-2">{t('rv_no_reviews')}</p>
          <p className="text-warm-gray text-sm">{t('rv_be_first')}</p>
        </div>
      )}
    </section>
  );
}
