import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, Calendar, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements, isAdmin } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Dynamically compute available years
  const availableYears = Array.from(
    new Set(['2026', '2025', '2024', ...achievements.map((a) => String(a.year))])
  ).sort((a, b) => Number(b) - Number(a));
  const years = ['All', ...availableYears];

  const categories = ['All', 'National', 'International', 'Regional', 'University', 'Hackathon'];

  // Public visitors see published items; Admins see all
  const visibleAchievements = isAdmin
    ? achievements
    : achievements.filter((ach) => ach.published !== false);

  const filteredAchievements = visibleAchievements.filter((ach) => {
    const matchesYear = selectedYear === 'All' || String(ach.year) === selectedYear;
    const matchesCategory = selectedCategory === 'All' || ach.category === selectedCategory;
    return matchesYear && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            Track Record of Excellence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Competition Wins & Honors
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
            From national robotics championships to international mechatronics symposiums, ALTRON&apos;Z ROBOTICS TEAM &amp; IOT competitive squads bring trophies home.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === y
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === c
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement List */}
      {filteredAchievements.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Honors Recorded for this Filter</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Try choosing a different year or category from the filter controls above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-2 flex md:flex-col items-center md:items-start justify-between gap-2">
                <span className="text-2xl font-black font-mono text-red-500 tabular-nums">
                  {ach.year}
                </span>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {ach.category}
                </span>
              </div>

              <div className="md:col-span-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span>{ach.position || ach.rankOrAward}</span>
                  {ach.prizeDetails && (
                    <span className="text-zinc-400 font-normal">· {ach.prizeDetails}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{ach.title}</h3>
                <p className="text-xs text-zinc-400 font-medium">{ach.eventName}</p>
                <p className="text-xs text-zinc-300 leading-relaxed pt-1">{ach.description}</p>
              </div>

              {ach.imageUrl && (
                <div className="md:col-span-2 flex justify-center">
                  <img
                    src={ach.imageUrl}
                    alt={ach.title}
                    className="w-24 h-24 object-cover rounded-lg border border-amber-500/30 shadow-md"
                    loading="lazy"
                  />
                </div>
              )}

              <div
                className={`${
                  ach.imageUrl ? 'md:col-span-2' : 'md:col-span-4'
                } space-y-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-800/80 md:pl-6 text-xs font-mono`}
              >
                {ach.teamMembers && ach.teamMembers.length > 0 && (
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TEAM MEMBERS</span>
                    <span className="text-zinc-300">{ach.teamMembers.join(', ')}</span>
                  </div>
                )}
                {ach.certificateId && (
                  <div className="flex items-center gap-1.5 text-zinc-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[11px] text-zinc-500">ID: {ach.certificateId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
