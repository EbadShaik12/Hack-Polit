import React from 'react';

const SubmissionModal = ({
  isOpen,
  onClose,
  submission,
  formData,
  onChange,
  onSubmit,
  error,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
          <h4 className="text-base font-bold text-white">
            {submission ? 'Update Project Submission' : 'Submit Team Project'}
          </h4>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Project Name *</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => onChange({ ...formData, projectName: e.target.value })}
                placeholder="Enter project name"
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">GitHub Repository *</label>
              <input
                type="url"
                required
                value={formData.githubRepo}
                onChange={(e) => onChange({ ...formData, githubRepo: e.target.value })}
                placeholder="https://github.com/..."
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-805 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Project Description *</label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Describe your project, features, technologies used..."
              className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-808 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveDemoUrl}
                onChange={(e) => onChange({ ...formData, liveDemoUrl: e.target.value })}
                placeholder="https://..."
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-808 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Video Demo Link</label>
              <input
                type="url"
                value={formData.demoVideoLink}
                onChange={(e) => onChange({ ...formData, demoVideoLink: e.target.value })}
                placeholder="https://youtube.com/... or Loom"
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-808 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Screenshots (Comma-separated URLs)</label>
              <input
                type="text"
                value={formData.screenshots}
                onChange={(e) => onChange({ ...formData, screenshots: e.target.value })}
                placeholder="URL1, URL2..."
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-808 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Presentation Slide Link (PDF)</label>
              <input
                type="url"
                value={formData.presentationPdf}
                onChange={(e) => onChange({ ...formData, presentationPdf: e.target.value })}
                placeholder="Link to PDF slides"
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-808 rounded-lg text-slate-205 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
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
              {saving ? 'Saving...' : submission ? 'Update Submission' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionModal;
