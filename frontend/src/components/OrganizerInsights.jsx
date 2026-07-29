import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  FileCheck,
  Award,
  Layers,
  BarChart3,
  CheckCircle2,
  PieChart,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const OrganizerInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/hackathons/organizer/insights');
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to load organizer insights:', err);
      setError(err.response?.data?.message || 'Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-xs text-slate-400 font-semibold animate-pulse">
          Gathering Organizer Analytics & Metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-rose-400">
          <AlertCircle className="h-5 w-5" /> Error Loading Insights
        </div>
        <p>{error}</p>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalHackathons = 0,
    publishedCount = 0,
    draftCount = 0,
    totalTeams = 0,
    totalParticipants = 0,
    targetCapacity = 100,
    registrationProgressPct = 0,
    totalSubmissions = 0,
    submissionProgressPct = 0,
    evaluatedSubmissions = 0,
    reviewCompletionPct = 0,
    experienceBreakdown = { Beginner: 0, Intermediate: 0, Expert: 0 },
    topSkills = [],
    topThemes = [],
    perHackathonStats = [],
  } = insights || {};

  const totalExp =
    (experienceBreakdown.Beginner || 0) +
    (experienceBreakdown.Intermediate || 0) +
    (experienceBreakdown.Expert || 0);

  const getPct = (val) => (totalExp > 0 ? Math.round((val / totalExp) * 100) : 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-indigo-400" /> Organizer Insights & Analytics
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track registration milestones, project submission completion, review metrics, and participant demographics across your hackathons.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400" /> Refresh Data
        </button>
      </div>

      {/* Top High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hackathons</span>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{totalHackathons}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong className="text-emerald-400">{publishedCount} published</strong>, {draftCount} draft
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Participants</span>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{totalParticipants}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Across <strong className="text-purple-400">{totalTeams} teams</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Submissions</span>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{totalSubmissions}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong className="text-emerald-400">{submissionProgressPct}% submission rate</strong>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Review Completion</span>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{reviewCompletionPct}%</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong className="text-amber-400">{evaluatedSubmissions} of {totalSubmissions}</strong> reviewed
            </p>
          </div>
        </div>
      </div>

      {/* ── Key Progress Bars Section ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Registration Progress */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" /> Registration Progress
            </h4>
            <span className="text-xs font-extrabold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
              {registrationProgressPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Registered ({totalParticipants})</span>
              <span>Capacity Goal ({targetCapacity})</span>
            </div>
            {/* Progress bar container */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(registrationProgressPct, 3)}%` }}
              />
            </div>
          </div>

          <p className="text-xxs text-slate-500 leading-relaxed">
            Measures developer onboarding and participant seat fill rate against target capacity across active hackathons.
          </p>
        </div>

        {/* 2. Submission Progress */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" /> Submission Progress
            </h4>
            <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {submissionProgressPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Submitted Projects ({totalSubmissions})</span>
              <span>Registered Teams ({totalTeams})</span>
            </div>
            {/* Progress bar container */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(submissionProgressPct, 3)}%` }}
              />
            </div>
          </div>

          <p className="text-xxs text-slate-500 leading-relaxed">
            Shows project completion velocity by calculating submitted GitHub repositories against total registered teams.
          </p>
        </div>

        {/* 3. Review Completion */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Review Completion
            </h4>
            <span className="text-xs font-extrabold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {reviewCompletionPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Evaluated ({evaluatedSubmissions})</span>
              <span>Total Submissions ({totalSubmissions})</span>
            </div>
            {/* Progress bar container */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(reviewCompletionPct, 3)}%` }}
              />
            </div>
          </div>

          <p className="text-xxs text-slate-500 leading-relaxed">
            Tracks judge panel scoring progress to ensure all submitted projects receive blind reviews before deadline.
          </p>
        </div>
      </div>

      {/* ── Top Themes & Participant Statistics Grid ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Themes Progress Breakdown */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Top Hackathon Themes
            </h4>
            <span className="text-xs text-slate-500 font-medium">{topThemes.length} Categories</span>
          </div>

          {topThemes.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">No hackathon themes found.</p>
          ) : (
            <div className="space-y-4">
              {topThemes.map((theme, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-200">{theme.name}</span>
                    <span className="text-indigo-400 font-bold">
                      {theme.count} event{theme.count > 1 ? 's' : ''} ({theme.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.max(theme.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Participant Statistics & Demographics */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Participant Demographics & Skills
            </h4>
            <span className="text-xs text-slate-500 font-medium">Experience Breakdown</span>
          </div>

          {/* Experience level bars */}
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Beginner Developers</span>
                <span className="text-blue-400 font-bold">
                  {experienceBreakdown.Beginner || 0} ({getPct(experienceBreakdown.Beginner || 0)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.max(getPct(experienceBreakdown.Beginner || 0), 4)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Intermediate Developers</span>
                <span className="text-purple-400 font-bold">
                  {experienceBreakdown.Intermediate || 0} ({getPct(experienceBreakdown.Intermediate || 0)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${Math.max(getPct(experienceBreakdown.Intermediate || 0), 4)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Expert / Senior Hackers</span>
                <span className="text-emerald-400 font-bold">
                  {experienceBreakdown.Expert || 0} ({getPct(experienceBreakdown.Expert || 0)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.max(getPct(experienceBreakdown.Expert || 0), 4)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top skills tags */}
          {topSkills.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
                Top Participant Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {topSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                  >
                    <span>{sk.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold">
                      {sk.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Per-Hackathon Overview Breakdown Table Cards ───────────────────── */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-5">
        <h4 className="font-bold text-white text-sm uppercase tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" /> Individual Hackathon Performance
        </h4>

        {perHackathonStats.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-semibold">
            No hackathons created yet. Create a hackathon to start tracking insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perHackathonStats.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-white text-sm">{h.title}</h5>
                    <span className="text-xs text-indigo-400 font-medium">{h.theme}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      h.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-slate-900 py-2">
                  <div>
                    <p className="text-slate-400 font-semibold">{h.teamsCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Teams</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">{h.submissionsCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Projects</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">{h.evaluationsCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Scores</p>
                  </div>
                </div>

                {/* Sub & Review progress bars for this hackathon */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Submissions</span>
                      <span className="text-emerald-400 font-bold">{h.submissionProgressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.max(h.submissionProgressPct, 3)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Review Completion</span>
                      <span className="text-amber-400 font-bold">{h.reviewCompletionPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.max(h.reviewCompletionPct, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerInsights;
