import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

const FeedbackModal = ({ hackathon, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingFeedback, setExistingFeedback] = useState(null);

  const fetchMyFeedback = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/api/feedback/my-feedback/${hackathon._id}`);
      if (res.data) {
        setExistingFeedback(res.data);
        setRating(res.data.rating || 5);
        setComment(res.data.comment || '');
      }
    } catch (err) {
      console.error('Failed to fetch existing feedback:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (hackathon?._id) {
      fetchMyFeedback();
    }
  }, [hackathon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!comment.trim()) {
      setError('Please leave a comment sharing your hackathon experience.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/feedback', {
        hackathonId: hackathon._id,
        rating,
        comment: comment.trim(),
      });
      setSuccess(
        existingFeedback ? 'Feedback updated successfully!' : 'Thank you for rating this hackathon!'
      );
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative space-y-5 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Participant Feedback
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              Rate your experience for <strong className="text-indigo-400">{hackathon?.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* 5-Star Interactive Rating */}
            <div className="text-center space-y-2 py-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Overall Event Rating
              </label>

              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          activeStar
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-amber-400 block">
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent (5 Stars)'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good (4 Stars)'}
                {rating === 3 && '⭐⭐⭐ Good (3 Stars)'}
                {rating === 2 && '⭐⭐ Fair (2 Stars)'}
                {rating === 1 && '⭐ Poor (1 Star)'}
              </span>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" /> Participant Comments & Review
              </label>
              <textarea
                rows="4"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on venue, organization, judging, communication, or suggestions..."
                className="block w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : existingFeedback ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
