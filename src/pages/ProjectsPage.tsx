
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import { ProjectItem } from '../types';
import {
  Cpu, Wrench, Layers, CheckCircle2, ArrowUpRight,
  Github, ExternalLink, Bot, X, Sparkles, Code2,
  CircuitBoard, ChevronRight
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, isAdmin } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const categories = [
    'All', 'Competition Bot', 'Autonomous',
    'IoT Solution', 'Research Prototype'
  ];

  const visibleProjects = isAdmin
    ? projects
    : projects.filter(p => p.published !== false);

  const filteredProjects = activeCategory === 'All'
    ? visibleProjects
    : visibleProjects.filter(p => p.category === activeCategory);

  const glass =
    'rounded-3xl border border-white/10 bg-white/[.055] backdrop-blur-xl shadow-[0_18px_60px_rgba(2,6,23,.25)]';

  const visualFor = (project: ProjectItem) => {
    if (project.category === 'Competition Bot' && project.title.includes('Sumo')) return 'sumo';
    if (project.category === 'Competition Bot' && project.title.includes('Omni')) return 'soccer';
    if (project.category === 'IoT Solution') return 'rover';
    return 'lab';
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#07101f] pb-20 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-40 top-72 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[.09]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.2) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Hero heading */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[.07] px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
              ALTRON'Z / Engineering & R&D
            </div>

            <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-200/80">
              Mechatronics · Embedded Systems · Innovation
            </p>

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Ideas engineered
              <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                into reality.
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-slate-300/75 sm:text-base">
              Explore the robotics systems, competition builds, IoT solutions
              and research prototypes engineered by ALTRON'Z ROBOTICS TEAM & IOT.
            </p>
          </div>

          <div className={`${glass} grid grid-cols-2 gap-5 p-5 sm:min-w-64`}>
            <div>
              <p className="text-3xl font-black text-white">{visibleProjects.length}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">Projects</p>
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-200">
                {new Set(visibleProjects.map(p => p.category)).size}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">Domains</p>
            </div>
          </div>
        </div>

        {/* Domain highlights */}
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Bot, label: 'Robotics' },
            { icon: Cpu, label: 'Embedded' },
            { icon: CircuitBoard, label: 'IoT Systems' },
            { icon: Sparkles, label: 'Research' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={`${glass} flex items-center gap-3 p-4`}>
              <Icon className="h-5 w-5 shrink-0 text-cyan-200" />
              <span className="text-xs font-semibold text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">
              Project database
            </p>
            <h2 className="mt-1 text-xl font-bold">Explore our builds</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  activeCategory === category
                    ? 'border-cyan-200/40 bg-cyan-200/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,.08)]'
                    : 'border-white/10 bg-white/[.04] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project cards */}
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        {filteredProjects.length === 0 ? (
          <div className={`${glass} px-5 py-20 text-center`}>
            <Bot className="mx-auto h-12 w-12 text-cyan-200/60" />
            <h3 className="mt-5 text-xl font-bold">No projects in this category</h3>
            <p className="mt-2 text-sm text-slate-400">
              Choose another category to explore our engineering builds.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-bold"
            >
              View all projects
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map(project => (
              <article
                key={project.id}
                className={`${glass} group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30`}
              >
                {/* Project image */}
                <div className="relative overflow-hidden border-b border-white/10 bg-slate-950/50 p-3">
                  {project.imageUrl && !failedImages[project.id] ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      onError={() => setFailedImages(prev => ({ ...prev, [project.id]: true }))}
                      className="h-52 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.025] sm:h-64"
                      loading="lazy"
                    />
                  ) : (
                    <RoboVisual
                      type={visualFor(project)}
                      className="h-52 sm:h-64"
                      title={project.category}
                    />
                  )}

                  <div className="absolute left-6 top-6 rounded-full border border-cyan-200/20 bg-slate-950/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100 backdrop-blur">
                    {project.category}
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-emerald-200/15 bg-emerald-200/10 px-3 py-1 text-[10px] font-semibold text-emerald-200">
                      {project.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Project lead: {project.teamLead}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white transition group-hover:text-cyan-100 sm:text-2xl">
                      {project.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-200/85">
                      {project.summary}
                    </p>
                    <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-200/80">
                        <Layers className="h-3.5 w-3.5" />
                        Technology stack
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="rounded-lg border border-white/10 bg-white/[.05] px-3 py-1.5 text-[11px] text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware specifications */}
                  {project.hardwareSpecs && project.hardwareSpecs.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                      {project.hardwareSpecs.slice(0, 2).map((spec, index) => (
                        <div key={index} className="rounded-xl border border-white/[.08] bg-white/[.035] p-3">
                          <p className="text-[9px] uppercase tracking-widest text-slate-500">{spec.label}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-200">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-3 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10"
                      >
                        <Github className="h-4 w-4" /> Code
                      </a>
                    )}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-3 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" /> Demo
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="ml-auto inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-xs font-bold text-white transition hover:brightness-110 sm:flex-none"
                    >
                      Engineering specs <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Engineering specs dialog */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} engineering specifications`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-xl sm:p-6"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={`${glass} relative max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7`}
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">
                  ALTRON'Z / Engineering specifications
                </p>
                <h2 className="mt-2 text-2xl font-black">{selectedProject.title}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedProject.category} · {selectedProject.status}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Close specifications"
                className="rounded-xl border border-white/10 bg-white/[.06] p-2 text-slate-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
              {selectedProject.imageUrl && !failedImages[selectedProject.id] ? (
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  onError={() => setFailedImages(prev => ({ ...prev, [selectedProject.id]: true }))}
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <RoboVisual type={visualFor(selectedProject)} className="h-56" />
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Project synopsis</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{selectedProject.summary}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Detailed architecture</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{selectedProject.description}</p>
              </div>

              {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Project team</p>
                  <p className="mt-2 text-sm text-slate-300">{selectedProject.teamMembers.join(', ')}</p>
                </div>
              )}

              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-200">Technology stack</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech, index) => (
                      <span key={index} className="rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-xs text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.hardwareSpecs && selectedProject.hardwareSpecs.length > 0 && (
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-cyan-200">Hardware specifications</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedProject.hardwareSpecs.map((spec, index) => (
                      <div key={index} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 text-xs">
                        <span className="text-slate-400">{spec.label}</span>
                        <span className="text-right font-semibold text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-5">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-xs font-semibold hover:bg-white/10"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-xs font-bold"
              >
                Close specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
