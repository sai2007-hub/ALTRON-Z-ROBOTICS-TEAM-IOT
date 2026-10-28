import React from 'react';
import { Target, Compass, Cpu, Wrench, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { footerAboutConfig } = useApp();

  const renderIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="w-6 h-6 text-red-500" />;
      case 'wrench':
        return <Wrench className="w-6 h-6 text-red-500" />;
      case 'award':
      default:
        return <Award className="w-6 h-6 text-red-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#170E12] via-[#10141F] to-[#0A0D14] border border-red-900/30 p-8 sm:p-12 overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
            {footerAboutConfig.heroBadge || 'Engineering Identity & Pedagogy'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {footerAboutConfig.heroTitle || 'Forging Autonomous Excellence Through Hardware First'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {footerAboutConfig.heroDescription}
          </p>
        </div>
      </div>

      {/* Mission & Vision Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {footerAboutConfig.missionTitle || 'Our Mission'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {footerAboutConfig.missionDescription}
          </p>
          {footerAboutConfig.missionPoints && footerAboutConfig.missionPoints.length > 0 && (
            <ul className="space-y-2 text-xs text-zinc-300 pt-2">
              {footerAboutConfig.missionPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {footerAboutConfig.visionTitle || 'Our Vision'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {footerAboutConfig.visionDescription}
          </p>
          {footerAboutConfig.visionPoints && footerAboutConfig.visionPoints.length > 0 && (
            <ul className="space-y-2 text-xs text-zinc-300 pt-2">
              {footerAboutConfig.visionPoints.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Core Activities Breakdown */}
      <div className="bg-[#0A0C11] border border-zinc-800 rounded-2xl p-8 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-mono text-red-500 uppercase tracking-widest block mb-1">
            Operational Pillars
          </span>
          <h2 className="text-2xl font-bold text-white">Three Core Technical Disciplines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {footerAboutConfig.disciplines && footerAboutConfig.disciplines.length > 0 ? (
            footerAboutConfig.disciplines.map((disc) => (
              <div key={disc.id} className="bg-[#121520] border border-zinc-800 p-6 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  {renderIcon(disc.iconType)}
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {disc.disciplineNumber || disc.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{disc.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {disc.description}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-zinc-500 text-xs italic">
              Disciplines details currently in preparation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
