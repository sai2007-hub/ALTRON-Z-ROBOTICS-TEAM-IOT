import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeamMember } from '../types';
import { Mail, Linkedin, Github, Cpu, ShieldCheck, User as UserIcon } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { teamMembers, isAdmin } = useApp();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('All');
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const subsystems = [
    'All',
    'Leadership',
    'Embedded & Firmware',
    'Mechanical & CAD',
    'Computer Vision & AI',
    'Operations & Outreach',
  ];

  // Public visitors see published members; Admins see all
  const visibleTeam = isAdmin
    ? teamMembers
    : teamMembers.filter((m) => m.published !== false);

  const filteredTeam =
    selectedSubsystem === 'All'
      ? visibleTeam
      : visibleTeam.filter((m) => m.subsystem === selectedSubsystem);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            Engineers & Innovators
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet the ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Crew
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
            A multidisciplinary engineering crew uniting mechanical designers, embedded systems architects, control theorists, and STEM mentors.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
          {subsystems.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubsystem(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSubsystem === sub
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Team Cards Grid */}
      {filteredTeam.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Team Profiles in this Subsystem</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Profiles in &ldquo;{selectedSubsystem}&rdquo; are currently being configured or updated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-6"
            >
              <div className="space-y-4">
                {/* Avatar & Badging */}
                <div className="flex items-center gap-4">
                  {member.imageUrl && !failedAvatars[member.id] ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      onError={() => setFailedAvatars((prev) => ({ ...prev, [member.id]: true }))}
                      className="w-14 h-14 rounded-xl object-cover border border-red-500/40 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg font-mono shrink-0">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{member.name}</h3>
                      {member.isLead && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-800/80 text-red-400">
                          LEAD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-red-400 font-medium">{member.role}</p>
                    <p className="text-[11px] text-zinc-400">{member.department || member.yearAndDept}</p>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {member.bio}
                </div>

                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                      Technical Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] text-zinc-300 bg-[#141824] border border-zinc-800 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact row */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="truncate max-w-[160px]">{member.email || "ALTRON'Z Lab"}</span>
                <div className="flex items-center gap-2 text-zinc-400">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-400 transition-colors p-1"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-400 transition-colors p-1"
                      title="GitHub Profile"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-red-400 transition-colors p-1"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
