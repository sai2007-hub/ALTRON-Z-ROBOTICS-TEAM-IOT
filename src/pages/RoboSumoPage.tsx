import React from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  Scale,
  Maximize2,
  Zap,
} from 'lucide-react';

interface RoboSumoPageProps {
  onOpenRegister: (item: any, type: 'event') => void;
}

export const RoboSumoPage: React.FC<RoboSumoPageProps> = ({ onOpenRegister }) => {
  const { events } = useApp();

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

  const sumoEvent = events.find((e) => (e.slug === 'robo-sumo' || e.title?.toLowerCase().includes('sumo')) && isEventActive(e));
  const hasActiveSumo = Boolean(sumoEvent);

  const percentFilled = sumoEvent && sumoEvent.capacity
    ? Math.min(100, Math.round((sumoEvent.registeredCount / sumoEvent.capacity) * 100))
    : 0;

  const defaultSumoRules = [
    'Matches consist of three 3-minute rounds. First robot to score two Yuhkoh points wins.',
    'A point is awarded when any part of an opponent robot touches the area outside the Dohyo.',
    '5-second autonomous pause: Both robots must remain stationary for 5 seconds after starting.',
    'Active weapons that intentionally damage or foul the Dohyo ring surface are strictly forbidden.',
    'Autonomous or RC control is permitted; transmitter failsafe must immediately stop motors on signal loss.',
  ];

  const sumoRules = sumoEvent && sumoEvent.rules && sumoEvent.rules.length > 0
    ? sumoEvent.rules
    : defaultSumoRules;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#170E12] via-[#12151F] to-[#0A0D14] border border-red-900/30 p-8 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-red-500 font-bold tracking-wider uppercase">
                ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Championship Division
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">Class: 3.0 kg Heavyweight</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {sumoEvent?.title || 'Robo Sumo Championship Division'}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Two autonomous or teleoperated mechatronic giants enter the Dohyo ring. Powered by high-flux neodymium magnetic downforce and titanium wedge geometries, bots duel in three-minute rounds where only one robot stays grounded.
            </p>

            {/* Quick Specs Pill-free row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{sumoEvent?.date || 'Upcoming 2026 Schedule TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{sumoEvent?.time || 'Tournament Schedule in Preparation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>{sumoEvent?.venue || 'Host Arena TBA'}</span>
              </div>
            </div>
          </div>

          {/* Registration / Status Card in Hero */}
          <div className="lg:col-span-4 bg-[#0D1017] border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800">
              <span className="text-zinc-400">Registration Status:</span>
              <span className={`font-mono font-bold uppercase ${hasActiveSumo ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasActiveSumo ? 'Open' : 'Pending Schedule'}
              </span>
            </div>

            {hasActiveSumo && sumoEvent ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Arena Slots:</span>
                    <span className="text-white font-bold tabular-nums">
                      {sumoEvent.registeredCount} / {sumoEvent.capacity} Teams
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all"
                      style={{ width: `${percentFilled}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between">
                    <span>Entry Fee:</span>
                    <span className="font-bold text-white">{sumoEvent.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Composition:</span>
                    <span className="text-zinc-200">{sumoEvent.teamSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-red-400 font-semibold">{sumoEvent.registrationDeadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRegister(sumoEvent, 'event')}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20 text-center cursor-pointer"
                >
                  Register Team for Robo Sumo
                </button>
              </>
            ) : (
              <div className="space-y-3 py-2 text-xs text-zinc-400 leading-relaxed">
                <p>
                  Official match dates for the next Robo Sumo championship will be announced by team coordinators.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Engineering specifications, weight tolerances, and Dohyo ring schematics below are standardized and currently active for bot builders.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Schematics & Arena Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-500" />
                <span>Technical Specifications &amp; Constraints</span>
              </h2>
              <span className="text-xs font-mono text-zinc-400">CLASS STANDARD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">WEIGHT LIMIT</span>
                <span className="text-base font-bold text-white">3.000 kg Maximum</span>
                <p className="text-[11px] text-zinc-400">Strict digital scale tolerance +0g at official weigh-in.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">START FOOTPRINT</span>
                <span className="text-base font-bold text-white">20 cm × 20 cm</span>
                <p className="text-[11px] text-zinc-400">Unlimited expansion permitted once referee starts match.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">RING SPECIFICATION</span>
                <span className="text-base font-bold text-white">154 cm Dohyo</span>
                <p className="text-[11px] text-zinc-400">Cold-rolled steel with 5cm white border line ring perimeter.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">AUTONOMOUS DELAY</span>
                <span className="text-base font-bold text-white">5.0 Seconds</span>
                <p className="text-[11px] text-zinc-400">Mandatory pause before motion initiation on start signal.</p>
              </div>
            </div>

            {/* Visual Arena Graphic */}
            <div className="p-4 bg-[#080A0E] border border-zinc-800/80 rounded-lg">
              <RoboVisual type="sumo" className="h-64" title="Official 154cm Steel Dohyo Layout" />
            </div>
          </div>
        </div>

        {/* Tournament Rules & Disqualification Policy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span>Tournament Match Rules</span>
              </h2>
            </div>

            <ul className="space-y-3.5 text-xs text-zinc-300">
              {sumoRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="font-mono text-red-500 font-bold shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Prohibited Weapons & Materials</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Liquid sprays, sticky adhesives, electro-magnetic pulse coils, flamethrowers, and tethering nets result in immediate referee disqualification.
              </p>
            </div>

            {hasActiveSumo && sumoEvent && (
              <div className="pt-2">
                <button
                  onClick={() => onOpenRegister(sumoEvent, 'event')}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors text-center cursor-pointer"
                >
                  Register Your Sumo Bot Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
