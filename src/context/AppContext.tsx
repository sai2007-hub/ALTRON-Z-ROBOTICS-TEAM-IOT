import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EventItem,
  WorkshopItem,
  ProjectItem,
  AchievementItem,
  GalleryItem,
  TeamMember,
  Registration,
  WorkshopEnquiry,
  HomepageStat,
  BotDocument,
  FooterAboutConfig,
  ContactPageConfig,
} from '../types';
import {
  initialEvents,
  initialWorkshops,
  initialProjects,
  initialAchievements,
  initialGallery,
  initialTeamMembers,
  initialRegistrations,
  initialHomepageStats,
  initialFooterAboutConfig,
  initialContactPageConfig,
} from '../data/initialData';
import {
  fetchFooterAboutConfig,
  saveFooterAboutConfig,
  fetchContactPageConfig,
  saveContactPageConfig,
} from '../services/siteContentService';
import {
  fetchHomepageStatsFromFirestore,
  saveHomepageStatToFirestore,
  deleteHomepageStatFromFirestore,
  syncAllHomepageStatsToFirestore,
} from '../services/homepageStatsService';
import {
  fetchBotDocumentsFromFirestore,
  saveBotDocumentToFirestore,
  updateBotDocumentInFirestore,
  deleteBotDocumentFromFirestore,
} from '../services/botDocumentService';
import {
  auth,
  googleProvider,
  checkIsAdmin,
  testConnection,
} from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  saveRegistrationToFirestore,
  fetchRegistrationsFromFirestore,
  updateRegistrationStatusInFirestore,
  archiveRegistrationInFirestore,
  deleteRegistrationFromFirestore,
  updateRegistrationAttendanceAndCertInFirestore,
  RegistrationInput,
} from '../services/registrationService';
import {
  fetchGalleryFromFirestore,
  createGalleryItemInFirestore,
  updateGalleryItemInFirestore,
  deleteGalleryItemFromFirestore,
  fetchTeamMembersFromFirestore,
  createTeamMemberInFirestore,
  updateTeamMemberInFirestore,
  deleteTeamMemberFromFirestore,
  fetchAchievementsFromFirestore,
  createAchievementInFirestore,
  updateAchievementInFirestore,
  deleteAchievementFromFirestore,
  fetchProjectsFromFirestore,
  createProjectInFirestore,
  updateProjectInFirestore,
  deleteProjectFromFirestore,
  fetchEventsFromFirestore,
  createEventInFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  fetchWorkshopsFromFirestore,
  createWorkshopInFirestore,
  updateWorkshopInFirestore,
  deleteWorkshopFromFirestore,
} from '../services/cmsService';

