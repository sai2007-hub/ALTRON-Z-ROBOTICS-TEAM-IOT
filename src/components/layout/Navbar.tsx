import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, ChevronDown, UserCheck, ArrowRight, Home, Users, Cpu, Trophy, Image as ImageIcon, Mail, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AltronzLogo } from '../common/AltronzLogo';

export type PageView =
  | 'home'
  | 'about'
  | 'sumo'
  | 'soccer'
  | 'events'
  | 'workshops'
  | 'projects'
  | 'achievements'
  | 'gallery'
  | 'team'
  | 'contact'
  | 'login'
  | 'admin';

interface NavbarProps {
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenRegister,
}) => {
  const { isAdmin, currentUser, logoutAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);

  const handleNav = (view: PageView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setEventsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close mobile drawer on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setEventsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090C]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Scalable Altronz Vector Logo & Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="text-left shrink-0 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg p-1 -ml-1 cursor-pointer"
          title="ALTRON'Z ROBOTICS TEAM & IOT - Home"
        >
          <AltronzLogo size="sm" showSubtitle={true} />
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-300">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'home' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('about')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'about' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            About
          </button>

          {/* Events Menu */}
          <div className="relative">
            <button
              onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
              onMouseEnter={() => setEventsDropdownOpen(true)}
              className={`flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors py-1 ${
                ['sumo', 'soccer', 'events'].includes(currentView)
                  ? 'text-red-500 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <span>Events</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {eventsDropdownOpen && (
              <div
                onMouseLeave={() => setEventsDropdownOpen(false)}
                className="absolute top-full left-0 w-52 py-2 mt-1 bg-[#0F1219] border border-zinc-800 rounded-lg shadow-xl shadow-black/60 z-50 animate-in fade-in duration-150"
              >
                <button
                  onClick={() => handleNav('sumo')}
                  className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors block"
                >
                  <span className="font-semibold text-white">Robo Sumo</span>
                  <span className="block text-[10px] text-zinc-500">Flagship Combat Event</span>
                </button>
                <button
                  onClick={() => handleNav('soccer')}
                  className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors block"
                >
                  <span className="font-semibold text-white">Robo Soccer</span>
                  <span className="block text-[10px] text-zinc-500">Omni Tactical Match</span>
                </button>
                <div className="h-px bg-zinc-800/80 my-1"></div>
                <button
                  onClick={() => handleNav('events')}
                  className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:text-red-400 hover:bg-zinc-800/60 transition-colors block"
                >
                  All Competitions & Rules
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('workshops')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'workshops' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Workshops
          </button>

          <button
            onClick={() => handleNav('projects')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'projects' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Projects
          </button>

          <button
            onClick={() => handleNav('achievements')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'achievements' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Achievements
          </button>

          <button
            onClick={() => handleNav('gallery')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'gallery' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Gallery
          </button>

          <button
            onClick={() => handleNav('team')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'team' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Our Team
          </button>

          <button
            onClick={() => handleNav('contact')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'contact' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'admin'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('login')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Admin Login
              </button>
              <button
                onClick={onOpenRegister}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm shadow-red-600/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Action & Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={onOpenRegister}
            className="min-h-[40px] px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-red-600/30 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
          >
            <span>Register</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[42px] min-h-[42px] p-2 text-zinc-300 hover:text-white rounded-lg bg-[#0F1219] border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-black/80 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Down Drawer Container */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation Menu"
          className="lg:hidden fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#0A0C11]/98 border-b border-zinc-800 shadow-2xl z-40 p-4 space-y-4"
        >
          {/* Group 1: Core Navigation */}
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-2 mb-1.5">
              General
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNav('home')}
                className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <Home className="w-4 h-4 text-zinc-400" />
                <span>Home</span>
              </button>
              <button
                onClick={() => handleNav('about')}
                className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'about'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>About Team</span>
              </button>
            </div>
          </div>

          {/* Group 2: Competitions */}
          <div>
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest block px-2 mb-1.5">
              Competitions
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('sumo')}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'sumo'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Robo Sumo (3.0 kg Class)</span>
                </span>
                <span className="text-[10px] text-red-400 font-mono uppercase bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/60">
                  Flagship
                </span>
              </button>

              <button
                onClick={() => handleNav('soccer')}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'soccer'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Robo Soccer (2-vs-2 Omni)</span>
                </span>
                <span className="text-[10px] text-red-400 font-mono uppercase bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/60">
                  Flagship
                </span>
              </button>

              <button
                onClick={() => handleNav('events')}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'events'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>All Tournaments & Rulebooks</span>
                </span>
                <span className="text-zinc-500 text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Group 3: Education & Research */}
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-2 mb-1.5">
              Outreach & Engineering R&D
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleNav('workshops')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'workshops'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>Workshops</span>
              </button>

              <button
                onClick={() => handleNav('projects')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'projects'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>R&D Projects</span>
              </button>

              <button
                onClick={() => handleNav('achievements')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'achievements'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>Achievements</span>
              </button>

              <button
                onClick={() => handleNav('gallery')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'gallery'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>Photo Gallery</span>
              </button>

              <button
                onClick={() => handleNav('team')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'team'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>Our Team</span>
              </button>

              <button
                onClick={() => handleNav('contact')}
                className={`min-h-[44px] flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'contact'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800/70 border border-transparent'
                }`}
              >
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Group 4: Administrative Actions */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            {isAdmin ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full min-h-[44px] py-2.5 px-3 text-center text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Go to Admin Dashboard</span>
                </button>
                <button
                  onClick={logoutAdmin}
                  className="w-full min-h-[42px] py-2 px-3 text-center text-xs text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out of Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="w-full min-h-[44px] py-2 px-3 text-center text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
