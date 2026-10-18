import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import { WorkshopItem } from '../types';
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Cpu,
  Building,
  GraduationCap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface WorkshopsPageProps {
  onOpenRegister: (item: WorkshopItem, type: 'workshop') => void;
  onOpenEnquiry: (track?: string) => void;
}

export const WorkshopsPage: React.FC<WorkshopsPageProps> = ({
  onOpenRegister,
  onOpenEnquiry,
}) => {
  const { workshops, isAdmin } = useApp();
  const [activeTrack, setActiveTrack] = useState<string>('All');
  const [selectedWorkshopModal, setSelectedWorkshopModal] = useState<WorkshopItem | null>(null);

  const tracks = ['All', 'Robotics', 'IoT', 'Embedded Systems', 'AI & Vision'];

  const visibleWorkshops = isAdmin
    ? workshops
    : workshops.filter((w) => w.status === 'published' || (w.status !== 'draft' && w.published !== false));

  const filteredWorkshops =
    activeTrack === 'All'
      ? visibleWorkshops
      : visibleWorkshops.filter((w) => w.track === activeTrack);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#170E12] via-[#10141F] to-[#0A0D14] border border-red-900/30 p-8 sm:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-red-500 font-bold uppercase tracking-wider">
              <span>ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Outreach</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Hands-On Robotics, IoT & Embedded Systems Workshops
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              We empower school and college students with practical hardware engineering skills. Rather than purely theoretical slides, every participant writes firmware, solders circuits, and programs microcontrollers using industry-standard tools.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenEnquiry()}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg shadow-red-600/20 whitespace-nowrap"
              >
                Host a Workshop at Your School / College
              </button>
            </div>
          </div>

          {/* Quick Statistics Card */}
          <div className="lg:col-span-4 bg-[#0D1017] border border-zinc-800 rounded-xl p-6 space-y-4 text-xs font-mono">
            <h4 className="text-white font-bold tracking-tight font-sans text-sm pb-2 border-b border-zinc-800">
              Institutional Program Impact
            </h4>
            <div className="flex justify-between">
              <span className="text-zinc-500">Curriculums:</span>
              <span className="text-zinc-200">5 Accredited Tracks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Hardware Delivery:</span>
              <span className="text-zinc-200">1 Kit Per 2 Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Partner Campuses:</span>
              <span className="text-zinc-200">32+ Institutions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Certification:</span>
              <span className="text-red-400 font-semibold">Verified Tech Certificate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Curated Technical Tracks
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Choose an engineering domain to explore syllabus, schedule, and hardware kits.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTrack === track
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Workshops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredWorkshops.map((ws) => {
          const visualType =
            ws.track === 'IoT'
              ? 'iot'
              : ws.track === 'Embedded Systems'
              ? 'lab'
              : ws.track === 'AI & Vision'
              ? 'rover'
              : 'workshop';

          return (
            <div
              key={ws.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="p-4 bg-[#111420] border-b border-zinc-800/80">
                  <RoboVisual type={visualType} className="h-44" title={ws.track} />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-red-400 font-semibold uppercase">
                      {ws.track}
                    </span>
                    <span className="text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded text-[11px]">
                      Audience: {ws.targetAudience}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">{ws.title}</h3>

                  <p className="text-xs text-zinc-400 leading-relaxed">{ws.description}</p>

                  {/* Modules Preview */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Core Modules Covered
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {ws.modules.slice(0, 3).map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-zinc-400 font-mono border-t border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">DURATION</span>
                      <span className="text-zinc-200">{ws.duration}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">CAPACITY</span>
                      <span className="text-zinc-200">{ws.capacity} students / batch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  onClick={() => setSelectedWorkshopModal(ws)}
                  className="flex-1 py-2 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-center transition-colors"
                >
                  Full Syllabus & Kits
                </button>
                <button
                  onClick={() => onOpenRegister(ws, 'workshop')}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg text-center transition-colors shadow-sm shadow-red-600/20"
                >
                  Individual Enrollment
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Syllabus & Hardware Kit Modal */}
      {selectedWorkshopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase tracking-widest block">
                  {selectedWorkshopModal.track} Track
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedWorkshopModal.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWorkshopModal(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedWorkshopModal.description}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Full Curriculum Breakdown
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {selectedWorkshopModal.modules.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-red-500 font-bold shrink-0">
                      Module {idx + 1}:
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Hardware & Kits Provided to Students
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedWorkshopModal.hardwareProvided.map((hw, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-zinc-300 bg-[#161B26] border border-zinc-700/60 px-2.5 py-1 rounded"
                  >
                    {hw}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-800 pt-4">
              <span>Prerequisites: {selectedWorkshopModal.prerequisites}</span>
              <button
                onClick={() => {
                  const target = selectedWorkshopModal;
                  setSelectedWorkshopModal(null);
                  onOpenRegister(target, 'workshop');
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Enroll in Workshop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Host Callout */}
      <div className="rounded-2xl bg-[#0F131D] border border-zinc-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-xl font-bold text-white">
            Are You a Teacher, Professor, or Robotics Club Faculty Head?
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We provide all robot chassis components, sensor modules, development boards, and digital presentation materials directly to your campus lab.
          </p>
        </div>
        <button
          onClick={() => onOpenEnquiry()}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-red-600/20"
        >
          Request Institutional Proposal
        </button>
      </div>
    </div>
  );
};
