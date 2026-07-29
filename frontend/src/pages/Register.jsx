import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    alert(`${provider} Social Sign-up option selected. Registering...`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans py-12">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,137,211,0.08),transparent_60%)] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30 text-lg">
              HP
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              HackPilot
            </span>
          </Link>
          <p className="text-xs font-medium text-slate-500">
            Join HackPilot to start managing your projects
          </p>
        </div>

        {/* Hero-Themed Form Card */}
        <div className="bg-gradient-to-b from-white to-slate-50/90 rounded-[32px] p-7 md:p-8 border-4 border-white shadow-[0_30px_30px_-20px_rgba(133,189,215,0.7)] space-y-5">
          <h3 className="text-center font-black text-2xl md:text-3xl text-blue-600 tracking-tight">
            Create Account
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-white border border-slate-200/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 px-5 py-3 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#cff0ff]"
              />
            </div>

            <div className="space-y-1">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full bg-white border border-slate-200/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 px-5 py-3 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#cff0ff]"
              />
            </div>

            <div className="space-y-1">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (6+ characters)"
                className="w-full bg-white border border-slate-200/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 px-5 py-3 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#cff0ff]"
              />
            </div>

            <div className="space-y-1">
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-white border border-slate-200/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 px-5 py-3 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#cff0ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Account Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-slate-200/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 px-5 py-3 rounded-2xl text-slate-700 text-sm outline-none transition-all shadow-[0_10px_10px_-5px_#cff0ff] cursor-pointer"
              >
                <option value="participant">Participant (Default)</option>
                <option value="organizer">Organizer</option>
                <option value="judge">Judge</option>
              </select>
              <p className="text-[10px] text-slate-400 pl-2 pt-0.5 font-medium">
                * Note: Admin accounts are managed separately via the Admin Portal.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm transition-all cursor-pointer shadow-[0_20px_10px_-15px_rgba(133,189,215,0.85)] hover:scale-[1.03] active:scale-[0.95] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign in container */}
          <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
            <span className="block text-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Or Sign in with
            </span>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                title="Sign in with Google"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 border-4 border-white flex items-center justify-center text-white shadow-[0_12px_10px_-8px_rgba(133,189,215,0.9)] hover:scale-125 active:scale-90 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                title="Sign in with Apple"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 border-4 border-white flex items-center justify-center text-white shadow-[0_12px_10px_-8px_rgba(133,189,215,0.9)] hover:scale-125 active:scale-90 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('Twitter/X')}
                title="Sign in with X / Twitter"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 border-4 border-white flex items-center justify-center text-white shadow-[0_12px_10px_-8px_rgba(133,189,215,0.9)] hover:scale-125 active:scale-90 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-center pt-1">
            <p className="text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-500 hover:text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>

            <button
              type="button"
              onClick={() => alert('User Licence Agreement: By registering on HackPilot, you agree to platform security policies and guidelines.')}
              className="text-[10px] text-blue-500 hover:underline cursor-pointer block mx-auto font-medium"
            >
              Learn user licence agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
