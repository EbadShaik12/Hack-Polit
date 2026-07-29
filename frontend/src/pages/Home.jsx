import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, Trophy, ChevronRight, Award, Compass, ShieldCheck } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // Mock featured hackathons data
  const featuredHackathons = [
    {
      id: 'hack-1',
      title: 'Global AI & LLM Challenge',
      organizer: 'NextGen Tech Foundation',
      date: 'Aug 15 - Aug 18, 2026',
      prize: '$15,000 Prize Pool',
      participants: '342 Joined',
      tags: ['AI/ML', 'Open Source'],
    },
    {
      id: 'hack-2',
      title: 'Web3 Build & Scale Summit',
      organizer: 'Decentralized Org',
      date: 'Sep 02 - Sep 05, 2026',
      prize: '$20,000 Prize Pool',
      participants: '215 Joined',
      tags: ['Blockchain', 'Security'],
    },
    {
      id: 'hack-3',
      title: 'EcoTech Green Innovation',
      organizer: 'Earth-Care Alliance',
      date: 'Oct 10 - Oct 12, 2026',
      prize: '$10,000 Prize Pool',
      participants: '189 Joined',
      tags: ['Climate', 'Vite/React'],
    },
  ];

  // Mock testimonials
  const testimonials = [
    {
      quote: "HackPilot simplified our grading system immensely. Assigning submissions to judges and tracking real-time scores has never been this clean.",
      author: "Sarah Jenkins",
      role: "Hackathon Organizer, TechHub",
    },
    {
      quote: "The team-forming features and clean dashboard made coordinating our submission straightforward. Highly recommend this platform for developers.",
      author: "Marcus Chen",
      role: "Software Engineer & Hackathon Winner",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              HP
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              HackPilot
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#hackathons" className="hover:text-blue-600 transition-colors">Featured Hackathons</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Why HackPilot</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
            <Link to="/gallery" className="hover:text-blue-600 transition-colors">Project Gallery</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                  Logged in as <span className="text-slate-800 font-semibold">{user?.name}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm"
                >
                  Dashboard <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 hover:text-blue-600 text-sm font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-blue-650 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(59,130,246,0.02),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span> Now in beta release
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
              Orchestrate Hackathons <br />
              <span className="text-blue-600">Without the Friction</span>
            </h1>
            <p className="text-slate-650 text-base md:text-lg max-w-xl leading-relaxed">
              HackPilot delivers a minimal, role-based workflow solution for participants, organizers, and judges. Build teams, manage submissions, and grade rubrics from a centralized hub.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-md shadow-blue-600/10"
                >
                  Manage Your Workspace
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-md shadow-blue-600/10"
                  >
                    Host a Hackathon
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                  >
                    Join as Developer
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 hidden lg:block">
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm relative">
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-2.5 w-2/5 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                <div className="h-2 w-4/5 bg-slate-200 rounded-full"></div>
                <hr className="border-slate-200 my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xl font-bold text-blue-600">Admin</span>
                    <p className="text-xxs text-slate-500 uppercase font-semibold">Workspace</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-xl font-bold text-blue-600">Judge</span>
                    <p className="text-xxs text-slate-500 uppercase font-semibold">Evaluations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-12 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-blue-650">1,200+</div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Developers Registered</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-blue-650">350+</div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Teams Formed</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-blue-650">45+</div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Hackathons</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-blue-650">99.8%</div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">API Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section id="hackathons" className="py-20 max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Featured Hackathons</h2>
          <p className="text-slate-500 text-sm">
            Explore and register for upcoming global events hosted on the HackPilot ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredHackathons.map((hack) => (
            <div key={hack.id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 transition-colors">
              <div className="space-y-4">
                <div className="flex gap-2">
                  {hack.tags.map((tag, idx) => (
                    <span key={idx} className="text-xxs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-900">{hack.title}</h3>
                  <p className="text-xs text-slate-500">by {hack.organizer}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-blue-600" /> {hack.date}</span>
                  <span className="text-slate-900 font-bold">{hack.prize}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" /> {hack.participants}</span>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose HackPilot */}
      <section id="features" className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
            <p className="text-slate-500 text-sm">
              Standardized tooling built explicitly to serve developers, judges, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Role-Based Dashboard</h3>
              <p className="text-sm text-slate-550 leading-relaxed">
                Specific console layout grids tailored precisely for your account. Perform operations relevant to your task structure.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Interactive Grading</h3>
              <p className="text-sm text-slate-550 leading-relaxed">
                Organizers specify grading rubrics, and judges grade entries via dynamic digital spreadsheets.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Secure JWT Session Flow</h3>
              <p className="text-sm text-slate-550 leading-relaxed">
                State preservation securely integrated with bcrypt hash encryption, protected client routes, and authorization checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">What Organizers Say</h2>
          <p className="text-slate-500 text-sm">
            Trusted by creators across the world to host and evaluate development challenge projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-8 relative flex flex-col justify-between space-y-6">
              <span className="text-5xl text-blue-200 font-serif absolute top-4 left-6 select-none">“</span>
              <p className="text-slate-650 text-sm italic relative z-10 leading-relaxed pt-2">
                {test.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 border border-slate-200 uppercase text-xs">
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{test.author}</h4>
                  <p className="text-xxs text-slate-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                HP
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                HackPilot
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized MERN orchestration workspace for modern, competitive hackathon hack event builders.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#hackathons" className="hover:text-blue-600 transition-colors">Explore Hackathons</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features list</a></li>
              <li><Link to="/register" className="hover:text-blue-600 transition-colors">Start Organizing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Support Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API Endpoint Specs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xxs font-medium">
          <p>© {new Date().getFullYear()} HackPilot. All rights reserved.</p>
          <p className="flex gap-4">
            <span>Built with React 19 & Tailwind CSS v4</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
