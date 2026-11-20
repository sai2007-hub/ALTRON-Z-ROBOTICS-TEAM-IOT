
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail, Linkedin, Github, Cpu, ShieldCheck, Users,
  Sparkles, ArrowUpRight, User as UserIcon
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { teamMembers, isAdmin } = useApp();
  const [selectedSubsystem, setSelectedSubsystem] = useState('All');
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const subsystems = [
    'All',
    'Leadership',
    'Embedded & Firmware',
    'Mechanical & CAD',
    'Computer Vision & AI',
    'Operations & Outreach',
  ];

  const visibleTeam = isAdmin
    ? teamMembers
    : teamMembers.filter(member => member.published !== false);

  const filteredTeam = selectedSubsystem === 'All'
    ? visibleTeam
    : visibleTeam.filter(member => member.subsystem === selectedSubsystem);

  const glass =
    'rounded-3xl border border-white/10 bg-white/[.055] backdrop-blur-xl shadow-[0_18px_60px_rgba(2,6,23,.25)]';

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#07101f] pb-20 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[.09]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.2) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Team introduction */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid items-end gap-7 lg:grid-cols-[.65fr_1.5fr_1fr]">
          <div className="text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">
            [ OUR TEAM ]
            <div className="mt-3 h-px w-12 bg-cyan-300/60" />
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-violet-200/80">
              ALTRON'Z / People behind the machines
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Meet the
              <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                Innovators.
              </span>
            </h1>
          </div>

          <p className="max-w-sm text-sm leading-7 text-slate-300/70 lg:justify-self-end">
            The people who turn ambitious ideas into engineered systems.
            Meet the students, builders and mentors behind ALTRON'Z Robotics Team & IoT.
          </p>
        </div>

        {/* Team metrics */}
        <div className={`${glass} mt-10 grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 sm:p-6`}>
          <div>
            <Users className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-2xl font-black">{visibleTeam.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Team members</p>
          </div>
          <div>
            <Cpu className="h-5 w-5 text-violet-200" />
            <p className="mt-3 text-2xl font-black">
              {new Set(visibleTeam.map(member => member.subsystem).filter(Boolean)).size}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Engineering domains</p>
          </div>
          <div className="col-span-2 border-t border-white/10 pt-4 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <Sparkles className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-sm font-bold">One team. Many disciplines.</p>
            <p className="mt-1 text-[10px] text-slate-400">Built through collaboration.</p>
          </div>
        </div>
      </section>

      {/* Subsystem filters */}
      <section className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">
              The people
            </p>
            <h2 className="mt-1 text-xl font-bold">Our engineering crew</h2>
          </div>
          <p className="text-xs text-slate-400">
            Showing {filteredTeam.length} member{filteredTeam.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3">
          {subsystems.map(subsystem => (
            <button
              key={subsystem}
              onClick={() => setSelectedSubsystem(subsystem)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                selectedSubsystem === subsystem
                  ? 'border-cyan-200/40 bg-cyan-200/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,.08)]'
                  : 'border-white/10 bg-white/[.04] text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {subsystem}
            </button>
          ))}
        </div>
      </section>

      {/* Member profiles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {filteredTeam.length === 0 ? (
          <div className={`${glass} px-5 py-20 text-center`}>
            <UserIcon className="mx-auto h-12 w-12 text-cyan-200/60" />
            <h3 className="mt-5 text-xl font-bold">
              No profiles in this department
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Profiles in {selectedSubsystem} are currently being configured or updated.
            </p>
            <button
              onClick={() => setSelectedSubsystem('All')}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-bold"
            >
              View all members
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredTeam.map(member => {
              const initials = member.name
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2);

              return (
                <article
                  key={member.id}
                  className={`${glass} group relative flex min-h-[390px] flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30`}
                >
                  {/* Member photo */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-800 via-[#111b35] to-violet-950/60 sm:h-72">
                    {member.imageUrl && !failedAvatars[member.id] ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        onError={() => setFailedAvatars(prev => ({
                          ...prev,
                          [member.id]: true
                        }))}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-200/20 bg-white/[.06] text-3xl font-black text-cyan-100 shadow-xl">
                          {initials}
                        </div>
                        <p className="mt-4 text-[10px] uppercase tracking-[.2em] text-slate-400">
                          ALTRON'Z TEAM
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07101f] via-transparent to-slate-950/10" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {member.isLead && (
                        <span className="rounded-full border border-amber-200/20 bg-amber-300/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md">
                          <ShieldCheck className="mr-1 inline h-3 w-3" />
                          Team lead
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-200">
                        {member.subsystem || 'ALTRON\'Z TEAM'}
                      </p>
                      <h3 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
                        {member.name}
                      </h3>
                    </div>
                  </div>

                  {/* Member details */}
                  <div className="flex flex-1 flex-col p-5">
                    <div>
                      <p className="text-sm font-bold text-violet-200">
                        {member.role}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {member.department || member.yearAndDept}
                      </p>
                    </div>

                    {member.bio && (
                      <p className="mt-4 line-clamp-4 text-xs leading-6 text-slate-300/70">
                        {member.bio}
                      </p>
                    )}

                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">
                          Technical skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {member.skills.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="rounded-lg border border-white/10 bg-white/[.05] px-2.5 py-1.5 text-[10px] text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social links */}
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="max-w-[65%] truncate text-[10px] text-slate-500">
                        {member.email || "ALTRON'Z Lab"}
                      </span>
                      <div className="flex items-center gap-3 text-slate-400">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} LinkedIn profile`}
                            className="transition hover:text-cyan-200"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} GitHub profile`}
                            className="transition hover:text-cyan-200"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            aria-label={`Email ${member.name}`}
                            className="transition hover:text-cyan-200"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        <ArrowUpRight className="h-4 w-4 text-cyan-200/70" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Closing message */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className={`${glass} relative overflow-hidden p-7 text-center sm:p-10`}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
          <p className="relative text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">
            ALTRON'Z / Together we engineer
          </p>
          <h2 className="relative mt-3 text-2xl font-black sm:text-3xl">
            Different minds. One engineering vision.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300/70">
            Every build is powered by teamwork, curiosity and the drive to create something meaningful.
          </p>
        </div>
      </section>
    </main>
  );
};
