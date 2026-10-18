import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import { ProjectItem } from '../types';
import { Cpu, Wrench, Layers, CheckCircle2, ArrowUpRight, Github, ExternalLink, Bot } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, isAdmin } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Competition Bot', 'Autonomous', 'IoT Solution', 'Research Prototype'];

  // Public visitors see published projects; Admins see all
  const visibleProjects = isAdmin
    ? projects
    : projects.filter((p) => p.published !== false);

  const filteredProjects =
    activeCategory === 'All'
      ? visibleProjects
      : visibleProjects.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            Mechatronics & Embedded R&D
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineering Projects & Robot Builds
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
            Robotic systems engineered by ALTRON&apos;Z ROBOTICS TEAM &amp; IOT student engineers from schematic design and topology optimization to bare-metal firmware.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#12151F] border border-zinc-800 rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Projects in this Category</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Choose &ldquo;All&rdquo; or another category above to view completed and active builds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((proj) => {
            const visualType =
              proj.category === 'Competition Bot' && proj.title.includes('Sumo')
                ? 'sumo'
                : proj.category === 'Competition Bot' && proj.title.includes('Omni')
                ? 'soccer'
                : proj.category === 'IoT Solution'
                ? 'rover'
                : 'lab';

            return (
              <div
                key={proj.id}
                className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all group"
              >
                <div>
                  <div className="p-3 bg-[#111420] border-b border-zinc-800/80 overflow-hidden flex items-center justify-center min-h-[12rem]">
                    {proj.imageUrl && !failedImages[proj.id] ? (
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        onError={() => setFailedImages((prev) => ({ ...prev, [proj.id]: true }))}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <RoboVisual type={visualType} className="h-48" title={proj.category} />
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-red-400 font-semibold uppercase">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {proj.status}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px] bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
                          Lead: {proj.teamLead}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      {proj.summary}
                    </p>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>

                    {/* Tech stack tags */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
                          Subsystem Technologies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-zinc-300 bg-[#141824] border border-zinc-800 px-2 py-0.5 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hardware specs strip */}
                    {proj.hardwareSpecs && proj.hardwareSpecs.length > 0 && (
                      <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                        {proj.hardwareSpecs.slice(0, 2).map((spec, idx) => (
                          <div key={idx}>
                            <span className="text-zinc-500 text-[10px] block">{spec.label}</span>
                            <span className="text-zinc-200 font-semibold truncate block">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 text-xs flex items-center gap-1.5"
                        title="GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 text-xs flex items-center gap-1.5"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo</span>
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="flex-1 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
                    >
                      <span>View Engineering Specs</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-mono text-red-500 uppercase tracking-widest block">
                  {selectedProject.category} // {selectedProject.status}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-2 bg-[#080A0E] rounded-lg border border-zinc-800 flex items-center justify-center">
              {selectedProject.imageUrl ? (
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              ) : (
                <RoboVisual
                  type={selectedProject.title.includes('Sumo') ? 'sumo' : 'rover'}
                  className="h-56"
                />
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block uppercase font-mono text-[10px]">Synopsis</span>
                <p className="text-zinc-300 font-medium mt-0.5">{selectedProject.summary}</p>
              </div>

              <div>
                <span className="text-zinc-500 block uppercase font-mono text-[10px]">Detailed Architecture</span>
                <p className="text-zinc-400 leading-relaxed mt-0.5">{selectedProject.description}</p>
              </div>

              {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 && (
                <div>
                  <span className="text-zinc-500 block uppercase font-mono text-[10px]">Project Team</span>
                  <p className="text-zinc-300 mt-0.5">{selectedProject.teamMembers.join(', ')}</p>
                </div>
              )}

              {selectedProject.hardwareSpecs && selectedProject.hardwareSpecs.length > 0 && (
                <div>
                  <span className="text-zinc-500 block uppercase font-mono text-[10px] mb-1.5">
                    Hardware Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-[#0B0D14] p-3 rounded-lg border border-zinc-800">
                    {selectedProject.hardwareSpecs.map((s, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-zinc-800/60 text-[11px]">
                        <span className="text-zinc-400">{s.label}:</span>
                        <span className="font-mono text-zinc-200 font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              )}
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
