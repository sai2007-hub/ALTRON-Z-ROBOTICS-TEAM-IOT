import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import { EventItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  Shield,
  Layers,
  CheckCircle,
  Trophy,
} from 'lucide-react';

interface OtherEventsPageProps {
  onOpenRegister: (item: EventItem, type: 'event') => void;
  onNavigateToDedicated: (slug: string) => void;
}

export const OtherEventsPage: React.FC<OtherEventsPageProps> = ({
  onOpenRegister,
  onNavigateToDedicated,
}) => {
  const { events, isAdmin } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  const categories = ['All', 'Combat', 'Sports', 'Autonomous', 'Aerial'];

  const isEventActive = (evt: EventItem) => {
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

  const visibleEvents = isAdmin
    ? events.filter((e) => !['evt-1', 'evt-2', 'evt-3', 'evt-4'].includes(e.id))
    : events.filter(isEventActive);

  const filteredEvents =
    selectedCategory === 'All'
      ? visibleEvents
      : visibleEvents.filter((e) => e.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Competitions &amp; Rulebooks
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Robotics Tournaments & Challenges
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
            From high-torque combat sumos and tactical robot football to autonomous micro-mouse pathfinding and precision aerial drone navigation.
          </p>
        </div>

        {/* Filter Segmented Control */}
        {visibleEvents.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events Grid or Clean Empty Notice */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#0A0D14] border border-zinc-800/60 rounded-2xl p-8 max-w-xl mx-auto">
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-200">No Active Tournaments Scheduled</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tournaments for the upcoming season are currently being prepared by the coordinators. Published competitions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((evt) => {
          const visualType =
            evt.slug === 'robo-sumo'
              ? 'sumo'
              : evt.slug === 'robo-soccer'
              ? 'soccer'
              : evt.slug === 'drone-obstacle'
              ? 'drone'
              : 'rover';

          const percentFilled = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

          return (
            <div
              key={evt.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div>
                <div className="p-4 bg-[#111420] border-b border-zinc-800/80 flex items-center justify-center min-h-[11rem] overflow-hidden">
                  {evt.posterUrl || evt.secureUrl ? (
                    <img
                      src={evt.posterUrl || evt.secureUrl}
                      alt={evt.title}
                      className="w-full h-44 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <RoboVisual type={visualType} className="h-44" title={evt.category} />
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono text-red-400 font-semibold">{evt.category}</span>
                    <span>{evt.teamSize}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {evt.shortDescription}
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-500">Registered:</span>
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
                </div>
              </div>

              {/* Action Strip */}
              <div className="p-6 pt-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (evt.slug === 'robo-sumo') {
                      onNavigateToDedicated('sumo');
                    } else if (evt.slug === 'robo-soccer') {
                      onNavigateToDedicated('soccer');
                    } else {
                      setSelectedEventModal(evt);
                    }
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-center transition-colors"
                >
                  View Details & Rules
                </button>
                <button
                  onClick={() => onOpenRegister(evt, 'event')}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg text-center transition-colors shadow-sm shadow-red-600/20"
                >
                  Register
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Individual Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase tracking-widest block">
                  {selectedEventModal.category} Competition
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedEventModal.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedEventModal.fullDescription}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Date & Timing</span>
                <span className="text-zinc-200">{selectedEventModal.date} ({selectedEventModal.time})</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Venue Location</span>
                <span className="text-zinc-200">{selectedEventModal.venue}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Entry Fee</span>
                <span className="text-zinc-200">{selectedEventModal.entryFee}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Team Composition</span>
                <span className="text-zinc-200">{selectedEventModal.teamSize}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tournament Rules</h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {selectedEventModal.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-mono font-bold shrink-0">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedEventModal;
                  setSelectedEventModal(null);
                  onOpenRegister(target, 'event');
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Register for this Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
