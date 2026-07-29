import React from 'react';

const GradingModal = ({
  isOpen,
  onClose,
  submission,
  scores,
  onChange,
  comments,
  onCommentsChange,
  onSubmit,
  saving,
  error,
}) => {
  if (!isOpen) return null;

  const blindId = submission ? `SUB-${submission._id.slice(-6).toUpperCase()}` : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
          <div>
            <h4 className="text-base font-bold text-white">Project Evaluation Scorecard</h4>
            <p className="text-xxs text-slate-500 mt-0.5">Anonymized Blind Review ID: {blindId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="space-y-3.5">
            {[
              { name: 'innovation', label: 'Innovation (1-10)', desc: 'Uniqueness, originality, and creative problem solving.' },
              { name: 'ui', label: 'User Interface / UX (1-10)', desc: 'Design aesthetics, user experience, layout, and styling.' },
              { name: 'functionality', label: 'Functionality (1-10)', desc: 'Correctness, performance, completeness of features, and bugs.' },
              { name: 'documentation', label: 'Documentation (1-10)', desc: 'Readme setup instructions, comments, clarity of submission slides.' },
              { name: 'scalability', label: 'Scalability / Architecture (1-10)', desc: 'Code modularity, clean architecture, and suitability for growth.' },
            ].map((criteria) => (
              <div key={criteria.name} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="font-bold text-slate-200 block">{criteria.label}</label>
                    <span className="text-[10px] text-slate-505 block leading-normal mt-0.5">{criteria.desc}</span>
                  </div>
                  <select
                    value={scores[criteria.name] || 5}
                    onChange={(e) => onChange({ ...scores, [criteria.name]: parseInt(e.target.value) })}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-205 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Evaluation Comments & Feedback</label>
            <textarea
              rows="3"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              placeholder="Provide constructive feedback, suggestions, or score justifications..."
              className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-400">Sum Total Score:</span>
            <span className="font-black text-white text-sm bg-indigo-900/60 px-3 py-0.5 rounded-full border border-indigo-850">
              {Object.values(scores).reduce((a, b) => a + b, 0)} / 50
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-355 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {saving ? 'Submitting...' : 'Save Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradingModal;
