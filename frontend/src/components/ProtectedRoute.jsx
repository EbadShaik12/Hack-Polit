import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role is not authorized, render Access Denied template
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-4 font-sans text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03),transparent_50%)]"></div>
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-550 border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Access Denied</h1>
            <p className="text-sm text-slate-400">
              You do not have the required permissions to view this resource. 
              Required roles: <span className="text-amber-400 font-semibold">{allowedRoles.join(', ')}</span>.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <a 
              href="/"
              className="px-5 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-sm font-bold text-white transition-all shadow-md shadow-indigo-600/25"
            >
              Go to Dashboard
            </a>
            <button 
              onClick={() => window.history.back()}
              className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-sm font-semibold transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role authorized, render matching page outlet
  return <Outlet />;
};

export default ProtectedRoute;
