import React from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Shield,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';

interface RoboSoccerPageProps {
  onOpenRegister: (item: any, type: 'event') => void;
}

export const RoboSoccerPage: React.FC<RoboSoccerPageProps> = ({ onOpenRegister }) => {
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

  const soccerEvent = events.find((e) => (e.slug === 'robo-soccer' || e.title?.toLowerCase().includes('soccer')) && isEventActive(e));
  const hasActiveSoccer = Boolean(soccerEvent);

  const percentFilled = soccerEvent && soccerEvent.capacity
    ? Math.min(100, Math.round((soccerEvent.registeredCount / soccerEvent.capacity) * 100))
    : 0;

  const defaultSoccerRules = [
    'Match consists of two 7-minute halves with a 3-minute technical interval.',
    'Teams field two teleoperated or autonomous robots communicating on 2.4 GHz.',
    'Ball possession limit: Bot cannot retain mechanical control of ball for > 3 seconds without moving.',
    'Intentional chassis ramming into immobile or dead robots results in a 1-minute penalty.',
    'Goals scored directly from kickoff restart require at least one teammate touch to count.',
  ];

  const soccerRules = soccerEvent && soccerEvent.rules && soccerEvent.rules.length > 0
    ? soccerEvent.rules
    : defaultSoccerRules;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0D151F] via-[#121624] to-[#0A0D14] border border-blue-900/30 p-8 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-red-500 font-bold tracking-wider uppercase">
                ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Tactical League
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">2-vs-2 Holonomic Soccer</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {soccerEvent?.title || 'Robo Soccer Invitational Tactical League'}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Precision omnidirectional mobility meets high-frequency ball pursuit. Robots equipped with three-wheel holonomic bases, IR beacon tracking arrays, and electronic kickers compete in two 7-minute halves on an official miniature turf pitch.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{soccerEvent?.date || 'Upcoming 2026 Schedule TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{soccerEvent?.time || 'Tournament Schedule in Preparation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>{soccerEvent?.venue || 'Host Arena TBA'}</span>
              </div>
            </div>
          </div>

          {/* Registration / Status Card */}
          <div className="lg:col-span-4 bg-[#0D1017] border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800">
              <span className="text-zinc-400">Registration Status:</span>
              <span className={`font-mono font-bold uppercase ${hasActiveSoccer ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasActiveSoccer ? 'Open' : 'Pending Schedule'}
              </span>
            </div>

            {hasActiveSoccer && soccerEvent ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Arena Slots:</span>
                    <span className="text-white font-bold tabular-nums">
                      {soccerEvent.registeredCount} / {soccerEvent.capacity} Teams
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
                    <span className="font-bold text-white">{soccerEvent.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team Composition:</span>
                    <span className="text-zinc-200">{soccerEvent.teamSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-red-400 font-semibold">{soccerEvent.registrationDeadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRegister(soccerEvent, 'event')}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20 text-center cursor-pointer"
                >
                  Register Team for Robo Soccer
                </button>
              </>
            ) : (
              <div className="space-y-3 py-2 text-xs text-zinc-400 leading-relaxed">
                <p>
                  Official tournament schedule and match times for the next Robo Soccer Invitational will be published soon.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Pitch boundary measurements, omni-wheel drive rules, and electronic kicker safety guidelines below remain in effect.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <span>Pitch Dimensions &amp; Robot Regulations</span>
              </h2>
              <span className="text-xs font-mono text-zinc-400">RC / AUTONOMOUS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">PITCH GEOMETRY</span>
                <span className="text-base font-bold text-white">240 cm × 180 cm</span>
                <p className="text-[11px] text-zinc-400">Non-reflective short-pile synthetic green turf.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">MAX DIAMETER</span>
                <span className="text-base font-bold text-white">22 cm Cylinder</span>
                <p className="text-[11px] text-zinc-400">Robot must fit completely into the inspection cylinder ring.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">BALL FREQUENCY</span>
                <span className="text-base font-bold text-white">40 kHz Modulated IR</span>
                <p className="text-[11px] text-zinc-400">75mm high-visibility orange electronic beacon ball.</p>
              </div>

              <div className="p-4 bg-[#121520] border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[11px] font-mono text-red-400 block">MATCH TIMING</span>
                <span className="text-base font-bold text-white">Two 7-Minute Halves</span>
                <p className="text-[11px] text-zinc-400">3-minute tactical battery swap and strategy recess.</p>
              </div>
            </div>

            <div className="p-4 bg-[#080A0E] border border-zinc-800/80 rounded-lg">
              <RoboVisual type="soccer" className="h-64" title="Omni 3-Wheel Soccer Robot Architecture" />
            </div>
          </div>
        </div>

        {/* Tactical Rules & Match Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span>Tactical Match Rules</span>
              </h2>
            </div>

            <ul className="space-y-3.5 text-xs text-zinc-300">
              {soccerRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="font-mono text-red-500 font-bold shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Activity className="w-4 h-4 text-red-500" />
                <span>Goalkeeper Protection Rule</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Ramming or jamming the defending goalkeeper within its designated goal penalty arc is penalized with an immediate free penalty strike from the midfield spot.
              </p>
            </div>

            {hasActiveSoccer && soccerEvent && (
              <div className="pt-2">
                <button
                  onClick={() => onOpenRegister(soccerEvent, 'event')}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors text-center cursor-pointer"
                >
                  Register Your Soccer Squad
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
