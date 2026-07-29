import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-4 font-sans text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.03),transparent_50%)]"></div>

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-lg">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white">404</h1>
          <h2 className="text-2xl font-bold tracking-tight text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sorry, we couldn't find the page you are looking for. It might have been moved or deleted.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Home className="h-4 w-4" /> Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
