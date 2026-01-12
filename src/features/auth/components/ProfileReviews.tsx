'use client';

import { useState } from 'react';
import { Star, ChevronDown, MessageCircle } from 'lucide-react';
import { ReviewSummary, ProfileReview } from '@/types/profile';
import { ReviewHostModal } from './ReviewHostModal';

interface ProfileReviewsProps {
  summary: ReviewSummary;
  reviews: ProfileReview[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}
export default function ProfileReviews({
  summary,
  reviews,
  hasMore = false,
  onLoadMore,
  loading = false,
  hostId,
  currentUser,
}: ProfileReviewsProps & { hostId?: string; currentUser?: any }) {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.8) return 'Exceptional';
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    return 'Average';
  };

  // Calculate percentage for rating bars
  const getPercentage = (count: number) => {
    if (summary.totalReviews === 0) return 0;
    return (count / summary.totalReviews) * 100;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Reviews</h3>
        {currentUser && hostId && currentUser.userId !== hostId && (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Review host
          </button>
        )}
      </div>

        <ReviewHostModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          hostId={hostId || ""}
          guestId={currentUser?.userId || ""}
          onSuccess={() => {
             window.location.reload();
          }}
        />

      {/* Summary Section */}
      {summary.totalReviews > 0 ? (
        <>
          <div className="flex items-start gap-6 mb-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Star size={32} className="text-yellow-500 fill-yellow-500" />
                <span className="text-4xl font-bold text-gray-900">
                  {summary.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{getRatingLabel(summary.averageRating)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-2">{rating}</span>
                  <Star size={12} className="text-gray-300" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${getPercentage(
                          summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown]
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">
                    {summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                {/* Reviewer Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {review.reviewerPhoto ? (
                      <img
                        src={review.reviewerPhoto}
                        alt={review.reviewerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{review.reviewerName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-200'
                            }
                          />
                        ))}
                      </div>
                      <span>·</span>
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                {review.propertyTitle && (
                  <p className="text-xs text-gray-400 mb-2">Stay at: {review.propertyTitle}</p>
                )}

                {/* Review Comment */}
                <p
                  className={`text-sm text-gray-600 leading-relaxed ${
                    expandedReview !== review.id && review.comment && review.comment.length > 200
                      ? 'line-clamp-3'
                      : ''
                  }`}
                >
                  {review.comment || 'No comment provided'}
                </p>

                {/* Show More Button */}
                {review.comment && review.comment.length > 200 && (
                  <button
                    onClick={() =>
                      setExpandedReview(expandedReview === review.id ? null : review.id)
                    }
                    className="text-sm font-medium text-gray-900 mt-2 hover:underline"
                  >
                    {expandedReview === review.id ? 'Show less' : 'Show more'}
                  </button>
                )}

                {/* Host Response */}
                {review.response && (
                  <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle size={14} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">Host Response</span>
                      {review.response.respondedAt && (
                        <span className="text-xs text-gray-400">
                          · {formatDate(review.response.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.response.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show more reviews
                </>
              )}
            </button>
          )}
        </>
      ) : (
        /* No Reviews State */
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Reviews will appear here after completed stays</p>
        </div>
      )}
    </div>
  );
}
