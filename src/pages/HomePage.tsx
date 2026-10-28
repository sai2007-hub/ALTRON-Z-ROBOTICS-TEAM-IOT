import React from 'react';
import { PageView } from '../components/layout/Navbar';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import {
  ArrowRight,
  ShieldAlert,
  Trophy,
  Cpu,
  Calendar,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface HomePageProps {
  setCurrentView: (view: PageView) => void;
  onOpenRegister: (item?: any, type?: 'event' | 'workshop') => void;
  onOpenEnquiry: (track?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentView,
  onOpenRegister,
  onOpenEnquiry,
}) => {
  const { events, workshops, achievements, gallery, homepageStats } = useApp();

  const isEventActive = (evt: any) => {
    if (!evt) return false;
    if (['evt-1', 'evt-2', 'evt-3', 'evt-4'].includes(evt.id)) return false;
    if (evt.status !== 'published' && evt.published !== true) return false;
    const statusStr = String(evt.status || '').toLowerCase();
    if (statusStr === 'archived' || statusStr === 'closed' || statusStr === 'completed') return false;
    if (evt.registrationDeadline) {
      const deadline = new Date(evt.registrationDeadline).getTime();
      if (!isNaN(deadline) && deadline < Date.now()) return false;
    }
    return true;
  };

  const activeCompetitions = events.filter(isEventActive);
  const featuredWorkshops = workshops
    .filter((w) => w.status === 'published' || (w.status !== 'draft' && w.published !== false))
    .slice(0, 3);
  const recentAchievements = achievements.filter((a) => a.published !== false).slice(0, 3);
  const recentGallery = gallery.filter((g) => g.published !== false).slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
              <span className="tracking-wide uppercase text-zinc-300 font-bold">Robotics &amp; Embedded Systems Society</span>
              <span className="text-zinc-600">&middot;</span>
              <span className="text-zinc-400">2026 Season</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] [text-wrap:balance]">
              Engineering Autonomous Machines. Mentoring the Next Generation.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              ALTRON&apos;Z ROBOTICS TEAM &amp; IOT is a premier student robotics and embedded engineering organization. We build battle-hardened competition bots for national tournaments and conduct real, kit-backed robotics and IoT workshops for schools and engineering colleges.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              {activeCompetitions.length > 0 && (
                <button
                  onClick={() => onOpenRegister(activeCompetitions[0], 'event')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
                >
                  <span>Register for Competitions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onOpenEnquiry('Robotics & Microcontrollers')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#141824] hover:bg-[#1A2030] text-zinc-200 border border-zinc-700/80 hover:border-zinc-600 font-semibold text-sm rounded-lg transition-all flex items-center justify-center min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
              >
                Host a School / College Workshop
              </button>
            </div>

            {/* Micro verification trust tags */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>Autonomous Mechatronics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>Embedded Hardware</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>ESP32 &amp; STM32 Bare-Metal</span>
              </div>
            </div>
          </div>

          {/* Authentic Society & Engineering Lab Hub */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#141824] to-[#0A0D14] border border-zinc-800 p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider block">
                    Engineering Society
                  </span>
                  <h3 className="text-lg font-bold text-white">ALTRON&apos;Z Robotics &amp; IoT Lab</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
                  ACTIVE HUB
                </span>
              </div>

              {/* Technical vector visual */}
              <RoboVisual type="lab" className="h-56" badge="SYSTEMS & HARDWARE LAB" />

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 block text-[10px]">CORE DOMAIN</span>
                  <span className="font-bold text-zinc-200">Autonomous &amp; IoT</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">HARDWARE STACK</span>
                  <span className="font-bold text-zinc-200">ESP32 &middot; STM32 &middot; RTOS</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">LAB WORKSHOPS</span>
                  <span className="font-bold text-zinc-200">Hands-on Hardware</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">MENTORSHIP</span>
                  <span className="font-bold text-zinc-200">Peer &amp; Project-Based</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Verified Team Statistics Strip */}
        <div
          className={`grid grid-cols-2 ${
            homepageStats.length >= 4
              ? 'md:grid-cols-4'
              : homepageStats.length === 3
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2'
          } gap-6 pt-16 border-t border-white/5 mt-16`}
        >
          {homepageStats.map((stat) => (
            <div key={stat.id} className="space-y-1.5">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-300 font-semibold tracking-wide">{stat.title}</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Featured Competitions & Events - Rendered ONLY if active competitions exist */}
      {activeCompetitions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
                Tournament Arena
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Robotics Competitions
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('events')}
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group cursor-pointer"
            >
              <span>View All Competitions &amp; Rules</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeCompetitions.slice(0, 3).map((evt) => {
              const visualType =
                evt.slug === 'robo-sumo' ? 'sumo' : evt.slug === 'robo-soccer' ? 'soccer' : 'rover';
              const percentFilled = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

              return (
                <div
                  key={evt.id}
                  className="bg-[#0D1017] border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-zinc-700 transition-all group"
                >
                  <div className="p-4 bg-[#12151F] border-b border-zinc-800/80">
                    <RoboVisual type={visualType} className="h-44" title={evt.category} />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{evt.category} Arena</span>
                        <span>{evt.teamSize}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {evt.shortDescription}
                      </p>

                      <div className="space-y-2 pt-2 text-xs text-zinc-400 border-t border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{evt.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Bar & Action */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">Slots Filled:</span>
                          <span className="text-zinc-300 font-semibold tabular-nums">
                            {evt.registeredCount} / {evt.capacity} teams
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${percentFilled}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (evt.slug === 'robo-sumo') setCurrentView('sumo');
                            else if (evt.slug === 'robo-soccer') setCurrentView('soccer');
                            else setCurrentView('events');
                          }}
                          className="flex-1 py-2 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-center transition-colors cursor-pointer"
                        >
                          Rules &amp; Specs
                        </button>
                        <button
                          onClick={() => onOpenRegister(evt, 'event')}
                          className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg text-center transition-colors shadow-sm shadow-red-600/20 cursor-pointer"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Upcoming Workshops in Schools & Colleges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0C0F17] border border-zinc-800 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
                STEM & Higher Education Outreach
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Workshops in Robotics, IoT & Embedded Systems
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
                We travel to schools and engineering institutes with calibrated hardware kits, breadboards, oscilloscopes, and production-tested curriculums.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => onOpenEnquiry()}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors min-h-[42px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
              >
                Request College / School Workshop
              </button>
              <button
                onClick={() => setCurrentView('workshops')}
                className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-lg transition-colors min-h-[42px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
              >
                All Tracks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredWorkshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-[#121520] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-red-400 bg-red-950/40 border border-red-800/40 px-2.5 py-0.5 rounded">
                      {ws.track}
                    </span>
                    <span className="text-xs text-zinc-500">{ws.targetAudience}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {ws.description}
                  </p>

                  <div className="space-y-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{ws.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Capacity: {ws.capacity} students / batch</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setCurrentView('workshops')}
                    className="flex-1 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 rounded-lg text-center"
                  >
                    View Syllabus
                  </button>
                  <button
                    onClick={() => onOpenRegister(ws, 'workshop')}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg text-center transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Competition Achievements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
              Hall of Honors
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Championship Wins & Milestones
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('achievements')}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Awards & Certificates</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-[#0E1118] border border-zinc-800 rounded-xl p-6 space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 tabular-nums">
                  {ach.year}
                </span>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                  {ach.category}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span>{ach.rankOrAward}</span>
                </div>
                <h3 className="text-base font-bold text-white pt-1">{ach.title}</h3>
                <p className="text-xs text-zinc-500">{ach.eventName}</p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{ach.description}</p>

              <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                Team: {ach.teamMembers.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Gallery Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
              Visual Archives
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Moments from Arenas, Labs & Workshops
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('gallery')}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            <span>Explore Complete Gallery</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setCurrentView('gallery')}
              className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="p-3 bg-[#131722] flex items-center justify-center min-h-[8rem] overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <RoboVisual type={item.svgType || 'sumo'} className="h-32" />
                )}
              </div>
              <div className="p-3.5 space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{item.category}</span>
                  <span>{item.year}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 group-hover:text-red-400 transition-colors truncate">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. High-Impact Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-red-950/60 via-[#161219] to-[#0D1017] border border-red-900/40 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Compete or Bring Robotics to Your Campus?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {activeCompetitions.length > 0
                ? "Register your team for our upcoming robotics invitationals, or book our certified engineering instructors for a 2-day hands-on IoT bootcamp."
                : "Explore our hands-on engineering programs and book our certified engineering instructors for a 2-day hands-on robotics and IoT bootcamp."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {activeCompetitions.length > 0 && (
              <button
                onClick={() => onOpenRegister(activeCompetitions[0], 'event')}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap cursor-pointer"
              >
                Register for Competition
              </button>
            )}
            <button
              onClick={() => onOpenEnquiry()}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Enquire for Institution
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
