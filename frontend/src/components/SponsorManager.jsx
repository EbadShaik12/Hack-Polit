import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Globe,
  Layers,
  Award,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

const TIER_COLORS = {
  Title: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Platinum: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Gold: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Silver: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  Bronze: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Community: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Media Partner': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const DEFAULT_LOGOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
];

const SponsorManager = () => {
  const [sponsors, setSponsors] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    tier: 'Gold',
    hackathonId: '',
  });

  const fetchSponsors = async () => {
    setLoading(true);
    setError('');
    try {
      const [sponsorsRes, hackathonsRes] = await Promise.all([
        api.get('/api/sponsors/organizer'),
        api.get('/api/hackathons/organizer/all'),
      ]);
      setSponsors(sponsorsRes.data);
      setHackathons(hackathonsRes.data);
      if (hackathonsRes.data.length > 0 && !formData.hackathonId) {
        setFormData((prev) => ({ ...prev, hackathonId: hackathonsRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load sponsors:', err);
      setError(err.response?.data?.message || 'Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setEditingSponsor(null);
    setFormData({
      name: '',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
      websiteUrl: '',
      tier: 'Gold',
      hackathonId: hackathons.length > 0 ? hackathons[0]._id : '',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || '',
      logoUrl: sponsor.logoUrl || '',
      websiteUrl: sponsor.websiteUrl || '',
      tier: sponsor.tier || 'Gold',
      hackathonId: sponsor.hackathon?._id || sponsor.hackathon || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');

    if (!formData.name || !formData.logoUrl || !formData.hackathonId) {
      setModalError('Please fill in sponsor name, logo URL, and select a hackathon.');
      setSaving(false);
      return;
    }

    try {
      if (editingSponsor) {
        await api.put(`/api/sponsors/${editingSponsor._id}`, formData);
      } else {
        await api.post('/api/sponsors', formData);
      }
      setShowModal(false);
      fetchSponsors();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving sponsor details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete sponsor "${name}"?`)) return;
    try {
      await api.delete(`/api/sponsors/${id}`);
      fetchSponsors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sponsor');
    }
  };

  const filteredSponsors = sponsors.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.hackathon?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || s.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="h-6 w-6 text-indigo-400" /> Sponsor Management
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Add, edit, and organize partner companies, logos, URLs, and sponsorship tiers across your hackathons.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={hackathons.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-650/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add New Sponsor
        </button>
      </div>

      {/* High Level Tier Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sponsors</span>
          <p className="text-2xl font-extrabold text-white">{sponsors.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Title Sponsors</span>
          <p className="text-2xl font-extrabold text-amber-300">
            {sponsors.filter((s) => s.tier === 'Title').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-1">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Platinum & Gold</span>
          <p className="text-2xl font-extrabold text-indigo-300">
            {sponsors.filter((s) => s.tier === 'Platinum' || s.tier === 'Gold').length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Silver & Partners</span>
          <p className="text-2xl font-extrabold text-emerald-300">
            {sponsors.filter((s) => s.tier !== 'Title' && s.tier !== 'Platinum' && s.tier !== 'Gold').length}
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search by sponsor name or hackathon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tier:</label>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none min-w-[140px]"
          >
            <option value="all">All Tiers</option>
            <option value="Title">Title</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
            <option value="Community">Community</option>
            <option value="Media Partner">Media Partner</option>
          </select>
        </div>
      </div>

      {/* Main Sponsors Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="text-center py-16 border border-slate-800 rounded-xl bg-slate-900/20 space-y-3">
          <Building2 className="h-12 w-12 text-slate-700 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No sponsors found.</p>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {hackathons.length === 0
              ? 'Create a hackathon first before adding sponsors.'
              : 'Add your first sponsor or adjust search filters to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => {
            const tierStyle = TIER_COLORS[sponsor.tier] || TIER_COLORS.Gold;
            return (
              <div
                key={sponsor._id}
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all duration-200 space-y-4"
              >
                <div className="space-y-3">
                  {/* Top row with Tier Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${tierStyle}`}>
                      {sponsor.tier} Sponsor
                    </span>
                    <span className="text-xxs text-slate-500 font-medium line-clamp-1">
                      {sponsor.hackathon?.title || 'Hackathon'}
                    </span>
                  </div>

                  {/* Logo + Name */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-12 w-12 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-base leading-snug truncate">{sponsor.name}</h4>
                      {sponsor.websiteUrl ? (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold truncate mt-0.5"
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{sponsor.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No URL specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(sponsor)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor._id, sponsor.name)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Sponsor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative my-8 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-indigo-400" />
                {editingSponsor ? 'Edit Sponsor Details' : 'Add New Sponsor'}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Sponsor Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Google Cloud, Vercel, MongoDB"
                  className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Sponsorship Tier</label>
                  <select
                    name="tier"
                    value={formData.tier}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Title">Title Sponsor</option>
                    <option value="Platinum">Platinum Sponsor</option>
                    <option value="Gold">Gold Sponsor</option>
                    <option value="Silver">Silver Sponsor</option>
                    <option value="Bronze">Bronze Sponsor</option>
                    <option value="Community">Community Partner</option>
                    <option value="Media Partner">Media Partner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Associated Hackathon</label>
                  <select
                    name="hackathonId"
                    required
                    value={formData.hackathonId}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {hackathons.length === 0 ? (
                      <option value="">No hackathons available</option>
                    ) : (
                      hackathons.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Logo Image URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  required
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://... logo link"
                  className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-400">Website URL (Optional)</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                  className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Logo Preview */}
              {formData.logoUrl && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <span className="text-xxs font-bold text-slate-500 uppercase">Logo Preview:</span>
                  <div className="h-10 w-28 bg-slate-900 rounded p-1 flex items-center justify-center border border-slate-800 overflow-hidden">
                    <img
                      src={formData.logoUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingSponsor ? 'Save Changes' : 'Add Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorManager;
