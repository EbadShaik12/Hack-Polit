import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Lock, KeyRound, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please provide your admin email and security password');
    }

    setLoading(true);

    try {
      await adminLogin(email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Admin login failed. Access restricted to system administrators.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans py-12">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_60%)] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white shadow-md text-lg">
              <ShieldAlert className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Admin Portal
            </span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Dedicated Admin Authentication
          </div>
        </div>

        {/* Hero-Themed Form Card */}
        <div className="bg-gradient-to-b from-white to-slate-50/90 rounded-[32px] p-7 md:p-8 border-4 border-white shadow-[0_30px_30px_-20px_rgba(148,163,184,0.5)] space-y-5">
          <div className="text-center space-y-1">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">
              Administrator Login
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enter your elevated credentials to access the admin audit & oversight dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Admin Email</label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hackpilot.com"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-5 py-3.5 rounded-2xl text-slate-900 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#e2e8f0]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Admin Security Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-5 py-3.5 rounded-2xl text-slate-900 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#e2e8f0]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Authenticate Admin <KeyRound className="h-4 w-4 text-blue-400" />
                </>
              )}
            </button>
          </form>

          {/* Switch to standard user login */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Not an Admin?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Standard User Login &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
