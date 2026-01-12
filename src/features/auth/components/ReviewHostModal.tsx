'use client';

import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserAPI } from '@/lib/api/backend-api';

interface ReviewHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string;
  guestId: string;
  onSuccess: () => void;
}

export function ReviewHostModal({ isOpen, onClose, hostId, guestId, onSuccess }: ReviewHostModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await UserAPI.submitHostReview({
        guestId,
        hostId,
        rating,
        comment,
      });
      if (response.success) {
        toast.success('Review submitted successfully');
        onSuccess();
        onClose();
        // Reset form
        setRating(0);
        setComment('');
      }

    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Review Host</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <label className="block text-sm font-medium text-gray-700">
              How was your experience?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-yellow-500 h-5">
              {hoverRating || rating ? (
                ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][(hoverRating || rating) - 1]
              ) : ''}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Share your feedback (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this host..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-0 resize-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
