
import React from 'react';
import { PageView } from '../components/layout/Navbar';
import { useApp } from '../context/AppContext';
import { RoboVisual } from '../components/common/RoboVisual';
import {
  ArrowRight, Trophy, Cpu, Calendar, Users, MapPin,
  Clock, Sparkles, CheckCircle, ArrowUpRight
} from 'lucide-react';

interface HomePageProps {
  setCurrentView: (view: PageView) => void;
  onOpenRegister: (item?: any, type?: 'event' | 'workshop') => void;
  onOpenEnquiry: (track?: string) => void;
}

const glass =
  'rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl shadow-[0_20px_70px_rgba(2,6,23,.25)]';

const Heading = ({ eyebrow, title, description }: {
  eyebrow: string; title: string; description?: string;
}) => (
  <div className="max-w-2xl space-y-3">
    <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-300">{eyebrow}</p>
    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{title}</h2>
    {description && <p className="text-sm sm:text-base leading-relaxed text-slate-300/75">{description}</p>}
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentView,
  onOpenRegister,
  onOpenEnquiry,
}) => {
  const { events, workshops, achievements, gallery, homepageStats } = useApp();

  const isEventActive = (evt: any) => {
    if (!evt || ['evt-1', 'evt-2', 'evt-3', 'evt-4'].includes(evt.id)) return false;
    if (evt.status !== 'published' && evt.published !== true) return false;
    if (['archived', 'closed', 'completed'].includes(String(evt.status || '').toLowerCase())) return false;
    if (evt.registrationDeadline) {
      const deadline = new Date(evt.registrationDeadline).getTime();
      if (!isNaN(deadline) && deadline < Date.now()) return false;
    }
    return true;
  };

  const activeCompetitions = events.filter(isEventActive);
  const featuredWorkshops = workshops
    .filter(w => w.status === 'published' || (w.status !== 'draft' && w.published !== false))
    .slice(0, 3);
  const recentAchievements = achievements.filter(a => a.published !== false).slice(0, 3);
  const recentGallery = gallery.filter(g => g.published !== false).slice(0, 4);

  const primaryButton =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:brightness-110';
  const secondaryButton =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.13]';

  return (
    <main className="relative isolate overflow-hidden bg-[#07101f] pb-20 text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-[110px]" />
        <div className="absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-[130px]" />
        <div className="absolute left-1/3 top-[70rem] h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[.10]"
          style={{
            backgroundImage: 'linear-gradient(rgba(148,163,184,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.2) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative z-10 space-y-7">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[.07] px-4 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-100 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.9)]" />
              Robotics · IoT · Embedded Systems
              <span className="text-white/40">/</span> 2026 Season
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[.18em] text-violet-200/80">
                ALTRON'Z ROBOTICS TEAM &amp; IOT
              </p>
              <h1 className="text-[2.7rem] font-black leading-[1.04] tracking-[-.045em] text-white sm:text-6xl lg:text-7xl">
                Build the
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  Future in Motion.
                </span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-200/75 sm:text-lg sm:leading-8">
                We design autonomous machines, engineer intelligent systems and bring hands-on robotics learning to the next generation.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {activeCompetitions.length > 0 && (
                <button onClick={() => onOpenRegister(activeCompetitions[0], 'event')} className={primaryButton}>
                  Explore competitions <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => onOpenEnquiry('Robotics & Microcontrollers')} className={secondaryButton}>
                Host a workshop <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-2 text-xs text-slate-300/75">
              {['Autonomous Mechatronics', 'Embedded Hardware', 'ESP32 & STM32'].map(label => (
                <span key={label} className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-300" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Robotics visual */}
          <div className={`${glass} relative p-3 sm:p-5`}>
            <div className="absolute -inset-1 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-violet-500/25 blur-xl" />
            <div className="mb-4 flex items-center justify-between gap-3 px-2 pt-1">
              <div>
                <p className="text-[10px] uppercase tracking-[.22em] text-cyan-200/80">Engineering lab / showcase</p>
                <h2 className="mt-1 text-lg font-bold sm:text-xl">Ideas become machines.</h2>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold text-emerald-200">ACTIVE HUB</span>
            </div>
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/60">
              <img
  src="/altronz_robotics_showcase.jpg"
  alt="ALTRON'Z Robotics and IoT engineering laboratory"
  className="h-64 w-full object-cover sm:h-[22rem]"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#07101f]/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[.2em] text-cyan-200">ALTRON'Z / R&amp;D</p>
                  <p className="mt-1 text-xl font-bold">Robotics &amp; IoT Lab</p>
                </div>
                <span className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <Cpu className="h-5 w-5 text-cyan-200" />
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4">
              {[
                ['CORE', 'Autonomous'],
                ['HARDWARE', 'ESP32 · STM32'],
                ['SYSTEMS', 'Embedded'],
                ['LEARNING', 'Hands-on'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[.08] bg-white/[.04] p-3">
                  <p className="text-[9px] tracking-[.16em] text-slate-400">{label}</p>
                  <p className="mt-1 text-xs font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic statistics */}
        {homepageStats.length > 0 && (
          <div className={`${glass} mt-12 grid grid-cols-2 gap-4 p-5 sm:mt-16 sm:grid-cols-4 sm:gap-6 sm:p-7`}>
            {homepageStats.slice(0, 4).map(stat => (
              <div key={stat.id} className="space-y-1">
                <p className="text-2xl font-black sm:text-3xl">{stat.value}</p>
                <p className="text-xs font-semibold text-cyan-100">{stat.title}</p>
                <p className="text-[11px] leading-relaxed text-slate-400">{stat.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DOMAINS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Heading eyebrow="What we engineer" title="Technology with purpose."
          description="From the first circuit to an autonomous machine, we turn curiosity into practical engineering." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Cpu, title: 'Robotics', text: 'Build, test and refine intelligent machines.' },
            { icon: Sparkles, title: 'Artificial Intelligence', text: 'Explore perception, automation and smart systems.' },
            { icon: Cpu, title: 'Embedded Systems', text: 'Work close to hardware with microcontrollers.' },
            { icon: Users, title: 'IoT & Learning', text: 'Connect devices and share practical skills.' },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className={`${glass} group p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30`}>
              <div className="mb-5 inline-flex rounded-2xl border border-cyan-200/15 bg-cyan-200/10 p-3 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300/65">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* COMPETITIONS */}
      {activeCompetitions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <Heading eyebrow="Tournament arena" title="Compete. Create. Conquer."
              description="Explore published competitions and take your build to the arena." />
            <button onClick={() => setCurrentView('events')} className="self-start text-sm font-semibold text-cyan-200 hover:text-white">
              All competitions <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeCompetitions.slice(0, 3).map(evt => {
              const visualType = evt.slug === 'robo-sumo' ? 'sumo' : evt.slug === 'robo-soccer' ? 'soccer' : 'rover';
              const capacity = Number(evt.capacity) || 0;
              const registered = Number(evt.registeredCount) || 0;
              const percentFilled = capacity > 0 ? Math.min(100, Math.round(registered / capacity * 100)) : 0;
              return (
                <article key={evt.id} className={`${glass} overflow-hidden`}>
                  <div className="border-b border-white/10 bg-slate-950/30 p-3">
                    <RoboVisual type={visualType} className="h-44" title={evt.category} />
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex justify-between gap-3 text-xs text-slate-400">
                      <span>{evt.category} Arena</span><span>{evt.teamSize}</span>
                    </div>
                    <h3 className="text-xl font-bold">{evt.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300/70">{evt.shortDescription}</p>
                    <div className="space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300/70">
                      <p><Calendar className="mr-2 inline h-4 w-4 text-cyan-200" />{evt.date}</p>
                      <p><MapPin className="mr-2 inline h-4 w-4 text-cyan-200" />{evt.venue}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Registration</span>
                        <span>{registered}{capacity ? ` / ${capacity} teams` : ' teams'}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${percentFilled}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => {
                        if (evt.slug === 'robo-sumo') setCurrentView('sumo');
                        else if (evt.slug === 'robo-soccer') setCurrentView('soccer');
                        else setCurrentView('events');
                      }} className="flex-1 rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                        Rules &amp; specs
                      </button>
                      <button onClick={() => onOpenRegister(evt, 'event')} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2.5 text-xs font-bold">
                        Register
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* WORKSHOPS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className={`${glass} p-6 sm:p-9`}>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <Heading eyebrow="STEM & higher education outreach" title="Make learning hands-on."
              description="Practical robotics, IoT and embedded systems workshops for schools and engineering colleges." />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => onOpenEnquiry()} className={primaryButton}>Request a workshop</button>
              <button onClick={() => setCurrentView('workshops')} className={secondaryButton}>Explore tracks</button>
            </div>
          </div>
          {featuredWorkshops.length > 0 && (
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {featuredWorkshops.map(ws => (
                <article key={ws.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-[10px] font-semibold text-violet-100">{ws.track}</span>
                    <span className="text-[11px] text-slate-400">{ws.targetAudience}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{ws.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/65">{ws.description}</p>
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300/70">
                    <p><Clock className="mr-2 inline h-4 w-4 text-cyan-200" />{ws.duration}</p>
                    <p><Users className="mr-2 inline h-4 w-4 text-cyan-200" />Capacity: {ws.capacity} students / batch</p>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button onClick={() => setCurrentView('workshops')} className="flex-1 rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5 text-xs font-semibold">Syllabus</button>
                    <button onClick={() => onOpenRegister(ws, 'workshop')} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2.5 text-xs font-bold">Enroll</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      {recentAchievements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <Heading eyebrow="Hall of achievement" title="Milestones worth sharing."
              description="Celebrating the teams, ideas and hard work behind every result." />
            <button onClick={() => setCurrentView('achievements')} className="self-start text-sm font-semibold text-cyan-200 hover:text-white">
              All achievements <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {recentAchievements.map(ach => (
              <article key={ach.id} className={`${glass} p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-cyan-200">{ach.year}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">{ach.category}</span>
                </div>
                <div className="mt-5 flex items-center gap-2 text-amber-200">
                  <Trophy className="h-5 w-5" /><span className="text-sm font-semibold">{ach.rankOrAward}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{ach.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{ach.eventName}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300/70">{ach.description}</p>
                <p className="mt-5 border-t border-white/10 pt-3 text-[11px] text-slate-400">Team: {ach.teamMembers.join(', ')}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {recentGallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <Heading eyebrow="Visual archives" title="Built, tested and experienced."
              description="A look inside our competitions, labs and learning sessions." />
            <button onClick={() => setCurrentView('gallery')} className="self-start text-sm font-semibold text-cyan-200 hover:text-white">
              Open gallery <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {recentGallery.map(item => (
              <button key={item.id} onClick={() => setCurrentView('gallery')} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[.05] text-left">
                <div className="h-32 overflow-hidden bg-slate-950/50 sm:h-44">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (

                    <RoboVisual type={item.svgType || 'sumo'} className="h-full" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-cyan-200/80">
                    {item.category} · {item.year}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold">
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-200/20 bg-gradient-to-br from-blue-500/20 via-[#111b35]/90 to-violet-500/20 p-7 text-center shadow-2xl shadow-blue-950/30 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-cyan-200">
              Your next build starts here
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Ready to engineer what comes next?
            </h2>
            <p className="text-sm leading-relaxed text-slate-200/75 sm:text-base">
              Join the community, compete with your ideas or bring practical robotics learning to your institution.
            </p>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <button
                onClick={() => setCurrentView('projects')}
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              >
                Explore projects
              </button>
              <button
                onClick={() => onOpenEnquiry()}
                className="rounded-xl border border-white/20 bg-white/[.08] px-6 py-3 text-sm font-semibold backdrop-blur-xl hover:bg-white/[.14]"
              >
                Connect with ALTRON'Z
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
                  