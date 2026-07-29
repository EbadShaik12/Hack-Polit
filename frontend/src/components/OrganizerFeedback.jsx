import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Users,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  Award,
} from 'lucide-react';
import api from '../services/api';

const OrganizerFeedback = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const fetchFeedbackOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/feedback/organizer/all');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load organizer feedback:', err);
      setError(err.response?.data?.message || 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-xs text-slate-400 font-semibold animate-pulse">
          Loading Participant Ratings & Feedback Reviews...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-rose-400">
          <AlertCircle className="h-5 w-5" /> Error Loading Feedback
        </div>
        <p>{error}</p>
        <button
          onClick={fetchFeedbackOverview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalFeedbacks = 0,
    overallAvgRating = 0,
    perHackathonFeedback = [],
    allReviews = [],
  } = data || {};

  // Filter reviews
  const filteredReviews = allReviews.filter((r) => {
    const matchesHackathon =
      selectedHackathon === 'all' || (r.hackathon && r.hackathon._id === selectedHackathon);
    const matchesRating =
      ratingFilter === 'all' || r.rating === Number(ratingFilter);
    return matchesHackathon && matchesRating;
  });

  // Calculate rating counts for current selection
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const currentReviews = selectedHackathon === 'all' 
    ? allReviews 
    : allReviews.filter((r) => r.hackathon && r.hackathon._id === selectedHackathon);

  currentReviews.forEach((r) => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const getStarPct = (count) =>
    currentReviews.length > 0 ? Math.round((count / currentReviews.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> Participant Feedback & Reviews
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            View average ratings, rating distribution, and participant feedback comments across your hackathons.
          </p>
        </div>

        <button
          onClick={fetchFeedbackOverview}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" /> Refresh Ratings
        </button>
      </div>

      {/* Top Metrics Cards & Rating Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Overall Rating Card */}
        <div className="md:col-span-4 p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Overall Average Rating
          </span>

          <div className="space-y-1">
            <span className="text-5xl font-extrabold text-white tracking-tight">{overallAvgRating}</span>
            <span className="text-xl text-amber-400 font-bold"> / 5.0</span>
          </div>

          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(overallAvgRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Based on <strong className="text-white">{totalFeedbacks} ratings</strong> from verified participants.
          </p>
        </div>

        {/* Right: Star Rating Distribution Bars */}
        <div className="md:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 flex flex-col justify-center">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Rating Distribution</span>
            <span className="text-slate-400 font-medium">{currentReviews.length} total reviews</span>
          </h4>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const pct = getStarPct(count);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-amber-400 flex items-center gap-1 shrink-0">
                  {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                  />
                </div>

                <span className="w-16 text-right font-semibold text-slate-400 shrink-0">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Selector Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 flex items-center gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Hackathon:
          </label>
          <select
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Hackathons ({perHackathonFeedback.length})</option>
            {perHackathonFeedback.map((h) => (
              <option key={h.hackathonId} value={h.hackathonId}>
                {h.title} ({h.count} reviews - {h.avgRating} ★)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Stars:
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none min-w-[120px]"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Participant Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 border border-slate-800 rounded-xl bg-slate-900/20 space-y-3">
          <MessageSquare className="h-12 w-12 text-slate-700 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No participant reviews found.</p>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Participants can rate and review hackathons after the event ends.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {review.participant?.name ? review.participant.name[0] : 'P'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">
                        {review.participant?.name || 'Anonymous Participant'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {review.participant?.email || ''}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs">
                    <span>{review.rating}.0</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                {/* Event Name */}
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400 block">
                  Hackathon: {review.hackathon?.title || 'Hackathon Event'}
                </span>

                {/* Comment Text */}
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 font-medium flex justify-between items-center border-t border-slate-900">
                <span>Submitted Review</span>
                <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerFeedback;
