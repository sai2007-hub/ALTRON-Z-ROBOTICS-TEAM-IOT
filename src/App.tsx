import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, PageView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { RoboSumoPage } from './pages/RoboSumoPage';
import { RoboSoccerPage } from './pages/RoboSoccerPage';
import { OtherEventsPage } from './pages/OtherEventsPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { GalleryPage } from './pages/GalleryPage';
import { TeamPage } from './pages/TeamPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BotDetailsPage } from './pages/BotDetailsPage';
import { EventRegistrationModal } from './components/events/EventRegistrationModal';
import { EnquiryModal } from './components/workshops/EnquiryModal';
import { EventItem, WorkshopItem } from './types';
import { SEOManager } from './components/common/SEOManager';

function AppContent() {
  const { isAdmin } = useApp();
  const [currentView, setCurrentView] = useState<PageView>(() => {
    const hash = window.location.hash.replace('#', '') as PageView;
    const validViews: PageView[] = [
      'home',
      'about',
      'sumo',
      'soccer',
      'events',
      'workshops',
      'projects',
      'bot-details',
      'achievements',
      'gallery',
      'team',
      'contact',
      'login',
      'admin',
    ];
    return validViews.includes(hash) ? hash : 'home';
  });

  // Registration Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetRegisterItem, setTargetRegisterItem] = useState<EventItem | WorkshopItem | null>(null);
  const [targetRegisterType, setTargetRegisterType] = useState<'event' | 'workshop'>('event');

  // Workshop Enquiry Modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryTrack, setEnquiryTrack] = useState<string | undefined>(undefined);

  // Sync hash with currentView
  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageView;
      const validViews: PageView[] = [
        'home',
        'about',
        'sumo',
        'soccer',
        'events',
        'workshops',
        'projects',
        'bot-details',
        'achievements',
        'gallery',
        'team',
        'contact',
        'login',
        'admin',
      ];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenRegister = (
    item?: EventItem | WorkshopItem | null,
    type: 'event' | 'workshop' = 'event'
  ) => {
    setTargetRegisterItem(item || null);
    setTargetRegisterType(type);
    setIsRegisterOpen(true);
  };

  const handleOpenEnquiry = (track?: string) => {
    setEnquiryTrack(track);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-[#F3F4F6] selection:bg-red-600 selection:text-white">
      {/* Dynamic SEO, Social Previews & Structured Data Manager */}
      <SEOManager currentView={currentView} />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenRegister={() => handleOpenRegister()}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            setCurrentView={setCurrentView}
            onOpenRegister={handleOpenRegister}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'sumo' && <RoboSumoPage onOpenRegister={handleOpenRegister} />}
        {currentView === 'soccer' && <RoboSoccerPage onOpenRegister={handleOpenRegister} />}
        {currentView === 'events' && (
          <OtherEventsPage
            onOpenRegister={handleOpenRegister}
            onNavigateToDedicated={(slug) => {
              if (slug === 'sumo') setCurrentView('sumo');
              else if (slug === 'soccer') setCurrentView('soccer');
            }}
          />
        )}
        {currentView === 'workshops' && (
          <WorkshopsPage
            onOpenRegister={handleOpenRegister}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}
        {currentView === 'projects' && <ProjectsPage />}
        {currentView === 'bot-details' && <BotDetailsPage onOpenEnquiry={handleOpenEnquiry} />}
        {currentView === 'achievements' && <AchievementsPage />}
        {currentView === 'gallery' && <GalleryPage />}
        {currentView === 'team' && <TeamPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'login' && (
          <LoginPage
            setCurrentView={setCurrentView}
            onOpenRegister={() => handleOpenRegister()}
          />
        )}
        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <LoginPage
              setCurrentView={setCurrentView}
              onOpenRegister={() => handleOpenRegister()}
            />
          )
        )}
      </main>

      {/* Quiet Technical Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Global Modals */}
      <EventRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        targetItem={targetRegisterItem}
        targetType={targetRegisterType}
        onNavigateHome={() => {
          setIsRegisterOpen(false);
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        preselectedTrack={enquiryTrack}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
