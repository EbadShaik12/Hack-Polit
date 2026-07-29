import React, { useState, useEffect, useContext } from 'react';
import { Search, Github, ExternalLink, Play, Trophy, Medal, Star, Code2, X, Layers } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const BADGE_CONFIG = {
  winner: {
    label: '🏆 Winner',
    cls: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: Trophy,
  },
  'runner-up': {
    label: '🥈 Runner-up',
    cls: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Medal,
  },
  participation: {
    label: '⭐ Participant',
    cls: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: Star,
  },
};

const TECH_COLORS = {
  react: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  vue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  angular: 'bg-rose-50 text-rose-700 border-rose-200',
  node: 'bg-green-50 text-green-700 border-green-200',
  python: 'bg-blue-50 text-blue-700 border-blue-200',
  mongodb: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  postgresql: 'bg-sky-50 text-sky-700 border-sky-200',
  docker: 'bg-blue-50 text-blue-700 border-blue-200',
  typescript: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const getTechColor = (tech) => {
  const key = tech.toLowerCase().replace(/[^a-z]/g, '');
  return TECH_COLORS[key] || TECH_COLORS.default;
};

const ProjectCard = ({ project, certificateMap }) => {
  const [imgErr, setImgErr] = useState(false);
  const badge = certificateMap[project.team?._id];
  const config = badge ? BADGE_CONFIG[badge] : null;
  const screenshot = !imgErr && project.screenshots?.[0];

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-44 bg-slate-100 overflow-hidden flex-shrink-0">
        {screenshot ? (
          <img
            src={screenshot}
            alt={project.projectName}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <Code2 className="h-12 w-12 text-blue-300" />
          </div>
        )}
        {config && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${config.cls}`}>
            {config.label}
          </span>
        )}
        {project.hackathon?.theme && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-sm">
            {project.hackathon.theme}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{project.projectName}</h3>
          <p className="text-xs text-blue-600 font-semibold mt-0.5">
            {project.team?.name || 'Unknown Team'} &middot; {project.hackathon?.title}
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((tech) => (
              <span key={tech} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTechColor(tech)}`}>
                {tech}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                +{project.techStack.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-auto text-xs font-bold">
          {project.githubRepo && (
            <a href={project.githubRepo} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors">
              <Github className="h-3.5 w-3.5" /> Code
            </a>
          )}
          {project.liveDemoUrl && (
            <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Live Demo
            </a>
          )}
          {project.demoVideoLink && (
            <a href={project.demoVideoLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors">
              <Play className="h-3.5 w-3.5" /> Video
            </a>
          )}
          <span className="ml-auto text-[10px] text-slate-400 font-medium">
            {new Date(project.hackathon?.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </article>
  );
};

// ─── Reusable Gallery Content (used both as standalone page & dashboard tab) ──
export const GalleryContent = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/submissions/gallery`);
        setProjects(res.data);
      } catch (err) {
        setError('Failed to load the project gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allTechs = [...new Set(projects.flatMap((p) => p.techStack || []))].sort();
  const allCategories = ['All', ...new Set(projects.map((p) => p.hackathon?.theme).filter(Boolean))];
  const certificateMap = {};

  const filtered = projects.filter((p) => {
    const searchStr = `${p.projectName} ${p.description} ${p.team?.name}`.toLowerCase();
    if (search && !searchStr.includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'All' && p.hackathon?.theme !== selectedCategory) return false;
    if (selectedTech && !(p.techStack || []).map((t) => t.toLowerCase()).includes(selectedTech.toLowerCase())) return false;
    return true;
  });

  const hasFilters = search || selectedCategory !== 'All' || selectedTech;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-600" /> Public Project Gallery
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore innovative hackathon projects created by developer teams across the community.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 self-start sm:self-auto">
          {filtered.length} Projects Showcase
        </span>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by project name, team, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories / Themes' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Tech Stacks</option>
              {allTechs.map((tech) => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{filtered.length}</strong> of {projects.length} projects
            </span>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedTech(''); }}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 p-8 border border-rose-200 rounded-2xl bg-rose-50 text-rose-600">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border border-slate-200 rounded-2xl bg-white space-y-3">
          <Layers className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-700">No projects found.</p>
          <p className="text-xs text-slate-500">
            Try{' '}
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedTech(''); }}
              className="text-blue-600 hover:underline font-bold cursor-pointer">
              broadening your search term or category filters
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} certificateMap={certificateMap} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Standalone public page (for unauthenticated / direct /gallery access) ────
const Gallery = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
              HP
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">HackPilot</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
            <span className="text-blue-600 font-bold border-b-2 border-blue-600 py-4 flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-blue-600" /> Project Gallery
            </span>
            {isAuthenticated && (
              <a href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" /> Dashboard
              </a>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                  Logged in as <span className="text-slate-800 font-semibold">{user?.name}</span>
                </span>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                >
                  Dashboard →
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/login" className="px-3.5 py-2 text-slate-600 hover:text-blue-600 text-xs font-bold transition-colors">Sign In</a>
                <a href="/register" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs">Create Account</a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <GalleryContent />
      </main>
    </div>
  );
};

export default Gallery;
