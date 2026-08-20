import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';
import { reviewApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  onReviewAdded: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  reviews,
  rating,
  reviewCount,
  onReviewAdded,
}) => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please log in to submit your product review.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewApi.createReview({
        productId,
        rating: selectedRating,
        comment: comment.trim() || undefined,
      });

      if (res.data.success) {
        success('Review posted! Thank you for supporting our farmers. 🌾');
        setComment('');
        setShowForm(false);
        onReviewAdded();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Rating Breakdown */}
      <div className="bg-brand-50/50 border border-brand-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-sm">
            <span className="text-4xl font-extrabold text-brand-800">
              {rating > 0 ? rating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center text-amber-500 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(rating || 5) ? 'fill-current' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-500 block mt-1">
              {reviewCount} verified reviews
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">Direct Customer Feedback</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-sm">
              Real ratings from families and businesses who received this harvest directly from the farm.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-3 rounded-full shadow-md shadow-brand-600/20 transition active:scale-95 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {showForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4 animate-slide-down"
        >
          <h4 className="font-bold text-gray-900 text-sm">How was this farm produce?</h4>

          {/* Star selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setSelectedRating(star)}
                className="text-amber-400 hover:scale-110 transition p-1"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= selectedRating ? 'fill-current text-amber-500' : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-brand-700 ml-2">
              {selectedRating === 5
                ? 'Outstanding 🌟'
                : selectedRating === 4
                ? 'Very Good 👍'
                : selectedRating === 3
                ? 'Good'
                : 'Needs Improvement'}
            </span>
          </div>

          {/* Text comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Your Review & Comments
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the freshness, taste, packaging, or delivery experience..."
              className="w-full p-3 text-xs bg-gray-50 rounded-2xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No reviews yet for this harvest. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 hover:border-gray-200 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      rev.customer?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        rev.customer?.name || 'Customer'
                      )}&background=22c55e&color=fff`
                    }
                    alt={rev.customer?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        {rev.customer?.name || 'Verified Customer'}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        <ShieldCheck className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.comment && (
                <p className="text-xs text-gray-700 leading-relaxed pl-11">
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
