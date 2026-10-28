import React from 'react';
import { PageView } from './Navbar';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Info } from 'lucide-react';
import { AltronzLogo } from '../common/AltronzLogo';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  setCurrentView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const { footerAboutConfig } = useApp();

  const handleNav = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (targetView: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    handleNav(targetView as PageView);
  };

  const displayYear = footerAboutConfig.copyrightYear || new Date().getFullYear().toString();

  return (
    <footer className="bg-[#050608] border-t border-white/5 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Wordmark & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="text-left focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg cursor-pointer"
              title={footerAboutConfig.teamName || "ALTRON'Z ROBOTICS TEAM & IOT"}
            >
              <AltronzLogo size="md" showSubtitle={true} />
            </button>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {footerAboutConfig.shortDescription}
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>EST. {footerAboutConfig.establishedYear || '2022'}</span>
              <span>·</span>
              <span>{footerAboutConfig.subtitle || 'Robotics & Embedded Systems'}</span>
            </div>
          </div>

          {/* Col 2: Competitions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Competitions</h4>
            <ul className="space-y-2">
              {footerAboutConfig.competitionLinks && footerAboutConfig.competitionLinks.length > 0 ? (
                footerAboutConfig.competitionLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleLinkClick(link.targetView, link.externalUrl)}
                      className="hover:text-red-400 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-zinc-600 italic">No public competition listings</li>
              )}
            </ul>
          </div>

          {/* Col 3: Workshops & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Workshops &amp; R&amp;D</h4>
            <ul className="space-y-2">
              {footerAboutConfig.workshopLinks && footerAboutConfig.workshopLinks.length > 0 ? (
                footerAboutConfig.workshopLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleLinkClick(link.targetView, link.externalUrl)}
                      className="hover:text-red-400 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-zinc-600 italic">No workshop links</li>
              )}
            </ul>
          </div>

          {/* Col 4: Laboratory & Inquiries */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Laboratory &amp; Inquiries</h4>
            <div className="space-y-2 text-xs">
              {footerAboutConfig.labAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                  <span>{footerAboutConfig.labAddress}</span>
                </div>
              )}
              {footerAboutConfig.officialEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <a href={`mailto:${footerAboutConfig.officialEmail}`} className="hover:text-white">
                    {footerAboutConfig.officialEmail}
                  </a>
                </div>
              )}
              {footerAboutConfig.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <a href={`tel:${footerAboutConfig.contactPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-white">
                    {footerAboutConfig.contactPhone}
                  </a>
                </div>
              )}
              {footerAboutConfig.workingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span className="text-zinc-400">{footerAboutConfig.workingHours}</span>
                </div>
              )}
              {footerAboutConfig.visitingNotice && (
                <div className="flex items-start gap-2 text-[11px] text-zinc-500 pt-1">
                  <Info className="w-3 h-3 shrink-0 text-zinc-400 mt-0.5" />
                  <span className="line-clamp-2">{footerAboutConfig.visitingNotice}</span>
                </div>
              )}
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
            © {displayYear} {footerAboutConfig.copyrightText || `${footerAboutConfig.teamName}. All rights reserved.`}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {footerAboutConfig.footerLinks && footerAboutConfig.footerLinks.length > 0 ? (
              footerAboutConfig.footerLinks.map((link, idx) => (
                <React.Fragment key={link.id || idx}>
                  {idx > 0 && <span>·</span>}
                  <button
                    onClick={() => handleLinkClick(link.targetView, link.externalUrl)}
                    className="hover:text-zinc-300"
                  >
                    {link.label}
                  </button>
                </React.Fragment>
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