interface AppContextType {
  events: EventItem[];
  workshops: WorkshopItem[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  gallery: GalleryItem[];
  teamMembers: TeamMember[];
  registrations: Registration[];
  workshopEnquiries: WorkshopEnquiry[];
  isAdmin: boolean;
  currentUser: User | null;
  authLoading: boolean;
  cmsLoading: boolean;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  addRegistration: (reg: RegistrationInput) => Promise<{
    success: boolean;
    message: string;
    regId?: string;
    status?: string;
  }>;
  addWorkshopEnquiry: (enquiry: Omit<WorkshopEnquiry, 'id' | 'timestamp'>) => {
    success: boolean;
    message: string;
  };
  addEvent: (evt: Omit<EventItem, 'id' | 'registeredCount'>) => Promise<EventItem>;
  updateEvent: (id: string, evt: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addWorkshop: (ws: Omit<WorkshopItem, 'id' | 'registeredCount'>) => Promise<WorkshopItem>;
  updateWorkshop: (id: string, ws: Partial<WorkshopItem>) => Promise<void>;
  deleteWorkshop: (id: string) => Promise<void>;
  addProject: (proj: Omit<ProjectItem, 'id'>) => Promise<ProjectItem>;
  updateProject: (id: string, proj: Partial<ProjectItem>) => Promise<void>;
  deleteProject: (id: string, storagePath?: string) => Promise<void>;
  addAchievement: (ach: Omit<AchievementItem, 'id'>) => Promise<AchievementItem>;
  updateAchievement: (id: string, ach: Partial<AchievementItem>) => Promise<void>;
  deleteAchievement: (id: string, storagePath?: string) => Promise<void>;
  addTeamMember: (tm: Omit<TeamMember, 'id'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, tm: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string, storagePath?: string) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string, storagePath?: string) => Promise<void>;
  updateRegistrationStatus: (id: string, status: 'confirmed' | 'pending' | 'waitlist' | 'archived') => Promise<void>;
  archiveRegistration: (id: string, isArchived: boolean) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
  bulkArchiveRegistrations: (ids: string[], isArchived: boolean) => Promise<{ count: number }>;
  bulkDeleteRegistrations: (ids: string[]) => Promise<{ count: number }>;
  updateRegistrationAttendance: (id: string, attendance: 'present' | 'absent' | 'excused' | 'unmarked') => Promise<void>;
  updateRegistrationCertificate: (id: string, certificateId: string | null) => Promise<void>;
  exportRegistrationsCSV: (customList?: Registration[]) => void;
  reloadFirestoreRegistrations: () => Promise<void>;
  refreshAllCMSData: () => Promise<void>;
  seedInitialDataToFirestore: () => Promise<{ success: boolean; count: number }>;
  homepageStats: HomepageStat[];
  updateHomepageStats: (stats: HomepageStat[]) => Promise<void>;
  updateHomepageStat: (id: string, updates: Partial<HomepageStat>) => Promise<void>;
  addHomepageStat: (stat: Omit<HomepageStat, 'id'>) => Promise<HomepageStat>;
  deleteHomepageStat: (id: string) => Promise<void>;
  resetHomepageStatsToDefault: () => Promise<void>;
  botDocuments: BotDocument[];
  addBotDocument: (doc: Omit<BotDocument, 'id'>) => Promise<BotDocument>;
  updateBotDocument: (id: string, updates: Partial<BotDocument>) => Promise<void>;
  deleteBotDocument: (id: string) => Promise<void>;
  footerAboutConfig: FooterAboutConfig;
  updateFooterAboutConfig: (config: FooterAboutConfig) => Promise<{ success: boolean; error?: string }>;
  resetFooterAboutConfigToDefault: () => Promise<{ success: boolean; error?: string }>;
  contactPageConfig: ContactPageConfig;
  updateContactPageConfig: (config: ContactPageConfig) => Promise<{ success: boolean; error?: string }>;
  resetContactPageConfigToDefault: () => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('altrons_events');
    if (!saved) return initialEvents;
    try {
      const parsed: EventItem[] = JSON.parse(saved);
      return parsed.filter((e) => !['evt-1', 'evt-2', 'evt-3', 'evt-4'].includes(e.id));
    } catch {
      return initialEvents;
    }
  });

  const [workshops, setWorkshops] = useState<WorkshopItem[]>(() => {
    const saved = localStorage.getItem('altrons_workshops');
    return saved ? JSON.parse(saved) : initialWorkshops;
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem('altrons_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    const saved = localStorage.getItem('altrons_achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('altrons_gallery');
    return saved ? JSON.parse(saved) : initialGallery;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('altrons_team');
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('altrons_registrations');
    return saved ? JSON.parse(saved) : initialRegistrations;
  });

  const [workshopEnquiries, setWorkshopEnquiries] = useState<WorkshopEnquiry[]>(() => {
    const saved = localStorage.getItem('altrons_enquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [homepageStats, setHomepageStats] = useState<HomepageStat[]>(() => {
    const saved = localStorage.getItem('altrons_homepage_stats');
    return saved ? JSON.parse(saved) : initialHomepageStats;
  });

  const [botDocuments, setBotDocuments] = useState<BotDocument[]>(() => {
    const saved = localStorage.getItem('altrons_bot_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [footerAboutConfig, setFooterAboutConfig] = useState<FooterAboutConfig>(() => {
    const saved = localStorage.getItem('altrons_footer_about_config');
    if (!saved) return initialFooterAboutConfig;
    try {
      return { ...initialFooterAboutConfig, ...JSON.parse(saved) };
    } catch {
      return initialFooterAboutConfig;
    }
  });

  const [contactPageConfig, setContactPageConfig] = useState<ContactPageConfig>(() => {
    const saved = localStorage.getItem('altrons_contact_page_config');
    if (!saved) return initialContactPageConfig;
    try {
      return { ...initialContactPageConfig, ...JSON.parse(saved) };
    } catch {
      return initialContactPageConfig;
    }
  });

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [cmsLoading, setCmsLoading] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Test Firebase connection on mount
  useEffect(() => {
    testConnection().then((ok) => setIsFirebaseConnected(ok));
  }, []);

  // Refresh CMS Data from Firestore
  const refreshAllCMSData = async () => {
    setCmsLoading(true);
    try {
      const [galRes, tmRes, achRes, projRes, evtsRes, wsRes, statsRes, botDocsRes, footerAboutRes, contactRes] = await Promise.allSettled([
        fetchGalleryFromFirestore(false),
        fetchTeamMembersFromFirestore(false),
        fetchAchievementsFromFirestore(false),
        fetchProjectsFromFirestore(false),
        fetchEventsFromFirestore(false),
        fetchWorkshopsFromFirestore(false),
        fetchHomepageStatsFromFirestore(),
        fetchBotDocumentsFromFirestore(),
        fetchFooterAboutConfig(),
        fetchContactPageConfig(),
      ]);

      if (galRes.status === 'fulfilled' && galRes.value && galRes.value.length > 0) {
        setGallery(galRes.value);
      }
      if (tmRes.status === 'fulfilled' && tmRes.value && tmRes.value.length > 0) {
        setTeamMembers(tmRes.value);
      }
      if (achRes.status === 'fulfilled' && achRes.value && achRes.value.length > 0) {
        setAchievements(achRes.value);
      }
      if (projRes.status === 'fulfilled' && projRes.value && projRes.value.length > 0) {
        setProjects(projRes.value);
      }
      if (evtsRes.status === 'fulfilled' && Array.isArray(evtsRes.value)) {
        const cleanEvents = evtsRes.value.filter((e) => !['evt-1', 'evt-2', 'evt-3', 'evt-4'].includes(e.id));
        setEvents(cleanEvents);
        localStorage.setItem('altrons_events', JSON.stringify(cleanEvents));
      }
      if (wsRes.status === 'fulfilled' && wsRes.value && wsRes.value.length > 0) {
        setWorkshops(wsRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value && statsRes.value.length > 0) {
        setHomepageStats(statsRes.value);
        localStorage.setItem('altrons_homepage_stats', JSON.stringify(statsRes.value));
      }
      if (botDocsRes.status === 'fulfilled' && Array.isArray(botDocsRes.value)) {
        setBotDocuments(botDocsRes.value);
        localStorage.setItem('altrons_bot_documents', JSON.stringify(botDocsRes.value));
      }
      if (footerAboutRes.status === 'fulfilled' && footerAboutRes.value) {
        setFooterAboutConfig(footerAboutRes.value);
      }
      if (contactRes.status === 'fulfilled' && contactRes.value) {
        setContactPageConfig(contactRes.value);
      }
    } catch (err) {
      console.warn('Could not load some CMS data from Firestore:', err);
    } finally {
      setCmsLoading(false);
    }
  };

  // Initial CMS fetch on boot
  useEffect(() => {
    refreshAllCMSData();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminStatus = await checkIsAdmin(user);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          // If authorized admin, fetch live registrations and all CMS items
          try {
            const liveRegistrations = await fetchRegistrationsFromFirestore();
            if (liveRegistrations.length > 0) {
              setRegistrations(liveRegistrations);
            }
          } catch (err) {
            console.warn('Could not fetch Firestore registrations on login:', err);
          }
          await refreshAllCMSData();
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Local storage persistence for content modifications
  useEffect(() => {
    localStorage.setItem('altrons_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('altrons_workshops', JSON.stringify(workshops));
  }, [workshops]);

  useEffect(() => {
    localStorage.setItem('altrons_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('altrons_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('altrons_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('altrons_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('altrons_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('altrons_enquiries', JSON.stringify(workshopEnquiries));
  }, [workshopEnquiries]);

  useEffect(() => {
    localStorage.setItem('altrons_footer_about_config', JSON.stringify(footerAboutConfig));
  }, [footerAboutConfig]);

  useEffect(() => {
    localStorage.setItem('altrons_contact_page_config', JSON.stringify(contactPageConfig));
  }, [contactPageConfig]);

  // Auth Functions
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const isAdm = await checkIsAdmin(res.user);
      if (!isAdm) {
        await signOut(auth);
        return {
          success: false,
          error: `Access Denied: The account ${res.user.email} is not in the list of authorized administrators. Public student accounts cannot access operations console.`,
        };
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to authenticate via Google.',
      };
    }
  };

  const loginWithEmail = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isAdm = await checkIsAdmin(res.user);
      if (!isAdm) {
        await signOut(auth);
        return {
          success: false,
          error: `Access Denied: ${res.user.email} is not an authorized administrator account.`,
        };
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Invalid administrative credentials.',
      };
    }
  };

  const logoutAdmin = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const reloadFirestoreRegistrations = async () => {
    if (!isAdmin) return;
    try {
      const live = await fetchRegistrationsFromFirestore();
      setRegistrations(live);
    } catch (err) {
      console.error('Error reloading registrations from Firestore:', err);
    }
  };

  // Student Registration to Firestore
  const addRegistration = async (
    regData: RegistrationInput
  ): Promise<{ success: boolean; message: string; regId?: string; status?: string }> => {
    try {
      const res = await saveRegistrationToFirestore(regData);

      const now = new Date();
      const localTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newRegistration: Registration = {
        ...regData,
        id: res.regId,
        timestamp: localTimestamp,
        status: (res.status as 'confirmed' | 'pending' | 'waitlist') || 'confirmed',
      };

      setRegistrations((prev) => {
        if (prev.some((r) => r.id === res.regId)) {
          return prev;
        }
        return [newRegistration, ...prev];
      });

      // Increment counts only if newly registered
      setEvents((prev) =>
        prev.map((e) =>
          e.id === regData.targetId && regData.targetType === 'event'
            ? { ...e, registeredCount: e.registeredCount + 1 }
            : e
        )
      );

      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === regData.targetId && regData.targetType === 'workshop'
            ? { ...w, registeredCount: w.registeredCount + 1 }
            : w
        )
      );

      return {
        success: true,
        message: res.message,
        regId: res.regId,
        status: res.status || 'confirmed',
      };
    } catch (err: any) {
      console.error('Registration Firestore submission failed:', err);
      let errorMsg = 'Failed to record registration in Firestore.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          errorMsg = parsed.error || err.message;
        } catch {
          errorMsg = err.message;
        }
      }
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const updateRegistrationStatus = async (
    id: string,
    status: 'confirmed' | 'pending' | 'waitlist' | 'archived'
  ) => {
    try {
      await updateRegistrationStatusInFirestore(id, status);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
      throw err;
    }
  };

  const archiveRegistration = async (id: string, isArchived: boolean) => {
    try {
      await archiveRegistrationInFirestore(id, isArchived, currentUser?.email || undefined);
      const timestamp = isArchived ? new Date().toISOString() : undefined;
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: isArchived ? 'archived' : 'confirmed',
                archivedAt: timestamp,
                archivedBy: isArchived ? currentUser?.email || undefined : undefined,
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to archive registration in Firestore:', err);
      throw err;
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      await deleteRegistrationFromFirestore(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete registration in Firestore:', err);
      throw err;
    }
  };

  const bulkArchiveRegistrations = async (ids: string[], isArchived: boolean): Promise<{ count: number }> => {
    let successCount = 0;
    for (const id of ids) {
      try {
        await archiveRegistrationInFirestore(id, isArchived, currentUser?.email || undefined);
        successCount++;
      } catch (err) {
        console.warn(`Failed to archive reg ${id}:`, err);
      }
    }
    const timestamp = isArchived ? new Date().toISOString() : undefined;
    setRegistrations((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? {
              ...r,
              status: isArchived ? 'archived' : 'confirmed',
              archivedAt: timestamp,
              archivedBy: isArchived ? currentUser?.email || undefined : undefined,
            }
          : r
      )
    );
    return { count: successCount };
  };

  const bulkDeleteRegistrations = async (ids: string[]): Promise<{ count: number }> => {
    let successCount = 0;
    for (const id of ids) {
      try {
        await deleteRegistrationFromFirestore(id);
        successCount++;
      } catch (err) {
        console.warn(`Failed to delete reg ${id}:`, err);
      }
    }
    setRegistrations((prev) => prev.filter((r) => !ids.includes(r.id)));
    return { count: successCount };
  };

  const updateRegistrationAttendance = async (
    id: string,
    attendance: 'present' | 'absent' | 'excused' | 'unmarked'
  ) => {
    try {
      const isPresent = attendance === 'present';
      const isRecorded = attendance !== 'unmarked';
      await updateRegistrationAttendanceAndCertInFirestore(id, {
        attendance,
        attended: isPresent,
        attendanceRecorded: isRecorded,
      });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                attendance,
                attended: isPresent,
                attendanceRecorded: isRecorded,
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to update attendance in Firestore:', err);
      throw err;
    }
  };

  const updateRegistrationCertificate = async (id: string, certificateId: string | null) => {
    try {
      const isIssued = !!certificateId && certificateId.trim().length > 0;
      await updateRegistrationAttendanceAndCertInFirestore(id, {
        certificateIssued: isIssued,
        certificateId: isIssued ? certificateId!.trim() : '',
      });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                certificateIssued: isIssued,
                certificateId: isIssued ? certificateId!.trim() : undefined,
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to update certificate in Firestore:', err);
      throw err;
    }
  };

  const addWorkshopEnquiry = (
    enquiryData: Omit<WorkshopEnquiry, 'id' | 'timestamp'>
  ) => {
    const id = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newEnquiry: WorkshopEnquiry = {
      ...enquiryData,
      id,
      timestamp,
    };

    setWorkshopEnquiries((prev) => [newEnquiry, ...prev]);
    return {
      success: true,
      message: `Enquiry received! Our workshop coordinator will get in touch within 24 hours. Reference: ${id}`,
    };
  };

  const exportRegistrationsCSV = (customList?: Registration[]) => {
    const dataset = customList || registrations;
    if (dataset.length === 0) return;
    const headers = [
      'ID',
      'Student Name',
      'Email',
      'Phone',
      'School or College',
      'Department / Class',
      'Target Type',
      'Target Title',
      'Team Name',
      'Team Size',
      'Teammates',
      'Experience Level',
      'Status',
      'Attendance Recorded',
      'Attendance Status',
      'Certificate Issued',
      'Certificate ID',
      'Archived Date',
      'Registration Date',
    ];

    const rows = dataset.map((r) => [
      `"${r.id}"`,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.schoolOrCollege || '').replace(/"/g, '""')}"`,
      `"${(r.departmentOrClass || '').replace(/"/g, '""')}"`,
      `"${r.targetType}"`,
      `"${(r.targetTitle || '').replace(/"/g, '""')}"`,
      `"${(r.teamName || '').replace(/"/g, '""')}"`,
      `"${r.teamSize || 1}"`,
      `"${(r.teammateDetails || '').replace(/"/g, '""')}"`,
      `"${r.experienceLevel}"`,
      `"${r.status}"`,
      `"${r.attendanceRecorded ? 'Yes' : 'No'}"`,
      `"${r.attendance || (r.attended ? 'present' : 'unmarked')}"`,
      `"${r.certificateIssued ? 'Yes' : 'No'}"`,
      `"${(r.certificateId || '').replace(/"/g, '""')}"`,
      `"${(r.archivedAt || '').replace(/"/g, '""')}"`,
      `"${r.timestamp}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `altronz_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // CMS CRUD OPERATIONS SAVING TO FIRESTORE
  // ==========================================

  // 1. Gallery
  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    try {
      const saved = await createGalleryItemInFirestore(item);
      setGallery((prev) => [saved, ...prev.filter((g) => g.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.warn('Firestore gallery create failed, falling back to local state:', err);
      const localId = `gal-${Date.now()}`;
      const fallbackItem: GalleryItem = { ...item, id: localId, published: item.published !== false };
      setGallery((prev) => [fallbackItem, ...prev]);
      return fallbackItem;
    }
  };

  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>): Promise<void> => {
    try {
      await updateGalleryItemInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore gallery update failed:', err);
    }
    setGallery((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: 'Just now' } : g)));
  };

  const deleteGalleryItem = async (id: string, storagePath?: string): Promise<void> => {
    try {
      await deleteGalleryItemFromFirestore(id, storagePath);
    } catch (err) {
      console.warn('Firestore gallery delete failed:', err);
    }
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  // 2. Team Members
  const addTeamMember = async (tm: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    try {
      const saved = await createTeamMemberInFirestore(tm);
      setTeamMembers((prev) => [...prev.filter((m) => m.id !== saved.id), saved]);
      return saved;
    } catch (err) {
      console.warn('Firestore team member create failed, falling back to local state:', err);
      const localId = `tm-${Date.now()}`;
      const fallbackMember: TeamMember = { ...tm, id: localId, published: tm.published !== false };
      setTeamMembers((prev) => [...prev, fallbackMember]);
      return fallbackMember;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<void> => {
    try {
      await updateTeamMemberInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore team member update failed:', err);
    }
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: 'Just now' } : m)));
  };

  const deleteTeamMember = async (id: string, storagePath?: string): Promise<void> => {
    try {
      await deleteTeamMemberFromFirestore(id, storagePath);
    } catch (err) {
      console.warn('Firestore team member delete failed:', err);
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // 3. Achievements
  const addAchievement = async (ach: Omit<AchievementItem, 'id'>): Promise<AchievementItem> => {
    try {
      const saved = await createAchievementInFirestore(ach);
      setAchievements((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.warn('Firestore achievement create failed, falling back to local state:', err);
      const localId = `ach-${Date.now()}`;
      const fallbackAch: AchievementItem = { ...ach, id: localId, published: ach.published !== false };
      setAchievements((prev) => [fallbackAch, ...prev]);
      return fallbackAch;
    }
  };

  const updateAchievement = async (id: string, updates: Partial<AchievementItem>): Promise<void> => {
    try {
      await updateAchievementInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore achievement update failed:', err);
    }
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: 'Just now' } : a)));
  };

  const deleteAchievement = async (id: string, storagePath?: string): Promise<void> => {
    try {
      await deleteAchievementFromFirestore(id, storagePath);
    } catch (err) {
      console.warn('Firestore achievement delete failed:', err);
    }
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  // 4. Projects
  const addProject = async (proj: Omit<ProjectItem, 'id'>): Promise<ProjectItem> => {
    try {
      const saved = await createProjectInFirestore(proj);
      setProjects((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.warn('Firestore project create failed, falling back to local state:', err);
      const localId = `proj-${Date.now()}`;
      const fallbackProj: ProjectItem = { ...proj, id: localId, published: proj.published !== false };
      setProjects((prev) => [fallbackProj, ...prev]);
      return fallbackProj;
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectItem>): Promise<void> => {
    try {
      await updateProjectInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore project update failed:', err);
    }
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: 'Just now' } : p)));
  };

  const deleteProject = async (id: string, storagePath?: string): Promise<void> => {
    try {
      await deleteProjectFromFirestore(id, storagePath);
    } catch (err) {
      console.warn('Firestore project delete failed:', err);
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // 5. Events
  const addEvent = async (evt: Omit<EventItem, 'id' | 'registeredCount'>): Promise<EventItem> => {
    try {
      const saved = await createEventInFirestore(evt);
      setEvents((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.warn('Firestore event create failed, falling back to local state:', err);
      const localId = `evt-${Date.now()}`;
      const fallbackEvt: EventItem = { ...evt, id: localId, registeredCount: 0, published: evt.status === 'published' };
      setEvents((prev) => [fallbackEvt, ...prev]);
      return fallbackEvt;
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>): Promise<void> => {
    try {
      await updateEventInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore event update failed:', err);
    }
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: 'Just now' } : e)));
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      await deleteEventFromFirestore(id);
    } catch (err) {
      console.warn('Firestore event delete failed:', err);
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // 6. Workshops
  const addWorkshop = async (ws: Omit<WorkshopItem, 'id' | 'registeredCount'>): Promise<WorkshopItem> => {
    try {
      const saved = await createWorkshopInFirestore(ws);
      setWorkshops((prev) => [saved, ...prev.filter((w) => w.id !== saved.id)]);
      return saved;
    } catch (err) {
      console.warn('Firestore workshop create failed, falling back to local state:', err);
      const localId = `ws-${Date.now()}`;
      const fallbackWs: WorkshopItem = { ...ws, id: localId, registeredCount: 0, published: ws.status === 'published' };
      setWorkshops((prev) => [fallbackWs, ...prev]);
      return fallbackWs;
    }
  };

  const updateWorkshop = async (id: string, updates: Partial<WorkshopItem>): Promise<void> => {
    try {
      await updateWorkshopInFirestore(id, updates);
    } catch (err) {
      console.warn('Firestore workshop update failed:', err);
    }
    setWorkshops((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: 'Just now' } : w)));
  };

  const deleteWorkshop = async (id: string): Promise<void> => {
    try {
      await deleteWorkshopFromFirestore(id);
    } catch (err) {
      console.warn('Firestore workshop delete failed:', err);
    }
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
  };

  // Helper to seed initial sample records to Firestore with 1-click
  const seedInitialDataToFirestore = async (): Promise<{ success: boolean; count: number }> => {
    let count = 0;
    try {
      // Seed gallery
      for (const item of initialGallery) {
        await createGalleryItemInFirestore({
          title: item.title,
          eventOrWorkshop: item.eventOrWorkshop,
          year: item.year,
          category: item.category,
          caption: item.caption,
          description: item.caption,
          svgType: item.svgType,
          published: true,
        });
        count++;
      }

      // Seed team
      for (const m of initialTeamMembers) {
        await createTeamMemberInFirestore({
          name: m.name,
          role: m.role,
          subsystem: m.subsystem,
          bio: m.bio,
          yearAndDept: m.yearAndDept,
          skills: m.skills,
          email: m.email,
          linkedin: m.linkedin,
          github: m.github,
          isLead: m.isLead,
          displayOrder: 1,
          published: true,
        });
        count++;
      }

      // Seed achievements
      for (const a of initialAchievements) {
        await createAchievementInFirestore({
          title: a.title,
          eventName: a.eventName,
          year: a.year,
          rankOrAward: a.rankOrAward,
          position: a.rankOrAward,
          category: a.category,
          description: a.description,
          teamMembers: a.teamMembers,
          certificateId: a.certificateId,
          published: true,
        });
        count++;
      }

      // Seed projects
      for (const p of initialProjects) {
        await createProjectInFirestore({
          title: p.title,
          category: p.category,
          summary: p.summary,
          description: p.description,
          technologies: p.technologies,
          status: p.status,
          teamLead: p.teamLead,
          hardwareSpecs: p.hardwareSpecs,
          githubUrl: p.githubUrl,
          published: true,
        });
        count++;
      }

      // Seed events
      for (const e of initialEvents) {
        await createEventInFirestore({
          slug: e.slug,
          title: e.title,
          category: e.category,
          shortDescription: e.shortDescription,
          fullDescription: e.fullDescription,
          rules: e.rules,
          dimensionsAndSpecs: e.dimensionsAndSpecs,
          date: e.date,
          time: e.time,
          venue: e.venue,
          registrationDeadline: e.registrationDeadline,
          capacity: e.capacity,
          entryFee: e.entryFee,
          teamSize: e.teamSize,
          status: e.status,
          highlights: e.highlights,
          posterUrl: e.posterUrl,
        });
        count++;
      }

      // Seed workshops
      for (const w of initialWorkshops) {
        await createWorkshopInFirestore({
          slug: w.slug,
          title: w.title,
          track: w.track,
          targetAudience: w.targetAudience,
          duration: w.duration,
          schedule: w.schedule,
          venue: w.venue,
          capacity: w.capacity,
          description: w.description,
          modules: w.modules,
          hardwareProvided: w.hardwareProvided,
          prerequisites: w.prerequisites,
          status: w.status,
          featured: w.featured,
        });
        count++;
      }

      // Seed initial homepage stats
      for (const stat of initialHomepageStats) {
        await saveHomepageStatToFirestore(stat);
        count++;
      }

      await refreshAllCMSData();
      return { success: true, count };
    } catch (err) {
      console.error('Error seeding initial data to Firestore:', err);
      return { success: false, count };
    }
  };

  // ==========================================
  // HOMEPAGE STATISTICS MANAGERS
  // ==========================================
  const updateHomepageStats = async (newStats: HomepageStat[]): Promise<void> => {
    const sorted = newStats.map((s, idx) => ({ ...s, order: idx + 1 }));
    setHomepageStats(sorted);
    localStorage.setItem('altrons_homepage_stats', JSON.stringify(sorted));
    if (isAdmin) {
      try {
        await syncAllHomepageStatsToFirestore(sorted);
      } catch (err) {
        console.warn('Could not sync stats to Firestore:', err);
      }
    }
  };

  const updateHomepageStat = async (id: string, updates: Partial<HomepageStat>): Promise<void> => {
    let updatedStat: HomepageStat | undefined;
    const updated = homepageStats.map((s) => {
      if (s.id === id) {
        updatedStat = { ...s, ...updates };
        return updatedStat;
      }
      return s;
    });
    setHomepageStats(updated);
    localStorage.setItem('altrons_homepage_stats', JSON.stringify(updated));
    if (isAdmin && updatedStat) {
      await saveHomepageStatToFirestore(updatedStat);
    }
  };

  const addHomepageStat = async (stat: Omit<HomepageStat, 'id'>): Promise<HomepageStat> => {
    const id = `stat-${Date.now()}`;
    const newStat: HomepageStat = {
      ...stat,
      id,
      order: homepageStats.length + 1,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const updated = [...homepageStats, newStat];
    setHomepageStats(updated);
    localStorage.setItem('altrons_homepage_stats', JSON.stringify(updated));
    if (isAdmin) {
      await saveHomepageStatToFirestore(newStat);
    }
    return newStat;
  };

  const deleteHomepageStat = async (id: string): Promise<void> => {
    const updated = homepageStats.filter((s) => s.id !== id);
    setHomepageStats(updated);
    localStorage.setItem('altrons_homepage_stats', JSON.stringify(updated));
    if (isAdmin) {
      await deleteHomepageStatFromFirestore(id);
    }
  };

  const resetHomepageStatsToDefault = async (): Promise<void> => {
    setHomepageStats(initialHomepageStats);
    localStorage.setItem('altrons_homepage_stats', JSON.stringify(initialHomepageStats));
    if (isAdmin) {
      await syncAllHomepageStatsToFirestore(initialHomepageStats);
    }
  };

  const addBotDocument = async (docData: Omit<BotDocument, 'id'>): Promise<BotDocument> => {
    const saved = await saveBotDocumentToFirestore(docData);
    setBotDocuments((prev) => {
      const updated = [saved, ...prev];
      localStorage.setItem('altrons_bot_documents', JSON.stringify(updated));
      return updated;
    });
    return saved;
  };

  const updateBotDocument = async (id: string, updates: Partial<BotDocument>): Promise<void> => {
    await updateBotDocumentInFirestore(id, updates);
    setBotDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
      localStorage.setItem('altrons_bot_documents', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteBotDocument = async (id: string): Promise<void> => {
    await deleteBotDocumentFromFirestore(id);
    setBotDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      localStorage.setItem('altrons_bot_documents', JSON.stringify(updated));
      return updated;
    });
  };

  const updateFooterAboutConfig = async (
    config: FooterAboutConfig
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await saveFooterAboutConfig(config, currentUser?.email || 'admin');
    if (res.success) {
      setFooterAboutConfig(config);
    }
    return res;
  };

  const resetFooterAboutConfigToDefault = async (): Promise<{ success: boolean; error?: string }> => {
    const res = await saveFooterAboutConfig(initialFooterAboutConfig, currentUser?.email || 'admin');
    if (res.success) {
      setFooterAboutConfig(initialFooterAboutConfig);
    }
    return res;
  };

  const updateContactPageConfig = async (
    config: ContactPageConfig
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await saveContactPageConfig(config, currentUser?.email || 'admin');
    if (res.success) {
      setContactPageConfig(config);
    }
    return res;
  };

  const resetContactPageConfigToDefault = async (): Promise<{ success: boolean; error?: string }> => {
    const res = await saveContactPageConfig(initialContactPageConfig, currentUser?.email || 'admin');
    if (res.success) {
      setContactPageConfig(initialContactPageConfig);
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        events,
        workshops,
        projects,
        achievements,
        gallery,
        teamMembers,
        registrations,
        workshopEnquiries,
        isAdmin,
        currentUser,
        authLoading,
        cmsLoading,
        isFirebaseConnected,
        loginWithGoogle,
        loginWithEmail,
        logoutAdmin,
        addRegistration,
        addWorkshopEnquiry,
        addEvent,
        updateEvent,
        deleteEvent,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        addProject,
        updateProject,
        deleteProject,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        updateRegistrationStatus,
        archiveRegistration,
        deleteRegistration,
        bulkArchiveRegistrations,
        bulkDeleteRegistrations,
        updateRegistrationAttendance,
        updateRegistrationCertificate,
        exportRegistrationsCSV,
        reloadFirestoreRegistrations,
        refreshAllCMSData,
        seedInitialDataToFirestore,
        homepageStats,
        updateHomepageStats,
        updateHomepageStat,
        addHomepageStat,
        deleteHomepageStat,
        resetHomepageStatsToDefault,
        botDocuments,
        addBotDocument,
        updateBotDocument,
        deleteBotDocument,
        footerAboutConfig,
        updateFooterAboutConfig,
        resetFooterAboutConfigToDefault,
        contactPageConfig,
        updateContactPageConfig,
        resetContactPageConfigToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
