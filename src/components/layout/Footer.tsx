import React from 'react';
import { PageView } from './Navbar';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { AltronzLogo } from '../common/AltronzLogo';

interface FooterProps {
  setCurrentView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const handleNav = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050608] border-t border-white/5 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Wordmark & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="text-left focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg cursor-pointer"
              title="ALTRON'Z ROBOTICS TEAM & IOT"
            >
              <AltronzLogo size="md" showSubtitle={true} />
            </button>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Student-driven robotics and autonomous engineering organization. We design competition-grade combat &amp; soccer robots, build embedded IoT architectures, and conduct immersive STEM workshops for schools and colleges nationwide.
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>EST. 2022</span>
              <span>·</span>
              <span>Robotics & Embedded Systems</span>
            </div>
          </div>

          {/* Col 2: Competitions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Competitions</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('sumo')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Robo Sumo (3kg Class)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('soccer')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Robo Soccer (Omni 2v2)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('events')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Micro-Mouse Maze Runner
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('events')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Drone Obstacle Challenge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Workshops & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Workshops & R&D</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('workshops')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  School STEM Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('workshops')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  College IoT & Telemetry
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('workshops')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Bare-Metal ARM Firmware
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('projects')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Active Hardware Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('achievements')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Hall of Achievements
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Laboratory & Inquiries</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                <span>Robotics Innovation Center, Block 4, Tech Campus</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <a href="mailto:contact@altronz.org" className="hover:text-white">
                  contact@altronz.org
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>+1 (555) 726-2687</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleNav('login')}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white py-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Administrative Control Console</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} ALTRON&apos;Z ROBOTICS TEAM &amp; IOT. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('about')} className="hover:text-zinc-300">
              Team Charter
            </button>
            <span>·</span>
            <button onClick={() => handleNav('contact')} className="hover:text-zinc-300">
              Host a Workshop
            </button>
            <span>·</span>
            <button onClick={() => handleNav('login')} className="hover:text-zinc-300">
              Staff Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
