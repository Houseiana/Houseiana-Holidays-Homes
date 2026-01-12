'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronDown, MessageCircle } from 'lucide-react';
import { PropertyAPI } from '@/lib/api/backend-api';

interface PropertyReviewsProps {
  propertyId: string;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await PropertyAPI.getReviews(propertyId);
        if (response.success && response.data) {
          // Adapting response structure if needed, assuming direct array or nested
          setReviews(Array.isArray(response.data) ? response.data : response.data.reviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (loading) return (
     <div className="py-8 text-center text-gray-400">Loading reviews...</div>
  );

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews</h3>
        <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No reviews yet</p>
        </div>
      </div>
    );
  }

  // Calculate generic summary if not provided by backend
  const averageRating = reviews.reduce((acc, r) => acc + (r.ratingValue || r.rating), 0) / reviews.length;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        ★ {averageRating.toFixed(2)} · {reviews.length} reviews
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review: any) => (
          <div key={review.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                 {/* Fallback for guest photo */}
                 {(review.guest?.profilePhoto || review.reviewerPhoto) ? (
                    <img src={review.guest?.profilePhoto || review.reviewerPhoto} alt="Guest" className="w-full h-full object-cover"/>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 font-bold">
                        {(review.guest?.firstName || review.reviewerName || 'G').charAt(0)}
                    </div>
                 )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                    {review.guest?.firstName || review.reviewerName || 'Guest'}
                </h4>
                <div className="text-sm text-gray-500">
                    {review.guest?.nationality || 'Global'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                    <Star
                    key={i}
                    size={14}
                    className={i < (review.ratingValue || review.rating) ? "fill-gray-900 text-gray-900" : "fill-gray-200 text-gray-200"}
                    />
                ))}
                <span className="text-sm font-medium ml-2">{formatDate(review.createdAt)}</span>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {expandedReview === review.id || (review.comment || "").length <= 150
                ? (review.comment || "")
                : `${(review.comment || "").substring(0, 150)}...`}
              {(review.comment || "").length > 150 && (
                <button
                  onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                  className="font-medium underline ml-1 hover:text-gray-900"
                >
                  {expandedReview === review.id ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
