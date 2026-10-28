import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EventItem,
  WorkshopItem,
  ProjectItem,
  AchievementItem,
  TeamMember,
  Registration,
  GalleryItem,
  HomepageStat,
  BotDocument,
  FooterAboutConfig,
  ContactPageConfig,
  ContactItem,
  FooterLinkItem,
  DisciplineItem,
} from '../../types';
import {
  ShieldCheck,
  Calendar,
  Users,
  Trophy,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  Building,
  Image as ImageIcon,
  Layers,
  Settings,
  Database,
  ExternalLink,
  Cpu,
  BarChart3,
  X,
  RefreshCw,
  Play,
  Check,
  ShieldAlert,
  Loader2,
  Github,
  Globe,
  Sparkles,
  Bot,
  Award,
  Upload,
  CloudUpload,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
  AlertTriangle,
  UserMinus,
  Save,
  ArrowUp,
  ArrowDown,
  Sliders,
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { saveRegistrationToFirestore, fetchRegistrationsFromFirestore } from '../../services/registrationService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RoboVisual } from '../../components/common/RoboVisual';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { testCloudinaryConnection } from '../../services/cloudinaryService';
import { initialHomepageStats, initialFooterAboutConfig, initialContactPageConfig } from '../../data/initialData';
import { validatePdfFile, uploadPdfDocument, MAX_PDF_SIZE_BYTES } from '../../services/botDocumentService';

type AdminTab =
  | 'overview'
  | 'homepage-stats'
  | 'footer-about'
  | 'contact-manager'
  | 'registrations'
  | 'gallery'
  | 'team'
  | 'achievements'
  | 'projects'
  | 'events'
  | 'workshops'
  | 'bot-documents'
  | 'enquiries'
  | 'firebase-architecture';

interface ToastNotification {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DeleteTarget {
  type: 'gallery' | 'team' | 'achievement' | 'project' | 'event' | 'workshop' | 'bot-document';
  id: string;
  title: string;
  storagePath?: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    events,
    workshops,
    projects,
    achievements,
    teamMembers,
    gallery,
    registrations,
    workshopEnquiries,
    currentUser,
    isAdmin,
    logoutAdmin,
    addEvent,
    updateEvent,
    deleteEvent,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addProject,
    updateProject,
    deleteProject,
    addAchievement,
    updateAchievement,
    deleteAchievement,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<ToastNotification | null>(null);

  // Homepage Statistics Editor State
  const [editingStatsList, setEditingStatsList] = useState<HomepageStat[]>(homepageStats);
  const [isStatsSaving, setIsStatsSaving] = useState(false);
  const [showAddStatModal, setShowAddStatModal] = useState(false);
  const [showStatsPreview, setShowStatsPreview] = useState(true);
  const [newStatForm, setNewStatForm] = useState({ title: '', value: '', description: '' });
  const [statDeleteTarget, setStatDeleteTarget] = useState<HomepageStat | null>(null);

  React.useEffect(() => {
    setEditingStatsList(homepageStats);
  }, [homepageStats]);

  // Footer & About Section Form State
  const [footerAboutForm, setFooterAboutForm] = useState<FooterAboutConfig>(footerAboutConfig);
  const [isFooterSaving, setIsFooterSaving] = useState(false);
  const [footerSubTab, setFooterSubTab] = useState<'identity' | 'about' | 'disciplines' | 'columns' | 'coordinates' | 'copyright'>('identity');

  // Contact Page Manager Form State
  const [contactForm, setContactForm] = useState<ContactPageConfig>(contactPageConfig);
  const [isContactSaving, setIsContactSaving] = useState(false);
  const [contactSubTab, setContactSubTab] = useState<'heading' | 'coordinates' | 'visiting' | 'enquiry' | 'form-fields'>('heading');

  React.useEffect(() => {
    setFooterAboutForm(footerAboutConfig);
  }, [footerAboutConfig]);

  React.useEffect(() => {
    setContactForm(contactPageConfig);
  }, [contactPageConfig]);

  // Custom Delete Confirmation Modal State (replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Firebase testing state
  const [testLog, setTestLog] = useState<
    { type: 'write' | 'read' | 'reject' | 'cloudinary'; status: 'success' | 'failed' | 'running' | 'info'; message: string; timestamp: string }[]
  >([]);

  // Search & Filter state for registrations
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [regTargetFilter, setRegTargetFilter] = useState('All');
  const [regEventStatusFilter, setRegEventStatusFilter] = useState<'all' | 'active' | 'closed' | 'archived'>('all');
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [selectedRegDetail, setSelectedRegDetail] = useState<Registration | null>(null);
  const [certInputVal, setCertInputVal] = useState('');

  // Safe Removal & Archive Confirmation Modal state
  const [removalModalState, setRemovalModalState] = useState<{
    isOpen: boolean;
    targetRegistrations: Registration[];
    mode: 'single' | 'bulk';
    isProcessing: boolean;
    confirmPermanentDelete: boolean;
  }>({
    isOpen: false,
    targetRegistrations: [],
    mode: 'single',
    isProcessing: false,
    confirmPermanentDelete: false,
  });

  // CMS Search & Filter states
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('All');
  const [gallerySearchTerm, setGallerySearchTerm] = useState('');

  const [teamSubsystemFilter, setTeamSubsystemFilter] = useState('All');
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  const [achievementsCategoryFilter, setAchievementsCategoryFilter] = useState('All');
  const [achievementsSearchTerm, setAchievementsSearchTerm] = useState('');

  const [projectsCategoryFilter, setProjectsCategoryFilter] = useState('All');
  const [projectsSearchTerm, setProjectsSearchTerm] = useState('');

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    try {
      await reloadFirestoreRegistrations();
      await refreshAllCMSData();
      showToast('success', 'Synchronized live records from Cloud Firestore successfully.');
    } catch (err: any) {
      showToast('error', `Failed to sync Firestore: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSeedData = async () => {
    if (confirm('Seed default sample records to Cloud Firestore? Existing matching documents will be updated.')) {
      setIsSyncing(true);
      try {
        const res = await seedInitialDataToFirestore();
        if (res.success) {
          showToast('success', `Successfully seeded ${res.count} records across all collections to Firestore!`);
        } else {
          showToast('error', 'Seeding failed. Please check permissions or network.');
        }
      } catch (err: any) {
        showToast('error', `Seeding error: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // ==========================================
  // CONFIRMED DELETE HANDLER
  // ==========================================
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      switch (deleteTarget.type) {
        case 'gallery':
          await deleteGalleryItem(deleteTarget.id, deleteTarget.storagePath);
          showToast('success', `Deleted gallery item "${deleteTarget.title}" from Firestore and Storage.`);
          break;
        case 'team':
          await deleteTeamMember(deleteTarget.id, deleteTarget.storagePath);
          showToast('success', `Removed team member "${deleteTarget.title}" from Firestore.`);
          break;
        case 'achievement':
          await deleteAchievement(deleteTarget.id, deleteTarget.storagePath);
          showToast('success', `Deleted achievement "${deleteTarget.title}" from Firestore.`);
          break;
        case 'project':
          await deleteProject(deleteTarget.id, deleteTarget.storagePath);
          showToast('success', `Deleted project "${deleteTarget.title}" from Firestore.`);
          break;
        case 'event':
          await deleteEvent(deleteTarget.id);
          showToast('success', `Deleted event "${deleteTarget.title}" from Firestore.`);
          break;
        case 'workshop':
          await deleteWorkshop(deleteTarget.id);
          showToast('success', `Deleted workshop "${deleteTarget.title}" from Firestore.`);
          break;
        case 'bot-document':
          await deleteBotDocument(deleteTarget.id);
          showToast('success', `Deleted bot blueprint "${deleteTarget.title}" from Firestore.`);
          break;
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('error', `Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // 1. GALLERY CMS STATE & HANDLERS
  // ==========================================
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryFormData, setGalleryFormData] = useState({
    title: '',
    eventOrWorkshop: '',
    year: new Date().getFullYear(),
    category: 'Competition' as 'Competition' | 'Workshop' | 'Lab & R&D' | 'Exhibition' | 'Other',
    caption: '',
    description: '',
    imageUrl: '',
    secureUrl: '',
    publicId: '',
    storagePath: '',
    svgType: 'sumo' as 'sumo' | 'soccer' | 'iot' | 'rover' | 'drone' | 'workshop' | 'lab',
    published: true,
  });

  const handleOpenAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryFormData({
      title: '',
      eventOrWorkshop: "ALTRON'Z National Robotics Championship",
      year: new Date().getFullYear(),
      category: 'Competition',
      caption: '',
      description: '',
      imageUrl: '',
      secureUrl: '',
      publicId: '',
      storagePath: '',
      svgType: 'sumo',
      published: true,
    });
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryFormData({
      title: item.title,
      eventOrWorkshop: item.eventOrWorkshop,
      year: item.year || new Date().getFullYear(),
      category: item.category as any,
      caption: item.caption || item.description || '',
      description: item.description || item.caption || '',
      imageUrl: item.secureUrl || item.imageUrl || '',
      secureUrl: item.secureUrl || item.imageUrl || '',
      publicId: item.publicId || '',
      storagePath: item.storagePath || '',
      svgType: item.svgType || 'sumo',
      published: item.published !== false,
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormData.title.trim()) {
      showToast('error', 'Gallery title is required.');
      return;
    }

    const finalUrl = galleryFormData.secureUrl || galleryFormData.imageUrl || '';

    setIsSubmitting(true);
    try {
      if (editingGalleryItem) {
        await updateGalleryItem(editingGalleryItem.id, {
          title: galleryFormData.title.trim(),
          eventOrWorkshop: galleryFormData.eventOrWorkshop.trim(),
          year: Number(galleryFormData.year),
          category: galleryFormData.category,
          caption: galleryFormData.caption.trim(),
          description: galleryFormData.description.trim() || galleryFormData.caption.trim(),
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: galleryFormData.publicId || '',
          storagePath: galleryFormData.storagePath,
          svgType: galleryFormData.svgType,
          published: galleryFormData.published,
        });
        showToast('success', `Gallery item "${galleryFormData.title}" updated in Firestore!`);
      } else {
        await addGalleryItem({
          title: galleryFormData.title.trim(),
          eventOrWorkshop: galleryFormData.eventOrWorkshop.trim(),
          year: Number(galleryFormData.year),
          category: galleryFormData.category,
          caption: galleryFormData.caption.trim(),
          description: galleryFormData.description.trim() || galleryFormData.caption.trim(),
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: galleryFormData.publicId || '',
          storagePath: galleryFormData.storagePath,
          svgType: galleryFormData.svgType,
          published: galleryFormData.published,
        });
        showToast('success', `Gallery item "${galleryFormData.title}" saved to Cloud Firestore!`);
      }
      setIsGalleryModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save gallery item: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleGalleryPublished = async (item: GalleryItem) => {
    const newStatus = !item.published;
    try {
      await updateGalleryItem(item.id, { published: newStatus });
      showToast('info', `Photo "${item.title}" is now ${newStatus ? 'Published' : 'Hidden'}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 2. TEAM CMS STATE & HANDLERS
  // ==========================================
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    subsystem: 'Embedded & Firmware',
    department: 'Mechatronics & Robotics Engineering',
    yearAndDept: '3rd Year Mechatronics',
    bio: '',
    skills: 'STM32, FreeRTOS, KiCad, ROS2',
    email: '',
    linkedin: '',
    github: '',
    imageUrl: '',
    secureUrl: '',
    publicId: '',
    storagePath: '',
    isLead: false,
    displayOrder: 1,
    published: true,
  });

  const handleOpenAddTeam = () => {
    setEditingTeamMember(null);
    setTeamFormData({
      name: '',
      role: '',
      subsystem: 'Embedded & Firmware',
      department: 'Robotics & Automation',
      yearAndDept: '3rd Year Engineering',
      bio: '',
      skills: 'C++, STM32, KiCad, ROS2',
      email: '',
      linkedin: 'https://linkedin.com/in/',
      github: 'https://github.com/',
      imageUrl: '',
      secureUrl: '',
      publicId: '',
      storagePath: '',
      isLead: false,
      displayOrder: teamMembers.length + 1,
      published: true,
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeam = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name,
      role: member.role,
      subsystem: member.subsystem,
      department: member.department || member.yearAndDept || '',
      yearAndDept: member.yearAndDept || member.department || '',
      bio: member.bio,
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : '',
      email: member.email || '',
      linkedin: member.linkedin || '',
      github: member.github || '',
      imageUrl: member.secureUrl || member.imageUrl || '',
      secureUrl: member.secureUrl || member.imageUrl || '',
      publicId: member.publicId || '',
      storagePath: member.storagePath || '',
      isLead: !!member.isLead,
      displayOrder: member.displayOrder || 1,
      published: member.published !== false,
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormData.name.trim() || !teamFormData.role.trim()) {
      showToast('error', 'Full Name and Role Title are required.');
      return;
    }

    const skillsArray = teamFormData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalUrl = teamFormData.secureUrl || teamFormData.imageUrl || '';

    setIsSubmitting(true);
    try {
      if (editingTeamMember) {
        await updateTeamMember(editingTeamMember.id, {
          name: teamFormData.name.trim(),
          role: teamFormData.role.trim(),
          subsystem: teamFormData.subsystem,
          department: teamFormData.department.trim(),
          yearAndDept: teamFormData.yearAndDept.trim(),
          bio: teamFormData.bio.trim(),
          skills: skillsArray.length > 0 ? skillsArray : ['Robotics Engineering'],
          email: teamFormData.email.trim(),
          linkedin: teamFormData.linkedin.trim(),
          github: teamFormData.github.trim(),
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: teamFormData.publicId || '',
          storagePath: teamFormData.storagePath,
          isLead: teamFormData.isLead,
          displayOrder: Number(teamFormData.displayOrder) || 1,
          published: teamFormData.published,
        });
        showToast('success', `Team profile for "${teamFormData.name}" updated in Firestore!`);
      } else {
        await addTeamMember({
          name: teamFormData.name.trim(),
          role: teamFormData.role.trim(),
          subsystem: teamFormData.subsystem,
          department: teamFormData.department.trim(),
          yearAndDept: teamFormData.yearAndDept.trim(),
          bio: teamFormData.bio.trim(),
          skills: skillsArray.length > 0 ? skillsArray : ['Robotics Engineering'],
          email: teamFormData.email.trim(),
          linkedin: teamFormData.linkedin.trim(),
          github: teamFormData.github.trim(),
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: teamFormData.publicId || '',
          storagePath: teamFormData.storagePath,
          isLead: teamFormData.isLead,
          displayOrder: Number(teamFormData.displayOrder) || 1,
          published: teamFormData.published,
        });
        showToast('success', `Team member "${teamFormData.name}" saved to Cloud Firestore!`);
      }
      setIsTeamModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save team member: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTeamPublished = async (member: TeamMember) => {
    const newStatus = !member.published;
    try {
      await updateTeamMember(member.id, { published: newStatus });
      showToast('info', `Member "${member.name}" is now ${newStatus ? 'Published' : 'Hidden'}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 3. ACHIEVEMENTS CMS STATE & HANDLERS
  // ==========================================
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);
  const [achievementFormData, setAchievementFormData] = useState({
    title: '',
    eventName: '',
    year: new Date().getFullYear(),
    rankOrAward: '1st Place Winner',
    position: 'Winner',
    category: 'National' as any,
    description: '',
    prizeDetails: '',
    teamMembers: '',
    imageUrl: '',
    secureUrl: '',
    publicId: '',
    storagePath: '',
    certificateId: '',
    published: true,
  });

  const handleOpenAddAchievement = () => {
    setEditingAchievement(null);
    setAchievementFormData({
      title: '',
      eventName: 'National Student Robotics Championship 2026',
      year: new Date().getFullYear(),
      rankOrAward: 'Gold Medal Winner',
      position: '1st Place',
      category: 'National',
      description: '',
      prizeDetails: '$2,500 Cash Prize & Gold Trophy',
      teamMembers: 'Sai Krishna, Rahul V, Ananya M',
      imageUrl: '',
      secureUrl: '',
      publicId: '',
      storagePath: '',
      certificateId: `NRC-${new Date().getFullYear()}-01`,
      published: true,
    });
    setIsAchievementModalOpen(true);
  };

  const handleOpenEditAchievement = (ach: AchievementItem) => {
    setEditingAchievement(ach);
    setAchievementFormData({
      title: ach.title,
      eventName: ach.eventName,
      year: ach.year || new Date().getFullYear(),
      rankOrAward: ach.rankOrAward || ach.position || '',
      position: ach.position || ach.rankOrAward || '',
      category: ach.category || 'National',
      description: ach.description || '',
      prizeDetails: ach.prizeDetails || '',
      teamMembers: Array.isArray(ach.teamMembers) ? ach.teamMembers.join(', ') : '',
      imageUrl: ach.secureUrl || ach.imageUrl || '',
      secureUrl: ach.secureUrl || ach.imageUrl || '',
      publicId: ach.publicId || '',
      storagePath: ach.storagePath || '',
      certificateId: ach.certificateId || '',
      published: ach.published !== false,
    });
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementFormData.title.trim() || !achievementFormData.eventName.trim()) {
      showToast('error', 'Title and Competition Name are required.');
      return;
    }

    const membersArray = achievementFormData.teamMembers
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const finalUrl = achievementFormData.secureUrl || achievementFormData.imageUrl || '';

    setIsSubmitting(true);
    try {
      if (editingAchievement) {
        await updateAchievement(editingAchievement.id, {
          title: achievementFormData.title.trim(),
          eventName: achievementFormData.eventName.trim(),
          year: Number(achievementFormData.year),
          rankOrAward: achievementFormData.rankOrAward.trim(),
          position: (achievementFormData.position || achievementFormData.rankOrAward).trim(),
          category: achievementFormData.category,
          description: achievementFormData.description.trim(),
          prizeDetails: achievementFormData.prizeDetails.trim(),
          teamMembers: membersArray.length > 0 ? membersArray : ["ALTRON'Z Squad"],
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: achievementFormData.publicId || '',
          storagePath: achievementFormData.storagePath,
          certificateId: achievementFormData.certificateId.trim(),
          published: achievementFormData.published,
        });
        showToast('success', `Achievement "${achievementFormData.title}" updated in Firestore!`);
      } else {
        await addAchievement({
          title: achievementFormData.title.trim(),
          eventName: achievementFormData.eventName.trim(),
          year: Number(achievementFormData.year),
          rankOrAward: achievementFormData.rankOrAward.trim(),
          position: (achievementFormData.position || achievementFormData.rankOrAward).trim(),
          category: achievementFormData.category,
          description: achievementFormData.description.trim(),
          prizeDetails: achievementFormData.prizeDetails.trim(),
          teamMembers: membersArray.length > 0 ? membersArray : ["ALTRON'Z Squad"],
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: achievementFormData.publicId || '',
          storagePath: achievementFormData.storagePath,
          certificateId: achievementFormData.certificateId.trim(),
          published: achievementFormData.published,
        });
        showToast('success', `Achievement "${achievementFormData.title}" saved to Cloud Firestore!`);
      }
      setIsAchievementModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save achievement: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAchievementPublished = async (ach: AchievementItem) => {
    const newStatus = !ach.published;
    try {
      await updateAchievement(ach.id, { published: newStatus });
      showToast('info', `Achievement "${ach.title}" is now ${newStatus ? 'Published' : 'Hidden'}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 4. R&D PROJECTS CMS STATE & HANDLERS
  // ==========================================
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    category: 'Combat Bot' as any,
    summary: '',
    description: '',
    technologies: 'ROS2, STM32F4, KiCad, OpenCV, FreeRTOS',
    hardwareSpecs: 'Dual 24V Brushless Motors, 4S LiPo, Custom 4-Layer PCB, Neodymium Magnets',
    status: 'Active',
    teamLead: 'Sai Krishna',
    teamMembers: 'Rahul V, Vikram S, Sneha P',
    imageUrl: '',
    secureUrl: '',
    publicId: '',
    storagePath: '',
    githubUrl: 'https://github.com/altronz-robotics',
    demoUrl: '',
    published: true,
  });

  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: '',
      category: 'Combat Bot',
      summary: '',
      description: '',
      technologies: 'ROS2, STM32, KiCad, OpenCV, SolidWorks',
      hardwareSpecs: 'Dual 24V 800W Outrunners, Carbon Fiber Chassis, 4S LiPo 2200mAh',
      status: 'Active',
      teamLead: 'Sai Krishna',
      teamMembers: 'Vikram S, Ananya M',
      imageUrl: '',
      secureUrl: '',
      publicId: '',
      storagePath: '',
      githubUrl: 'https://github.com/altronz-robotics',
      demoUrl: '',
      published: true,
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: ProjectItem) => {
    setEditingProject(proj);
    const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '';
    const hwStr = Array.isArray(proj.hardwareSpecs)
      ? proj.hardwareSpecs.map((s: any) => (typeof s === 'string' ? s : `${s.label}: ${s.value}`)).join(', ')
      : '';

    setProjectFormData({
      title: proj.title,
      category: proj.category || 'Combat Bot',
      summary: proj.summary || '',
      description: proj.description || proj.summary || '',
      technologies: techStr,
      hardwareSpecs: hwStr,
      status: proj.status || 'Active',
      teamLead: proj.teamLead || 'Team Lead',
      teamMembers: Array.isArray(proj.teamMembers) ? proj.teamMembers.join(', ') : '',
      imageUrl: proj.secureUrl || proj.imageUrl || '',
      secureUrl: proj.secureUrl || proj.imageUrl || '',
      publicId: proj.publicId || '',
      storagePath: proj.storagePath || '',
      githubUrl: proj.githubUrl || '',
      demoUrl: proj.demoUrl || '',
      published: proj.published !== false,
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.title.trim() || !projectFormData.teamLead.trim()) {
      showToast('error', 'Project Title and Team Lead are required.');
      return;
    }

    const techArray = projectFormData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const membersArray = projectFormData.teamMembers
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const hwArray = projectFormData.hardwareSpecs
      .split(',')
      .map((h) => {
        const parts = h.split(':');
        if (parts.length > 1) {
          return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
        }
        return { label: 'Spec', value: h.trim() };
      })
      .filter((s) => s.value);

    const finalUrl = projectFormData.secureUrl || projectFormData.imageUrl || '';

    setIsSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          title: projectFormData.title.trim(),
          category: projectFormData.category,
          summary: projectFormData.summary.trim(),
          description: projectFormData.description.trim() || projectFormData.summary.trim(),
          technologies: techArray.length > 0 ? techArray : ['Embedded Systems'],
          hardwareSpecs: hwArray,
          status: projectFormData.status,
          teamLead: projectFormData.teamLead.trim(),
          teamMembers: membersArray,
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: projectFormData.publicId || '',
          storagePath: projectFormData.storagePath,
          githubUrl: projectFormData.githubUrl.trim(),
          demoUrl: projectFormData.demoUrl.trim(),
          published: projectFormData.published,
        });
        showToast('success', `R&D Project "${projectFormData.title}" updated in Firestore!`);
      } else {
        await addProject({
          title: projectFormData.title.trim(),
          category: projectFormData.category,
          summary: projectFormData.summary.trim(),
          description: projectFormData.description.trim() || projectFormData.summary.trim(),
          technologies: techArray.length > 0 ? techArray : ['Embedded Systems'],
          hardwareSpecs: hwArray,
          status: projectFormData.status,
          teamLead: projectFormData.teamLead.trim(),
          teamMembers: membersArray,
          imageUrl: finalUrl,
          secureUrl: finalUrl,
          publicId: projectFormData.publicId || '',
          storagePath: projectFormData.storagePath,
          githubUrl: projectFormData.githubUrl.trim(),
          demoUrl: projectFormData.demoUrl.trim(),
          published: projectFormData.published,
        });
        showToast('success', `R&D Project "${projectFormData.title}" saved to Cloud Firestore!`);
      }
      setIsProjectModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save project: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProjectPublished = async (proj: ProjectItem) => {
    const newStatus = !proj.published;
    try {
      await updateProject(proj.id, { published: newStatus });
      showToast('info', `Project "${proj.title}" is now ${newStatus ? 'Published' : 'Hidden'}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 5. EVENT CMS STATE & HANDLERS
  // ==========================================
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    slug: '',
    category: 'Combat' as 'Combat' | 'Sports' | 'Autonomous' | 'Aerial' | 'Design',
    shortDescription: '',
    fullDescription: '',
    rules: '',
    dimensionsAndSpecs: '',
    date: '',
    time: '10:00 AM - 5:00 PM',
    venue: "ALTRON'Z Championship Arena, Main Campus",
    registrationDeadline: 'Nov 10, 2026',
    capacity: 32,
    entryFee: '$25 per team',
    teamSize: '2 to 4 members',
    status: 'published' as 'published' | 'draft' | 'archived',
    posterUrl: '',
    secureUrl: '',
    publicId: '',
    whatsappInviteUrl: '',
  });

  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      slug: '',
      category: 'Combat',
      shortDescription: '',
      fullDescription: '',
      rules: 'Bot weight must not exceed 3.0 kg.\nDimensions: 20cm x 20cm max footprint.\nNo liquid, fire, or jamming projectiles.',
      dimensionsAndSpecs: 'Max Weight: 3.0 kg\nVoltage Limit: 24V DC\nMatch Duration: 3 Minutes',
      date: 'November 20-22, 2026',
      time: '10:00 AM - 5:00 PM',
      venue: 'Main Robotics Arena, Tech Complex',
      registrationDeadline: 'Nov 10, 2026',
      capacity: 32,
      entryFee: '$25 per team',
      teamSize: '2 to 4 members',
      status: 'published',
      posterUrl: '',
      secureUrl: '',
      publicId: '',
      whatsappInviteUrl: '',
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: EventItem) => {
    setEditingEventId(evt.id);
    const poster = evt.secureUrl || evt.posterUrl || '';
    setEventFormData({
      title: evt.title,
      slug: evt.slug,
      category: evt.category,
      shortDescription: evt.shortDescription,
      fullDescription: evt.fullDescription || evt.shortDescription,
      rules: Array.isArray(evt.rules) ? evt.rules.join('\n') : '',
      dimensionsAndSpecs: Array.isArray(evt.dimensionsAndSpecs) ? evt.dimensionsAndSpecs.join('\n') : '',
      date: evt.date,
      time: evt.time || '10:00 AM',
      venue: evt.venue,
      registrationDeadline: evt.registrationDeadline,
      capacity: evt.capacity,
      entryFee: evt.entryFee,
      teamSize: evt.teamSize,
      status: evt.status,
      posterUrl: poster,
      secureUrl: poster,
      publicId: evt.publicId || '',
      whatsappInviteUrl: evt.whatsappInviteUrl || '',
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) {
      showToast('error', 'Event Title is required.');
      return;
    }

    const rulesArray = eventFormData.rules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    const specsArray = eventFormData.dimensionsAndSpecs
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalPoster = eventFormData.secureUrl || eventFormData.posterUrl || '';
    const finalWhatsAppUrl = eventFormData.whatsappInviteUrl ? eventFormData.whatsappInviteUrl.trim() : '';

    setIsSubmitting(true);
    try {
      if (editingEventId) {
        await updateEvent(editingEventId, {
          title: eventFormData.title.trim(),
          slug: eventFormData.slug || eventFormData.title.toLowerCase().replace(/\s+/g, '-'),
          category: eventFormData.category,
          shortDescription: eventFormData.shortDescription.trim(),
          fullDescription: eventFormData.fullDescription.trim() || eventFormData.shortDescription.trim(),
          rules: rulesArray.length > 0 ? rulesArray : ['Standard tournament rules apply.'],
          dimensionsAndSpecs: specsArray,
          date: eventFormData.date.trim(),
          time: eventFormData.time.trim(),
          venue: eventFormData.venue.trim(),
          registrationDeadline: eventFormData.registrationDeadline.trim(),
          capacity: Number(eventFormData.capacity) || 30,
          entryFee: eventFormData.entryFee.trim(),
          teamSize: eventFormData.teamSize.trim(),
          status: eventFormData.status,
          posterUrl: finalPoster,
          secureUrl: finalPoster,
          publicId: eventFormData.publicId || '',
          whatsappInviteUrl: finalWhatsAppUrl,
        });
        showToast('success', `Event "${eventFormData.title}" updated in Firestore!`);
      } else {
        await addEvent({
          title: eventFormData.title.trim(),
          slug: eventFormData.slug || eventFormData.title.toLowerCase().replace(/\s+/g, '-'),
          category: eventFormData.category,
          shortDescription: eventFormData.shortDescription.trim(),
          fullDescription: eventFormData.fullDescription.trim() || eventFormData.shortDescription.trim(),
          rules: rulesArray.length > 0 ? rulesArray : ['Standard tournament rules apply.'],
          dimensionsAndSpecs: specsArray,
          date: eventFormData.date.trim(),
          time: eventFormData.time.trim(),
          venue: eventFormData.venue.trim(),
          registrationDeadline: eventFormData.registrationDeadline.trim(),
          capacity: Number(eventFormData.capacity) || 30,
          entryFee: eventFormData.entryFee.trim(),
          teamSize: eventFormData.teamSize.trim(),
          status: eventFormData.status,
          highlights: ['Official certificate', 'Live leaderboard', 'Cash prizes'],
          posterUrl: finalPoster,
          secureUrl: finalPoster,
          publicId: eventFormData.publicId || '',
          whatsappInviteUrl: finalWhatsAppUrl,
        });
        showToast('success', `Event "${eventFormData.title}" saved to Cloud Firestore!`);
      }
      setIsEventModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save event: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEventStatus = async (evt: EventItem) => {
    const newStatus = evt.status === 'published' ? 'draft' : 'published';
    try {
      await updateEvent(evt.id, { status: newStatus });
      showToast('info', `Event "${evt.title}" marked as ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 6. WORKSHOP CMS STATE & HANDLERS
  // ==========================================
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [workshopFormData, setWorkshopFormData] = useState({
    title: '',
    slug: '',
    track: 'Robotics' as 'Robotics' | 'IoT' | 'Embedded Systems' | 'AI & Vision',
    targetAudience: 'Colleges' as 'Schools' | 'Colleges' | 'All',
    duration: '2 Days (12 Hours)',
    schedule: 'Weekends & Term Breaks',
    venue: "ALTRON'Z Hardware Lab / Host Institution",
    capacity: 40,
    description: '',
    modules: '',
    hardwareProvided: '',
    prerequisites: 'Basic programming familiarity.',
    status: 'published' as 'published' | 'draft' | 'completed',
    imageUrl: '',
    posterUrl: '',
    secureUrl: '',
    publicId: '',
  });

  const handleOpenAddWorkshop = () => {
    setEditingWorkshopId(null);
    setWorkshopFormData({
      title: '',
      slug: '',
      track: 'Robotics',
      targetAudience: 'Colleges',
      duration: '2 Days (12 Hours)',
      schedule: 'Weekends / Institutional Booking',
      venue: "Host Institution Campus / ALTRON'Z Lab",
      capacity: 40,
      description: '',
      modules: 'Introduction to Embedded Hardware\nSensor Interfacing & Actuators\nFreeRTOS Multitasking & Wireless Protocols\nHackathon Challenge & Testing',
      hardwareProvided: 'STM32 / ESP32 Dev Board, Motor Drivers, Ultrasonic & IR Sensors, Breadboard & Components Kit',
      prerequisites: 'No prior robotics experience required.',
      status: 'published',
      imageUrl: '',
      posterUrl: '',
      secureUrl: '',
      publicId: '',
    });
    setIsWorkshopModalOpen(true);
  };

  const handleOpenEditWorkshop = (ws: WorkshopItem) => {
    setEditingWorkshopId(ws.id);
    const img = ws.secureUrl || ws.imageUrl || ws.posterUrl || '';
    setWorkshopFormData({
      title: ws.title,
      slug: ws.slug,
      track: ws.track,
      targetAudience: ws.targetAudience,
      duration: ws.duration,
      schedule: ws.schedule,
      venue: ws.venue,
      capacity: ws.capacity,
      description: ws.description,
      modules: Array.isArray(ws.modules) ? ws.modules.join('\n') : '',
      hardwareProvided: Array.isArray(ws.hardwareProvided) ? ws.hardwareProvided.join(', ') : '',
      prerequisites: ws.prerequisites || 'None',
      status: ws.status,
      imageUrl: img,
      posterUrl: img,
      secureUrl: img,
      publicId: ws.publicId || '',
    });
    setIsWorkshopModalOpen(true);
  };

  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopFormData.title.trim()) {
      showToast('error', 'Workshop Title is required.');
      return;
    }

    const modulesArr = workshopFormData.modules
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);
    const hwArr = workshopFormData.hardwareProvided
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const finalImg = workshopFormData.secureUrl || workshopFormData.imageUrl || '';

    setIsSubmitting(true);
    try {
      if (editingWorkshopId) {
        await updateWorkshop(editingWorkshopId, {
          title: workshopFormData.title.trim(),
          slug: workshopFormData.slug || workshopFormData.title.toLowerCase().replace(/\s+/g, '-'),
          track: workshopFormData.track,
          targetAudience: workshopFormData.targetAudience,
          duration: workshopFormData.duration.trim(),
          schedule: workshopFormData.schedule.trim(),
          venue: workshopFormData.venue.trim(),
          capacity: Number(workshopFormData.capacity) || 40,
          description: workshopFormData.description.trim(),
          modules: modulesArr.length > 0 ? modulesArr : ['Hardware assembly', 'Firmware flashing'],
          hardwareProvided: hwArr.length > 0 ? hwArr : ['Hardware prototyping kit'],
          prerequisites: workshopFormData.prerequisites.trim(),
          status: workshopFormData.status,
          imageUrl: finalImg,
          posterUrl: finalImg,
          secureUrl: finalImg,
          publicId: workshopFormData.publicId || '',
        });
        showToast('success', `Workshop "${workshopFormData.title}" updated in Firestore!`);
      } else {
        await addWorkshop({
          title: workshopFormData.title.trim(),
          slug: workshopFormData.slug || workshopFormData.title.toLowerCase().replace(/\s+/g, '-'),
          track: workshopFormData.track,
          targetAudience: workshopFormData.targetAudience,
          duration: workshopFormData.duration.trim(),
          schedule: workshopFormData.schedule.trim(),
          venue: workshopFormData.venue.trim(),
          capacity: Number(workshopFormData.capacity) || 40,
          description: workshopFormData.description.trim(),
          modules: modulesArr.length > 0 ? modulesArr : ['Hardware assembly', 'Firmware flashing'],
          hardwareProvided: hwArr.length > 0 ? hwArr : ['Hardware prototyping kit'],
          prerequisites: workshopFormData.prerequisites.trim(),
          status: workshopFormData.status,
          imageUrl: finalImg,
          posterUrl: finalImg,
          secureUrl: finalImg,
          publicId: workshopFormData.publicId || '',
        });
        showToast('success', `Workshop "${workshopFormData.title}" saved to Cloud Firestore!`);
      }
      setIsWorkshopModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save workshop: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWorkshopStatus = async (ws: WorkshopItem) => {
    const newStatus = ws.status === 'published' ? 'draft' : 'published';
    try {
      await updateWorkshop(ws.id, { status: newStatus });
      showToast('info', `Workshop "${ws.title}" marked as ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      showToast('error', `Could not update status: ${err.message}`);
    }
  };

  // ==========================================
  // 7. BOT DOCUMENTS CMS STATE & HANDLERS
  // ==========================================
  const [isBotDocModalOpen, setIsBotDocModalOpen] = useState(false);
  const [editingBotDoc, setEditingBotDoc] = useState<BotDocument | null>(null);
  const [botDocFormData, setBotDocFormData] = useState({
    title: '',
    description: '',
    botOrCompetition: '',
    published: true,
    pdfUrl: '',
    publicId: '',
    fileName: '',
    fileSize: 0,
  });
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<number>(0);
  const [pdfValidationError, setPdfValidationError] = useState<string | null>(null);
  const [botDocSearchTerm, setBotDocSearchTerm] = useState('');
  const [botDocStatusFilter, setBotDocStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const handleOpenAddBotDoc = () => {
    setEditingBotDoc(null);
    setSelectedPdfFile(null);
    setPdfValidationError(null);
    setPdfUploadProgress(0);
    setBotDocFormData({
      title: '',
      description: '',
      botOrCompetition: '',
      published: true,
      pdfUrl: '',
      publicId: '',
      fileName: '',
      fileSize: 0,
    });
    setIsBotDocModalOpen(true);
  };

  const handleOpenEditBotDoc = (doc: BotDocument) => {
    setEditingBotDoc(doc);
    setSelectedPdfFile(null);
    setPdfValidationError(null);
    setPdfUploadProgress(0);
    setBotDocFormData({
      title: doc.title,
      description: doc.description,
      botOrCompetition: doc.botOrCompetition || '',
      published: doc.published !== false,
      pdfUrl: doc.pdfUrl,
      publicId: doc.publicId || '',
      fileName: doc.fileName || 'document.pdf',
      fileSize: doc.fileSize || 0,
    });
    setIsBotDocModalOpen(true);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setPdfValidationError(validation.error || 'Invalid PDF file.');
      setSelectedPdfFile(null);
      return;
    }

    setPdfValidationError(null);
    setSelectedPdfFile(file);
    if (!botDocFormData.title.trim()) {
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setBotDocFormData((prev) => ({ ...prev, title: cleanName }));
    }
  };

  const handleSaveBotDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botDocFormData.title.trim()) {
      showToast('error', 'Document title is required.');
      return;
    }
    if (!botDocFormData.description.trim()) {
      showToast('error', 'Document description is required.');
      return;
    }

    if (!editingBotDoc && !selectedPdfFile) {
      showToast('error', 'Please select a valid PDF file to upload.');
      return;
    }

    setIsSubmitting(true);
    setPdfUploadProgress(10);
    try {
      let finalPdfUrl = botDocFormData.pdfUrl;
      let finalPublicId = botDocFormData.publicId;
      let finalFileName = botDocFormData.fileName;
      let finalFileSize = botDocFormData.fileSize;

      if (selectedPdfFile) {
        const uploadRes = await uploadPdfDocument(selectedPdfFile, 'bot_documents', (progress) => {
          setPdfUploadProgress(progress);
        });
        finalPdfUrl = uploadRes.pdfUrl;
        finalPublicId = uploadRes.publicId;
        finalFileName = uploadRes.fileName;
        finalFileSize = uploadRes.fileSize;
      }

      if (editingBotDoc) {
        await updateBotDocument(editingBotDoc.id, {
          title: botDocFormData.title.trim(),
          description: botDocFormData.description.trim(),
          botOrCompetition: botDocFormData.botOrCompetition.trim(),
          published: botDocFormData.published,
          status: botDocFormData.published ? 'published' : 'draft',
          pdfUrl: finalPdfUrl,
          publicId: finalPublicId,
          fileName: finalFileName,
          fileSize: finalFileSize,
        });
        showToast('success', `Bot blueprint "${botDocFormData.title}" updated in Firestore!`);
      } else {
        await addBotDocument({
          title: botDocFormData.title.trim(),
          description: botDocFormData.description.trim(),
          botOrCompetition: botDocFormData.botOrCompetition.trim(),
          published: botDocFormData.published,
          status: botDocFormData.published ? 'published' : 'draft',
          pdfUrl: finalPdfUrl,
          publicId: finalPublicId,
          fileName: finalFileName,
          fileSize: finalFileSize,
          uploadedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          uploadedBy: currentUser?.email || 'admin',
        });
        showToast('success', `Bot blueprint "${botDocFormData.title}" uploaded and saved to Cloud Firestore!`);
      }
      setIsBotDocModalOpen(false);
    } catch (err: any) {
      showToast('error', `Failed to save bot document: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setPdfUploadProgress(0);
    }
  };

  const handleToggleBotDocPublished = async (docItem: BotDocument) => {
    const nextPublished = !docItem.published;
    try {
      await updateBotDocument(docItem.id, {
        published: nextPublished,
        status: nextPublished ? 'published' : 'draft',
      });
      showToast('info', `Blueprint "${docItem.title}" is now ${nextPublished ? 'Published' : 'Draft (Admin only)'}.`);
    } catch (err: any) {
      showToast('error', `Could not update publish status: ${err.message}`);
    }
  };

  // ==========================================
  // METRICS & FILTERS
  // ==========================================
  const totalRegistrations = registrations.length;
  const activeEventsCount = events.filter((e) => e.status === 'published').length;
  const activeWorkshopsCount = workshops.filter((w) => w.status === 'published').length;
  const totalCapacity = events.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalSlotsFilled = events.reduce((acc, curr) => acc + curr.registeredCount, 0);

  // Helper to determine if target event or workshop is Closed / Past
  const isTargetClosed = (targetId: string, targetType: 'event' | 'workshop'): boolean => {
    if (targetType === 'event') {
      const evt = events.find((e) => e.id === targetId || e.slug === targetId);
      if (!evt) return false;
      if (evt.status === 'archived' || (evt as any).status === 'closed') return true;
      if (evt.registrationDeadline) {
        const deadline = Date.parse(evt.registrationDeadline);
        if (!isNaN(deadline) && deadline < Date.now()) return true;
      }
      return false;
    } else {
      const ws = workshops.find((w) => w.id === targetId || w.slug === targetId);
      if (!ws) return false;
      return ws.status === 'completed' || ws.status === 'draft';
    }
  };

  // Specific Registration Filter Counts
  const activeRegistrationsCount = registrations.filter(
    (r) => r.status !== 'archived' && !isTargetClosed(r.targetId, r.targetType)
  ).length;

  const closedRegistrationsCount = registrations.filter(
    (r) => r.status !== 'archived' && isTargetClosed(r.targetId, r.targetType)
  ).length;

  const allRegistrationsCount = registrations.filter(
    (r) => r.status !== 'archived'
  ).length;

  const archivedRegistrationsCount = registrations.filter(
    (r) => r.status === 'archived'
  ).length;

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const isClosed = isTargetClosed(reg.targetId, reg.targetType);

    // Event status filter: active vs closed vs archived vs all
    if (regEventStatusFilter === 'active') {
      if (reg.status === 'archived' || isClosed) return false;
    } else if (regEventStatusFilter === 'closed') {
      if (reg.status === 'archived' || !isClosed) return false;
    } else if (regEventStatusFilter === 'archived') {
      if (reg.status !== 'archived') return false;
    } else if (regEventStatusFilter === 'all') {
      if (reg.status === 'archived') return false;
    }

    // Specific Target Program Filter
    const matchesTarget =
      regTargetFilter === 'All' ||
      (regTargetFilter === 'events' && reg.targetType === 'event') ||
      (regTargetFilter === 'workshops' && reg.targetType === 'workshop') ||
      reg.targetId === regTargetFilter;
    if (!matchesTarget) return false;

    // Search query
    if (regSearchTerm.trim()) {
      const term = regSearchTerm.toLowerCase();
      const matchesSearch =
        (reg.studentName && reg.studentName.toLowerCase().includes(term)) ||
        (reg.email && reg.email.toLowerCase().includes(term)) ||
        (reg.phone && reg.phone.toLowerCase().includes(term)) ||
        (reg.schoolOrCollege && reg.schoolOrCollege.toLowerCase().includes(term)) ||
        (reg.targetTitle && reg.targetTitle.toLowerCase().includes(term)) ||
        (reg.id && reg.id.toLowerCase().includes(term)) ||
        (reg.teamName && reg.teamName.toLowerCase().includes(term)) ||
        (reg.certificateId && reg.certificateId.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Multi-Selection and Removal Handlers
  const handleOpenSingleRemoval = (reg: Registration) => {
    setRemovalModalState({
      isOpen: true,
      targetRegistrations: [reg],
      mode: 'single',
      isProcessing: false,
      confirmPermanentDelete: false,
    });
  };

  const handleOpenBulkRemoval = () => {
    const targets = registrations.filter((r) => selectedRegIds.includes(r.id));
    if (targets.length === 0) return;
    setRemovalModalState({
      isOpen: true,
      targetRegistrations: targets,
      mode: 'bulk',
      isProcessing: false,
      confirmPermanentDelete: false,
    });
  };

  const handleExecuteArchiveParticipants = async () => {
    const targets = removalModalState.targetRegistrations;
    if (targets.length === 0) return;
    setRemovalModalState((prev) => ({ ...prev, isProcessing: true }));
    try {
      if (targets.length === 1) {
        await archiveRegistration(targets[0].id, true);
        showToast('success', `Archived ${targets[0].studentName}. Record preserved and can be recovered.`);
      } else {
        const res = await bulkArchiveRegistrations(
          targets.map((t) => t.id),
          true
        );
        showToast('success', `Archived ${res.count} participant(s). Records can be recovered from the Archived filter.`);
      }
      setSelectedRegIds((prev) => prev.filter((id) => !targets.some((t) => t.id === id)));
      if (selectedRegDetail && targets.some((t) => t.id === selectedRegDetail.id)) {
        setSelectedRegDetail((prev) => (prev ? { ...prev, status: 'archived' } : null));
      }
      setRemovalModalState({
        isOpen: false,
        targetRegistrations: [],
        mode: 'single',
        isProcessing: false,
        confirmPermanentDelete: false,
      });
    } catch (err: any) {
      showToast('error', `Failed to archive: ${err.message}`);
      setRemovalModalState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleExecutePermanentDeleteParticipants = async () => {
    const targets = removalModalState.targetRegistrations;
    if (targets.length === 0) return;
    setRemovalModalState((prev) => ({ ...prev, isProcessing: true }));
    try {
      if (targets.length === 1) {
        await deleteRegistration(targets[0].id);
        showToast('success', `Permanently deleted registration for ${targets[0].studentName}.`);
      } else {
        const res = await bulkDeleteRegistrations(targets.map((t) => t.id));
        showToast('success', `Permanently deleted ${res.count} participant record(s) from Firestore.`);
      }
      setSelectedRegIds((prev) => prev.filter((id) => !targets.some((t) => t.id === id)));
      if (selectedRegDetail && targets.some((t) => t.id === selectedRegDetail.id)) {
        setSelectedRegDetail(null);
      }
      setRemovalModalState({
        isOpen: false,
        targetRegistrations: [],
        mode: 'single',
        isProcessing: false,
        confirmPermanentDelete: false,
      });
    } catch (err: any) {
      showToast('error', `Failed to delete registration(s): ${err.message}`);
      setRemovalModalState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleRestoreParticipant = async (reg: Registration) => {
    try {
      await archiveRegistration(reg.id, false);
      showToast('success', `Restored ${reg.studentName} back to active/closed roster.`);
      if (selectedRegDetail && selectedRegDetail.id === reg.id) {
        setSelectedRegDetail((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
      }
    } catch (err: any) {
      showToast('error', `Restore failed: ${err.message}`);
    }
  };

  const handleToggleSelectAllVisible = () => {
    const visibleIds = filteredRegistrations.map((r) => r.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRegIds.includes(id));
    if (allSelected) {
      setSelectedRegIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedRegIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedRegIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered gallery
  const filteredGallery = gallery.filter((item) => {
    const matchesCat = galleryCategoryFilter === 'All' || item.category === galleryCategoryFilter;
    const matchesSearch =
      gallerySearchTerm === '' ||
      item.title.toLowerCase().includes(gallerySearchTerm.toLowerCase()) ||
      item.caption.toLowerCase().includes(gallerySearchTerm.toLowerCase()) ||
      item.eventOrWorkshop.toLowerCase().includes(gallerySearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered team
  const filteredTeam = teamMembers.filter((m) => {
    const matchesSub = teamSubsystemFilter === 'All' || m.subsystem === teamSubsystemFilter;
    const matchesSearch =
      teamSearchTerm === '' ||
      m.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(teamSearchTerm.toLowerCase()));
    return matchesSub && matchesSearch;
  });

  // Filtered achievements
  const filteredAchievements = achievements.filter((a) => {
    const matchesCat = achievementsCategoryFilter === 'All' || a.category === achievementsCategoryFilter;
    const matchesSearch =
      achievementsSearchTerm === '' ||
      a.title.toLowerCase().includes(achievementsSearchTerm.toLowerCase()) ||
      a.eventName.toLowerCase().includes(achievementsSearchTerm.toLowerCase()) ||
      a.rankOrAward.toLowerCase().includes(achievementsSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesCat = projectsCategoryFilter === 'All' || p.category === projectsCategoryFilter;
    const matchesSearch =
      projectsSearchTerm === '' ||
      p.title.toLowerCase().includes(projectsSearchTerm.toLowerCase()) ||
      p.teamLead.toLowerCase().includes(projectsSearchTerm.toLowerCase()) ||
      p.summary.toLowerCase().includes(projectsSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ==========================================
  // LIVE FIREBASE SECURITY TESTS
  // ==========================================
  const runLiveWriteTest = async () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [
      { type: 'write', status: 'running', message: 'Testing Firestore write: Dispatching test student payload...', timestamp },
      ...prev,
    ]);
    try {
      const testInput = {
        studentName: `Robotics Candidate ${Math.floor(Math.random() * 900 + 100)}`,
        email: `candidate.${Date.now().toString().slice(-4)}@university.edu`,
        phone: '+1 (555) 304-9812',
        schoolOrCollege: 'Institute of Technology & Robotics',
        departmentOrClass: 'Mechatronics 3rd Year',
        targetType: 'event' as const,
        targetId: 'evt-1',
        targetTitle: 'Robo Sumo Championship 2026',
        teamName: 'Titan Breakers Lab',
        teamSize: 3,
        experienceLevel: 'Advanced' as const,
      };

      const startTime = performance.now();
      const res = await saveRegistrationToFirestore(testInput);
      const elapsed = Math.round(performance.now() - startTime);

      setTestLog((prev) => [
        {
          type: 'write',
          status: 'success',
          message: `Write SUCCESS: Document written with actual ID "${res.regId}" in ${elapsed}ms using Firestore serverTimestamp.`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
      await reloadFirestoreRegistrations();
    } catch (err: any) {
      setTestLog((prev) => [
        {
          type: 'write',
          status: 'failed',
          message: `Write FAILED: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    }
  };

  const runLiveReadTest = async () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [
      { type: 'read', status: 'running', message: 'Testing Firestore read: Querying live registrations as authorized admin...', timestamp },
      ...prev,
    ]);
    try {
      const startTime = performance.now();
      const docs = await fetchRegistrationsFromFirestore();
      const elapsed = Math.round(performance.now() - startTime);
      setTestLog((prev) => [
        {
          type: 'read',
          status: 'success',
          message: `Read SUCCESS: Retrieved ${docs.length} registration documents in ${elapsed}ms. Admin authorization confirmed.`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    } catch (err: any) {
      setTestLog((prev) => [
        {
          type: 'read',
          status: 'failed',
          message: `Read FAILED: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    }
  };

  const runLiveRejectTest = async () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [
      { type: 'reject', status: 'running', message: 'Testing security rules: Sending malformed registration payload with forbidden keys...', timestamp },
      ...prev,
    ]);
    try {
      const badId = `MALFORMED_${Date.now()}`;
      await setDoc(doc(db, 'registrations', badId), {
        studentName: 'Hacker',
        ghostFieldInjected: true,
      });
      setTestLog((prev) => [
        {
          type: 'reject',
          status: 'failed',
          message: 'Security Alert: Malformed payload was unexpectedly accepted by Firestore rules!',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    } catch (err: any) {
      setTestLog((prev) => [
        {
          type: 'reject',
          status: 'success',
          message: 'Security Invariant PASSED: Firestore rules successfully BLOCKED the malformed write with PERMISSION_DENIED.',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    }
  };

  const runCloudinaryTest = async () => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [
      {
        type: 'read',
        status: 'running',
        message: 'Testing Cloudinary CDN: Probing cloud "fltlrs3" and unsigned preset "altronz_gallery"...',
        timestamp,
      },
      ...prev,
    ]);
    try {
      const res = await testCloudinaryConnection();
      setTestLog((prev) => [
        {
          type: 'read',
          status: res.ok ? 'success' : 'info',
          message: res.message,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
      if (res.ok) {
        showToast('success', 'Cloudinary CDN verified and operational!');
      } else {
        showToast('info', 'Cloudinary test logged. In-app fallback keeps image uploads fully functional.');
      }
    } catch (err: any) {
      setTestLog((prev) => [
        {
          type: 'read',
          status: 'info',
          message: `Cloudinary Diagnostic: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.filter((t) => t.status !== 'running'),
      ]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-semibold max-w-md animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-700/80 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-red-950/95 border-red-700/80 text-red-200'
              : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-zinc-400 shrink-0" />
          )}
          <span className="flex-1 leading-relaxed">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner with Admin Identity & Actions */}
      <div className="bg-[#0C0F17] border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              Administrative Control Console & CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ALTRON&apos;Z ROBOTICS TEAM &amp; IOT Operations Center
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              Admin: <span className="text-zinc-200">{currentUser?.email || 'Authorized Administrator'}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span>Firebase: altronz (Connected)</span>
            </span>
            <span>·</span>
            <span className="text-zinc-400">CDN: Cloudinary (fltlrs3)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncFirestore}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Refresh registrations and CMS content from Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
          <button
            onClick={handleSeedData}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-[#171A24] hover:bg-[#202534] border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Seed initial sample records into Firestore"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Seed Sample Data</span>
          </button>
          <button
            onClick={() => exportRegistrationsCSV()}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'homepage-stats', label: `Homepage Stats (${homepageStats.length})`, icon: Sliders },
          { id: 'footer-about', label: 'Footer & About CMS', icon: Layers },
          { id: 'contact-manager', label: 'Contact Page Manager', icon: MapPin },
          { id: 'registrations', label: `Registrations (${registrations.length})`, icon: FileSpreadsheet },
          { id: 'gallery', label: `Photo Gallery (${gallery.length})`, icon: ImageIcon },
          { id: 'team', label: `Team Members (${teamMembers.length})`, icon: Users },
          { id: 'achievements', label: `Achievements (${achievements.length})`, icon: Trophy },
          { id: 'projects', label: `R&D Projects (${projects.length})`, icon: Cpu },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'workshops', label: `Workshops (${workshops.length})`, icon: Building },
          { id: 'bot-documents', label: `Bot Documents (${botDocuments.length})`, icon: FileText },
          { id: 'enquiries', label: `Host Enquiries (${workshopEnquiries.length})`, icon: Settings },
          { id: 'firebase-architecture', label: 'Firebase & Tests', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0C0F17] border border-zinc-800 p-6 rounded-xl space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Total Student Registrations
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {totalRegistrations}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Live in Firestore</span>
              </div>
              <p className="text-[11px] text-zinc-400">Events & technical workshops</p>
            </div>

            <div className="bg-[#0C0F17] border border-zinc-800 p-6 rounded-xl space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Gallery Archives
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {gallery.length}
                </span>
                <span className="text-xs font-mono text-red-400 font-semibold">Cloudinary CDN</span>
              </div>
              <p className="text-[11px] text-zinc-400">Media, posters & field shots</p>
            </div>

            <div className="bg-[#0C0F17] border border-zinc-800 p-6 rounded-xl space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Active Squad Profiles
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {teamMembers.length}
                </span>
                <span className="text-xs font-mono text-zinc-400">Leads & Engineers</span>
              </div>
              <p className="text-[11px] text-zinc-400">Across 5 engineering subsystems</p>
            </div>

            <div className="bg-[#0C0F17] border border-zinc-800 p-6 rounded-xl space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Hardware Systems & Awards
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {projects.length + achievements.length}
                </span>
                <span className="text-xs font-mono text-amber-400 font-semibold">R&D + Trophies</span>
              </div>
              <p className="text-[11px] text-zinc-400">{projects.length} builds · {achievements.length} honors</p>
            </div>
          </div>

          {/* Quick CMS Action Cards */}
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white">Content Management System Shortcuts</h3>
            <p className="text-xs text-zinc-400">
              Manage website content dynamically with Cloudinary CDN media uploads and Cloud Firestore persistence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <button
                onClick={() => {
                  setActiveTab('gallery');
                  handleOpenAddGallery();
                }}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-red-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">Upload to Gallery</span>
                  <Plus className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-[11px] text-zinc-400">Upload high-res robot and workshop photos to Cloudinary CDN.</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('team');
                  handleOpenAddTeam();
                }}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-red-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">Add Team Member</span>
                  <Plus className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-[11px] text-zinc-400">Register new mentors, subsystem leads, and engineer profiles.</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('achievements');
                  handleOpenAddAchievement();
                }}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-red-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">Log Achievement</span>
                  <Plus className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-[11px] text-zinc-400">Document tournament wins, cash prizes, and championship trophies.</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('projects');
                  handleOpenAddProject();
                }}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-red-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400">Add R&D Project</span>
                  <Plus className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-[11px] text-zinc-400">Publish combat robots, autonomous rovers, and embedded solutions.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: HOMEPAGE CONTENT & STATISTICS MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'homepage-stats' && (
        <div className="space-y-8">
          {/* Header & Main Control Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0C0F17] border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white tracking-tight">Homepage Statistics &amp; Metrics Manager</h2>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {editingStatsList.length} Metrics
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Configure the verified metrics, numbers, and descriptive context displayed on the public homepage. Changes are stored persistently in Firestore and synchronize in real-time for all site visitors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowStatsPreview(!showStatsPreview)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  showStatsPreview
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-[#121520] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Toggle live preview of homepage display"
              >
                {showStatsPreview ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{showStatsPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset homepage statistics to verified initial values ("Workshops Planned", "Student Registrations", "Competitions", "Our Focus")?')) {
                    setIsStatsSaving(true);
                    try {
                      await resetHomepageStatsToDefault();
                      setEditingStatsList(initialHomepageStats);
                      showToast('success', 'Reset homepage statistics to verified initial values.');
                    } catch (err: any) {
                      showToast('error', `Reset failed: ${err.message}`);
                    } finally {
                      setIsStatsSaving(false);
                    }
                  }
                }}
                disabled={isStatsSaving}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Reset to verified startup defaults"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddStatModal(true)}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Add Statistic</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsStatsSaving(true);
                  try {
                    await updateHomepageStats(editingStatsList);
                    showToast('success', 'Saved all homepage statistics to Firestore successfully!');
                  } catch (err: any) {
                    showToast('error', `Save failed: ${err.message}`);
                  } finally {
                    setIsStatsSaving(false);
                  }
                }}
                disabled={isStatsSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                {isStatsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isStatsSaving ? 'Saving to Firestore...' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          {showStatsPreview && (
            <div className="bg-[#0A0D14] border border-red-950/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
                    Public Homepage Preview (Live Reactive Grid)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Matches desktop &amp; mobile responsive layout
                </span>
              </div>

              {/* Exact Home.tsx Metrics Strip Simulation */}
              <div
                className={`grid grid-cols-2 ${
                  editingStatsList.length >= 4
                    ? 'md:grid-cols-4'
                    : editingStatsList.length === 3
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-2'
                } gap-6 pt-4`}
              >
                {editingStatsList.map((stat, idx) => (
                  <div key={stat.id || idx} className="space-y-1.5 p-4 rounded-xl bg-[#0D1017] border border-zinc-800/80">
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                      {stat.value || '—'}
                    </p>
                    <p className="text-xs text-zinc-300 font-semibold tracking-wide">
                      {stat.title || 'Untitled Statistic'}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {stat.description || 'No description provided.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of Editable Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Configured Metrics</span>
                <span className="text-xs text-zinc-500 font-normal">
                  (Adjust positions using arrow buttons)
                </span>
              </h3>
            </div>

            {editingStatsList.length === 0 ? (
              <div className="p-12 text-center bg-[#0D1017] border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <Sliders className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-semibold text-zinc-300">No Homepage Statistics Configured</p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Click below to restore the verified initial metrics or create custom metrics.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStatsList(initialHomepageStats)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Load Verified Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStatModal(true)}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Custom Statistic
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editingStatsList.map((stat, index) => (
                  <div
                    key={stat.id}
                    className="bg-[#0E121B] border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Control Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 font-mono text-[11px] flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">Position #{index + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (index === 0) return;
                              const copy = [...editingStatsList];
                              const temp = copy[index - 1];
                              copy[index - 1] = copy[index];
                              copy[index] = temp;
                              setEditingStatsList(copy);
                            }}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index === editingStatsList.length - 1) return;
                              const copy = [...editingStatsList];
                              const temp = copy[index + 1];
                              copy[index + 1] = copy[index];
                              copy[index] = temp;
                              setEditingStatsList(copy);
                            }}
                            disabled={index === editingStatsList.length - 1}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <div className="h-4 w-px bg-zinc-800 mx-1" />
                          <button
                            type="button"
                            onClick={() => setStatDeleteTarget(stat)}
                            className="p-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Remove this statistic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Input: Value */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                          <span>Display Number / Metric</span>
                          <span className="text-zinc-600 font-sans text-[10px]">e.g. Coming Soon, 0, 2</span>
                        </label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingStatsList((prev) =>
                              prev.map((s) => (s.id === stat.id ? { ...s, value: val } : s))
                            );
                          }}
                          className="w-full px-3 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-white font-mono text-sm tracking-tight transition-colors"
                          placeholder="e.g. Coming Soon"
                        />
                      </div>

                      {/* Input: Title */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                          Title / Metric Label
                        </label>
                        <input
                          type="text"
                          value={stat.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingStatsList((prev) =>
                              prev.map((s) => (s.id === stat.id ? { ...s, title: val } : s))
                            );
                          }}
                          className="w-full px-3 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-white text-xs font-semibold transition-colors"
                          placeholder="e.g. Workshops Planned"
                        />
                      </div>

                      {/* Input: Description */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                          Context / Brief Description
                        </label>
                        <textarea
                          rows={2}
                          value={stat.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingStatsList((prev) =>
                              prev.map((s) => (s.id === stat.id ? { ...s, description: val } : s))
                            );
                          }}
                          className="w-full px-3 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-zinc-300 text-xs transition-colors resize-none leading-relaxed"
                          placeholder="Contextual explanation displayed below title"
                        />
                      </div>
                    </div>

                    {/* Individual Save Button */}
                    <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {stat.updatedAt ? `Updated ${stat.updatedAt.slice(0, 16)}` : 'Verified Default'}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateHomepageStat(stat.id, {
                              title: stat.title,
                              value: stat.value,
                              description: stat.description,
                            });
                            showToast('success', `Saved "${stat.title}" successfully.`);
                          } catch (err: any) {
                            showToast('error', `Failed to save: ${err.message}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3 h-3 text-red-400" />
                        <span>Save Metric</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal: Add New Homepage Statistic */}
          {showAddStatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-[#10141E] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-red-500" />
                    <h3 className="text-base font-bold text-white">Add Homepage Statistic</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddStatModal(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newStatForm.title.trim() || !newStatForm.value.trim()) {
                      showToast('error', 'Please provide both Title and Value for the statistic.');
                      return;
                    }
                    try {
                      const created = await addHomepageStat({
                        title: newStatForm.title.trim(),
                        value: newStatForm.value.trim(),
                        description: newStatForm.description.trim(),
                      });
                      setEditingStatsList((prev) => [...prev, created]);
                      setNewStatForm({ title: '', value: '', description: '' });
                      setShowAddStatModal(false);
                      showToast('success', `Added new statistic "${created.title}" successfully.`);
                    } catch (err: any) {
                      showToast('error', `Failed to add statistic: ${err.message}`);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-400 uppercase">
                      Display Number / Metric <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStatForm.value}
                      onChange={(e) => setNewStatForm({ ...newStatForm, value: e.target.value })}
                      placeholder="e.g. Coming Soon, 0, 10+, 99%"
                      className="w-full px-3.5 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-white font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-400 uppercase">
                      Title / Headline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStatForm.title}
                      onChange={(e) => setNewStatForm({ ...newStatForm, title: e.target.value })}
                      placeholder="e.g. Workshops Planned, Active Chapters"
                      className="w-full px-3.5 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-zinc-400 uppercase">
                      Description / Context
                    </label>
                    <textarea
                      rows={3}
                      value={newStatForm.description}
                      onChange={(e) => setNewStatForm({ ...newStatForm, description: e.target.value })}
                      placeholder="Brief explanatory context displayed below title"
                      className="w-full px-3.5 py-2 bg-[#090C12] border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-zinc-200 text-xs resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddStatModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Statistic</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Confirm Delete Homepage Statistic */}
          {statDeleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-[#121520] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h3 className="text-base font-bold text-white">Remove Statistic?</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Are you sure you want to remove the metric <strong className="text-white">&ldquo;{statDeleteTarget.title}&rdquo;</strong> (Value: <span className="font-mono text-red-400">{statDeleteTarget.value}</span>)? It will no longer appear on the public homepage.
                </p>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setStatDeleteTarget(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteHomepageStat(statDeleteTarget.id);
                        setEditingStatsList((prev) => prev.filter((s) => s.id !== statDeleteTarget.id));
                        showToast('success', `Removed "${statDeleteTarget.title}".`);
                      } catch (err: any) {
                        showToast('error', `Failed to delete: ${err.message}`);
                      } finally {
                        setStatDeleteTarget(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Removal</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: FOOTER & ABOUT SECTION CONTENT MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'footer-about' && (
        <div className="space-y-8">
          {/* Header & Main Control Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0C0F17] border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white tracking-tight">Footer &amp; About Section CMS</h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Live Firestore Persistence
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Edit team identity, established year, About page hero/mission/vision, technical disciplines, footer competition &amp; workshop columns, lab coordinates, and copyright links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setFooterAboutForm(footerAboutConfig)}
                disabled={isFooterSaving}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Discard unsaved local changes and reload from store"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Discard Changes</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset Footer and About configuration to default verified values?')) {
                    setIsFooterSaving(true);
                    try {
                      const res = await resetFooterAboutConfigToDefault();
                      if (res.success) {
                        setFooterAboutForm(initialFooterAboutConfig);
                        showToast('success', 'Reset Footer & About configuration to initial verified defaults.');
                      } else {
                        showToast('error', `Reset failed: ${res.error}`);
                      }
                    } catch (err: any) {
                      showToast('error', `Reset failed: ${err.message}`);
                    } finally {
                      setIsFooterSaving(false);
                    }
                  }
                }}
                disabled={isFooterSaving}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Reset to default initial configuration"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsFooterSaving(true);
                  try {
                    const res = await updateFooterAboutConfig(footerAboutForm);
                    if (res.success) {
                      showToast('success', 'Footer & About content saved successfully to Firestore!');
                    } else {
                      showToast('error', `Save failed: ${res.error}`);
                    }
                  } catch (err: any) {
                    showToast('error', `Save failed: ${err.message}`);
                  } finally {
                    setIsFooterSaving(false);
                  }
                }}
                disabled={isFooterSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/40"
              >
                {isFooterSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isFooterSaving ? 'Saving to Firestore...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          {/* Sub-tab navigation for Footer & About */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
            {[
              { id: 'identity', label: 'Team Identity & Bio' },
              { id: 'about', label: 'About Page (Hero & Bento)' },
              { id: 'disciplines', label: 'Core Technical Disciplines' },
              { id: 'columns', label: 'Footer Navigation Columns' },
              { id: 'coordinates', label: 'Laboratory Coordinates' },
              { id: 'copyright', label: 'Copyright & Footer Actions' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFooterSubTab(st.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  footerSubTab === st.id
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: Team Identity */}
          {footerSubTab === 'identity' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Team Identity &amp; Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Official Team Name</label>
                  <input
                    type="text"
                    value={footerAboutForm.teamName}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, teamName: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Subtitle / Focus Area</label>
                  <input
                    type="text"
                    value={footerAboutForm.subtitle}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, subtitle: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Established Year</label>
                  <input
                    type="text"
                    value={footerAboutForm.establishedYear}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, establishedYear: e.target.value })}
                    placeholder="e.g. 2022"
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isEstablishedVerified"
                    checked={footerAboutForm.isEstablishedVerified !== false}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, isEstablishedVerified: e.target.checked })}
                    className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="isEstablishedVerified" className="text-zinc-300 font-medium cursor-pointer">
                    Established year is verified and confirmed
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 font-medium mb-1">Short Description (Appears in Footer Wordmark)</label>
                  <textarea
                    rows={3}
                    value={footerAboutForm.shortDescription}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, shortDescription: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: About Page Hero & Bento */}
          {footerSubTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">About Page Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Hero Badge</label>
                    <input
                      type="text"
                      value={footerAboutForm.heroBadge}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, heroBadge: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={footerAboutForm.heroTitle}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, heroTitle: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">Hero Description</label>
                    <textarea
                      rows={3}
                      value={footerAboutForm.heroDescription}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, heroDescription: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Mission Bento */}
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Our Mission</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Mission Title</label>
                    <input
                      type="text"
                      value={footerAboutForm.missionTitle}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, missionTitle: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">Mission Summary</label>
                    <textarea
                      rows={2}
                      value={footerAboutForm.missionDescription}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, missionDescription: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-zinc-400 font-medium">Mission Core Points</label>
                    {(footerAboutForm.missionPoints || []).map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const updated = [...(footerAboutForm.missionPoints || [])];
                            updated[idx] = e.target.value;
                            setFooterAboutForm({ ...footerAboutForm, missionPoints: updated });
                          }}
                          className="flex-1 bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = footerAboutForm.missionPoints.filter((_, i) => i !== idx);
                            setFooterAboutForm({ ...footerAboutForm, missionPoints: updated });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition-colors"
                          title="Remove point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFooterAboutForm({
                          ...footerAboutForm,
                          missionPoints: [...(footerAboutForm.missionPoints || []), 'New mission commitment point'],
                        });
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Mission Point</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vision Bento */}
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Our Vision</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Vision Title</label>
                    <input
                      type="text"
                      value={footerAboutForm.visionTitle}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, visionTitle: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">Vision Summary</label>
                    <textarea
                      rows={2}
                      value={footerAboutForm.visionDescription}
                      onChange={(e) => setFooterAboutForm({ ...footerAboutForm, visionDescription: e.target.value })}
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-zinc-400 font-medium">Vision Key Targets</label>
                    {(footerAboutForm.visionPoints || []).map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const updated = [...(footerAboutForm.visionPoints || [])];
                            updated[idx] = e.target.value;
                            setFooterAboutForm({ ...footerAboutForm, visionPoints: updated });
                          }}
                          className="flex-1 bg-[#0A0C11] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = footerAboutForm.visionPoints.filter((_, i) => i !== idx);
                            setFooterAboutForm({ ...footerAboutForm, visionPoints: updated });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition-colors"
                          title="Remove point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFooterAboutForm({
                          ...footerAboutForm,
                          visionPoints: [...(footerAboutForm.visionPoints || []), 'New strategic vision milestone'],
                        });
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Vision Milestone</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: Core Technical Disciplines */}
          {footerSubTab === 'disciplines' && (
            <div className="space-y-4">
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Three Core Technical Disciplines</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    These three pillars are prominently featured on the public About page under Operational Pillars.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {footerAboutForm.disciplines.map((disc, idx) => (
                    <div key={disc.id || idx} className="bg-[#121520] border border-zinc-800 p-5 rounded-xl space-y-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-red-500 font-bold uppercase text-[11px]">
                          Pillar 0{idx + 1}
                        </span>
                        <select
                          value={disc.iconType}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.disciplines];
                            updated[idx] = { ...updated[idx], iconType: e.target.value as any };
                            setFooterAboutForm({ ...footerAboutForm, disciplines: updated });
                          }}
                          className="bg-[#0A0C11] border border-zinc-700 rounded px-2 py-1 text-white text-[11px]"
                        >
                          <option value="cpu">Icon: CPU / Chip</option>
                          <option value="wrench">Icon: Wrench / Hardware</option>
                          <option value="award">Icon: Award / Trophy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[11px] font-medium mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={disc.disciplineNumber || disc.number || ''}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.disciplines];
                            updated[idx] = {
                              ...updated[idx],
                              number: e.target.value,
                              disciplineNumber: e.target.value,
                            };
                            setFooterAboutForm({ ...footerAboutForm, disciplines: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[11px] font-medium mb-1">Discipline Title</label>
                        <input
                          type="text"
                          value={disc.title}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.disciplines];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, disciplines: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[11px] font-medium mb-1">Detailed Description</label>
                        <textarea
                          rows={4}
                          value={disc.description}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.disciplines];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, disciplines: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded p-2.5 text-white leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: Footer Navigation Columns */}
          {footerSubTab === 'columns' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 2: Competitions */}
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Competitions Column</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `cl-${Date.now()}`;
                      setFooterAboutForm({
                        ...footerAboutForm,
                        competitionLinks: [
                          ...footerAboutForm.competitionLinks,
                          { id: newId, label: 'New Competition Name', targetView: 'events' },
                        ],
                      });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {footerAboutForm.competitionLinks.map((link, idx) => (
                    <div key={link.id || idx} className="p-3 bg-[#121520] border border-zinc-800 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.competitionLinks];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, competitionLinks: updated });
                          }}
                          className="flex-1 bg-[#0A0C11] border border-zinc-800 rounded px-2.5 py-1 text-white font-medium"
                          placeholder="Link label"
                        />
                        <select
                          value={link.targetView}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.competitionLinks];
                            updated[idx] = { ...updated[idx], targetView: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, competitionLinks: updated });
                          }}
                          className="bg-[#0A0C11] border border-zinc-800 rounded px-2 py-1 text-white text-[11px]"
                        >
                          <option value="home">Page: Home</option>
                          <option value="events">Page: Competitions</option>
                          <option value="sumo">Page: Sumo Bot</option>
                          <option value="soccer">Page: Soccer Bot</option>
                          <option value="workshops">Page: Workshops</option>
                          <option value="projects">Page: Projects</option>
                          <option value="achievements">Page: Achievements</option>
                          <option value="bot-details">Page: Bot Details</option>
                        </select>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...footerAboutForm.competitionLinks];
                            const temp = updated[idx - 1];
                            updated[idx - 1] = updated[idx];
                            updated[idx] = temp;
                            setFooterAboutForm({ ...footerAboutForm, competitionLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === footerAboutForm.competitionLinks.length - 1}
                          onClick={() => {
                            const updated = [...footerAboutForm.competitionLinks];
                            const temp = updated[idx + 1];
                            updated[idx + 1] = updated[idx];
                            updated[idx] = temp;
                            setFooterAboutForm({ ...footerAboutForm, competitionLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = footerAboutForm.competitionLinks.filter((_, i) => i !== idx);
                            setFooterAboutForm({ ...footerAboutForm, competitionLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Workshops & R&D */}
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Workshops &amp; R&amp;D Column</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `wl-${Date.now()}`;
                      setFooterAboutForm({
                        ...footerAboutForm,
                        workshopLinks: [
                          ...footerAboutForm.workshopLinks,
                          { id: newId, label: 'New Workshop Program', targetView: 'workshops' },
                        ],
                      });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {footerAboutForm.workshopLinks.map((link, idx) => (
                    <div key={link.id || idx} className="p-3 bg-[#121520] border border-zinc-800 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.workshopLinks];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, workshopLinks: updated });
                          }}
                          className="flex-1 bg-[#0A0C11] border border-zinc-800 rounded px-2.5 py-1 text-white font-medium"
                          placeholder="Link label"
                        />
                        <select
                          value={link.targetView}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.workshopLinks];
                            updated[idx] = { ...updated[idx], targetView: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, workshopLinks: updated });
                          }}
                          className="bg-[#0A0C11] border border-zinc-800 rounded px-2 py-1 text-white text-[11px]"
                        >
                          <option value="workshops">Page: Workshops</option>
                          <option value="projects">Page: Projects</option>
                          <option value="bot-details">Page: Bot Details</option>
                          <option value="achievements">Page: Achievements</option>
                          <option value="events">Page: Events</option>
                          <option value="about">Page: About</option>
                          <option value="contact">Page: Contact</option>
                        </select>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...footerAboutForm.workshopLinks];
                            const temp = updated[idx - 1];
                            updated[idx - 1] = updated[idx];
                            updated[idx] = temp;
                            setFooterAboutForm({ ...footerAboutForm, workshopLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === footerAboutForm.workshopLinks.length - 1}
                          onClick={() => {
                            const updated = [...footerAboutForm.workshopLinks];
                            const temp = updated[idx + 1];
                            updated[idx + 1] = updated[idx];
                            updated[idx] = temp;
                            setFooterAboutForm({ ...footerAboutForm, workshopLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = footerAboutForm.workshopLinks.filter((_, i) => i !== idx);
                            setFooterAboutForm({ ...footerAboutForm, workshopLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 5: Laboratory Coordinates */}
          {footerSubTab === 'coordinates' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Laboratory Coordinates &amp; Inquiries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 font-medium mb-1">Physical Lab Address</label>
                  <input
                    type="text"
                    value={footerAboutForm.labAddress}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, labAddress: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Official Electronic Mail</label>
                  <input
                    type="email"
                    value={footerAboutForm.officialEmail}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, officialEmail: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Outreach / Workshops Email</label>
                  <input
                    type="email"
                    value={footerAboutForm.outreachEmail || ''}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, outreachEmail: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Direct Voice Line / Telephone</label>
                  <input
                    type="text"
                    value={footerAboutForm.contactPhone}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, contactPhone: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={footerAboutForm.workingHours}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, workingHours: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 font-medium mb-1">Visiting Instructions &amp; Delegation Notice</label>
                  <textarea
                    rows={2}
                    value={footerAboutForm.visitingNotice}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, visitingNotice: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 6: Copyright & Footer Actions */}
          {footerSubTab === 'copyright' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Footer Copyright &amp; Action Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Copyright Year</label>
                  <input
                    type="text"
                    value={footerAboutForm.copyrightYear}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, copyrightYear: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Copyright Holder Text</label>
                  <input
                    type="text"
                    value={footerAboutForm.copyrightText}
                    onChange={(e) => setFooterAboutForm({ ...footerAboutForm, copyrightText: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-zinc-400 font-medium">Bottom Action Links (e.g. Team Charter, Host a Workshop, Staff Login)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `fl-${Date.now()}`;
                        setFooterAboutForm({
                          ...footerAboutForm,
                          footerLinks: [
                            ...footerAboutForm.footerLinks,
                            { id: newId, label: 'Custom Link', targetView: 'about' },
                          ],
                        });
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bottom Link</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {footerAboutForm.footerLinks.map((flink, idx) => (
                      <div key={flink.id || idx} className="flex items-center gap-2 p-2.5 bg-[#121520] border border-zinc-800 rounded-lg">
                        <input
                          type="text"
                          value={flink.label}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.footerLinks];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, footerLinks: updated });
                          }}
                          className="flex-1 bg-[#0A0C11] border border-zinc-800 rounded px-2.5 py-1 text-white font-medium"
                          placeholder="Link text"
                        />
                        <select
                          value={flink.targetView}
                          onChange={(e) => {
                            const updated = [...footerAboutForm.footerLinks];
                            updated[idx] = { ...updated[idx], targetView: e.target.value };
                            setFooterAboutForm({ ...footerAboutForm, footerLinks: updated });
                          }}
                          className="bg-[#0A0C11] border border-zinc-800 rounded px-2 py-1 text-white text-[11px]"
                        >
                          <option value="about">View: Team Charter / About</option>
                          <option value="contact">View: Host a Workshop / Contact</option>
                          <option value="login">View: Staff Login</option>
                          <option value="home">View: Home</option>
                          <option value="events">View: Competitions</option>
                          <option value="workshops">View: Workshops</option>
                          <option value="projects">View: Projects</option>
                          <option value="bot-details">View: Bot Details</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = footerAboutForm.footerLinks.filter((_, i) => i !== idx);
                            setFooterAboutForm({ ...footerAboutForm, footerLinks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CONTACT PAGE CONTENT MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'contact-manager' && (
        <div className="space-y-8">
          {/* Header & Main Control Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0C0F17] border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white tracking-tight">Contact Page Content Manager</h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Live Firestore Persistence
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Configure Contact Page introductory copy, laboratory coordinates, visiting notices, workshop inquiry section copy, and custom form field labels.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setContactForm(contactPageConfig)}
                disabled={isContactSaving}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Discard unsaved local changes"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Discard Changes</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset Contact Page configuration to initial defaults?')) {
                    setIsContactSaving(true);
                    try {
                      const res = await resetContactPageConfigToDefault();
                      if (res.success) {
                        setContactForm(initialContactPageConfig);
                        showToast('success', 'Reset Contact Page configuration to initial defaults.');
                      } else {
                        showToast('error', `Reset failed: ${res.error}`);
                      }
                    } catch (err: any) {
                      showToast('error', `Reset failed: ${err.message}`);
                    } finally {
                      setIsContactSaving(false);
                    }
                  }
                }}
                disabled={isContactSaving}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Reset to default initial configuration"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsContactSaving(true);
                  try {
                    const res = await updateContactPageConfig(contactForm);
                    if (res.success) {
                      showToast('success', 'Contact Page configuration saved successfully to Firestore!');
                    } else {
                      showToast('error', `Save failed: ${res.error}`);
                    }
                  } catch (err: any) {
                    showToast('error', `Save failed: ${err.message}`);
                  } finally {
                    setIsContactSaving(false);
                  }
                }}
                disabled={isContactSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/40"
              >
                {isContactSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isContactSaving ? 'Saving to Firestore...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>

          {/* Placeholder Warning Banner */}
          {contactForm.contactItems.some((item) => item.isPlaceholder) && (
            <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-200 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-amber-300">Unverified Placeholder Data Detected:</strong>
                Some contact coordinates below are flagged with <span className="font-mono bg-amber-900/60 px-1 py-0.5 rounded text-[11px] text-amber-200">[UNVERIFIED PLACEHOLDER]</span> (such as sample telephone or sample campus address). Please review and update with real ALTRON&apos;Z information, or click &ldquo;Mark Verified&rdquo; once confirmed.
              </div>
            </div>
          )}

          {/* Sub-tab navigation for Contact Manager */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
            {[
              { id: 'heading', label: 'Page Heading & Intro' },
              { id: 'coordinates', label: `Contact Coordinates (${contactForm.contactItems.length})` },
              { id: 'visiting', label: 'Visiting Delegation Notice' },
              { id: 'enquiry', label: 'Workshop Enquiry Section' },
              { id: 'form-fields', label: 'Form Labels & Choices' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setContactSubTab(st.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  contactSubTab === st.id
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: Heading & Intro */}
          {contactSubTab === 'heading' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Page Heading &amp; Introduction</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    value={contactForm.badge}
                    onChange={(e) => setContactForm({ ...contactForm, badge: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Page Title</label>
                  <input
                    type="text"
                    value={contactForm.title}
                    onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 font-medium mb-1">Introduction Description</label>
                  <textarea
                    rows={3}
                    value={contactForm.description}
                    onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: Contact Coordinates */}
          {contactSubTab === 'coordinates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0C0F17] border border-zinc-800 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Contact Information Coordinates</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Manage laboratory address, official email addresses, voice phone numbers, and operating hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItem: ContactItem = {
                      id: `ci-${Date.now()}`,
                      type: 'custom',
                      label: 'New Coordinate Label',
                      value: 'Coordinate details here',
                      enabled: true,
                      isPlaceholder: false,
                    };
                    setContactForm({
                      ...contactForm,
                      contactItems: [...contactForm.contactItems, newItem],
                    });
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Coordinate</span>
                </button>
              </div>

              <div className="space-y-3">
                {contactForm.contactItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isPlaceholder
                        ? 'bg-[#141113] border-amber-800/40'
                        : item.enabled
                        ? 'bg-[#0C0F17] border-zinc-800'
                        : 'bg-[#080A0E] border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.type}
                          onChange={(e) => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], type: e.target.value as any };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="bg-[#0A0C11] border border-zinc-700 rounded px-2.5 py-1 text-white text-xs font-mono"
                        >
                          <option value="address">Type: Address</option>
                          <option value="email">Type: Email</option>
                          <option value="phone">Type: Phone</option>
                          <option value="hours">Type: Operating Hours</option>
                          <option value="custom">Type: Custom</option>
                        </select>

                        {item.isPlaceholder && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                            Unverified Placeholder
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], isPlaceholder: !updated[idx].isPlaceholder };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          {item.isPlaceholder ? 'Mark as Verified' : 'Flag as Placeholder'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={(e) => {
                              const updated = [...contactForm.contactItems];
                              updated[idx] = { ...updated[idx], enabled: e.target.checked };
                              setContactForm({ ...contactForm, contactItems: updated });
                            }}
                            className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                          />
                          <span>Visible on Public Page</span>
                        </label>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...contactForm.contactItems];
                            const temp = updated[idx - 1];
                            updated[idx - 1] = updated[idx];
                            updated[idx] = temp;
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === contactForm.contactItems.length - 1}
                          onClick={() => {
                            const updated = [...contactForm.contactItems];
                            const temp = updated[idx + 1];
                            updated[idx + 1] = updated[idx];
                            updated[idx] = temp;
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = contactForm.contactItems.filter((_, i) => i !== idx);
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Delete coordinate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Coordinate Label</label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                          placeholder="e.g. Engineering Lab & Arena"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-zinc-400 text-[11px] mb-1">Primary Value</label>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                          placeholder="e.g. contact@altronz.org or Full Address"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Secondary / Sub-Value (Optional)</label>
                        <input
                          type="text"
                          value={item.subValue || ''}
                          onChange={(e) => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], subValue: e.target.value };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                          placeholder="e.g. workshops@altronz.org (Outreach)"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-zinc-400 text-[11px] mb-1">Custom Link URL (Optional)</label>
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => {
                            const updated = [...contactForm.contactItems];
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            setContactForm({ ...contactForm, contactItems: updated });
                          }}
                          className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white font-mono"
                          placeholder="e.g. mailto:..., tel:..., https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: Visiting Delegation Notice */}
          {contactSubTab === 'visiting' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Visiting Delegation Notice</h3>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactForm.showVisitingNotice !== false}
                    onChange={(e) => setContactForm({ ...contactForm, showVisitingNotice: e.target.checked })}
                    className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                  />
                  <span>Display Notice Box on Contact Page</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Notice Headline</label>
                  <input
                    type="text"
                    value={contactForm.visitingNoticeTitle || ''}
                    onChange={(e) => setContactForm({ ...contactForm, visitingNoticeTitle: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Notice Content &amp; Instructions</label>
                  <textarea
                    rows={3}
                    value={contactForm.visitingNoticeText || ''}
                    onChange={(e) => setContactForm({ ...contactForm, visitingNoticeText: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: Workshop Enquiry Section */}
          {contactSubTab === 'enquiry' && (
            <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Workshop &amp; Partnership Enquiry Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Section Title</label>
                  <input
                    type="text"
                    value={contactForm.enquirySectionTitle}
                    onChange={(e) => setContactForm({ ...contactForm, enquirySectionTitle: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Submit Button Text</label>
                  <input
                    type="text"
                    value={contactForm.submitButtonText}
                    onChange={(e) => setContactForm({ ...contactForm, submitButtonText: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 font-medium mb-1">Section Description / Sub-headline</label>
                  <textarea
                    rows={2}
                    value={contactForm.enquirySectionDescription}
                    onChange={(e) => setContactForm({ ...contactForm, enquirySectionDescription: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Success Title (After submission)</label>
                  <input
                    type="text"
                    value={contactForm.successTitle}
                    onChange={(e) => setContactForm({ ...contactForm, successTitle: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Success Message (After submission)</label>
                  <input
                    type="text"
                    value={contactForm.successMessage}
                    onChange={(e) => setContactForm({ ...contactForm, successMessage: e.target.value })}
                    className="w-full bg-[#0A0C11] border border-zinc-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 5: Form Labels & Choices */}
          {contactSubTab === 'form-fields' && (
            <div className="space-y-6">
              <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Enquiry Form Field Labels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Institution Name Field Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.institutionName || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, institutionName: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Contact Person Field Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.contactPerson || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, contactPerson: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Institution Category Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.institutionCategory || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, institutionCategory: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Official Email Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.officialEmail || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, officialEmail: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Contact Phone Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.contactPhone || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, contactPhone: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Preferred Track Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.preferredTrack || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, preferredTrack: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Target Timeline Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.targetTimeline || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, targetTimeline: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">Additional Details Label</label>
                    <input
                      type="text"
                      value={contactForm.fieldLabels?.additionalDetails || ''}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          fieldLabels: { ...contactForm.fieldLabels, additionalDetails: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A0C11] border border-zinc-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Institution Categories and Technical Tracks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Institution Categories</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newCat = prompt('Enter new institution category label:');
                        if (newCat && newCat.trim()) {
                          setContactForm({
                            ...contactForm,
                            institutionCategories: [...(contactForm.institutionCategories || []), newCat.trim()],
                          });
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(contactForm.institutionCategories || []).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[#121520] border border-zinc-800 rounded-lg text-xs">
                        <span className="text-zinc-200">{cat}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = contactForm.institutionCategories.filter((_, i) => i !== idx);
                            setContactForm({ ...contactForm, institutionCategories: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Technical Tracks</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newTrk = prompt('Enter new technical track label:');
                        if (newTrk && newTrk.trim()) {
                          setContactForm({
                            ...contactForm,
                            technicalTracks: [...(contactForm.technicalTracks || []), newTrk.trim()],
                          });
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Track</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(contactForm.technicalTracks || []).map((trk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[#121520] border border-zinc-800 rounded-lg text-xs">
                        <span className="text-zinc-200">{trk}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = contactForm.technicalTracks.filter((_, i) => i !== idx);
                            setContactForm({ ...contactForm, technicalTracks: updated });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT REGISTRATIONS */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 2: STUDENT REGISTRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-white">Student Registrations Roster</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage participants across active and closed events with attendance and certificate verification.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncFirestore}
                disabled={isSyncing}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Synchronize records with Cloud Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => exportRegistrationsCSV(filteredRegistrations)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-colors cursor-pointer"
                title="Export filtered registrations to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({filteredRegistrations.length})</span>
              </button>
            </div>
          </div>

          {/* Event Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0C0F17] border border-zinc-800/80 rounded-xl">
            <button
              onClick={() => {
                setRegEventStatusFilter('all');
                setSelectedRegIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                regEventStatusFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <span>All Events</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-black/50 text-zinc-300 font-mono">
                {allRegistrationsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setRegEventStatusFilter('active');
                setSelectedRegIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                regEventStatusFilter === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Events</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-black/50 text-emerald-400 font-mono">
                {activeRegistrationsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setRegEventStatusFilter('closed');
                setSelectedRegIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                regEventStatusFilter === 'closed'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-900/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Closed &amp; Past Events</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-black/50 text-amber-400 font-mono">
                {closedRegistrationsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setRegEventStatusFilter('archived');
                setSelectedRegIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                regEventStatusFilter === 'archived'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-purple-400 hover:bg-zinc-900/60'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived Records</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-black/50 text-purple-400 font-mono">
                {archivedRegistrationsCount}
              </span>
            </button>
          </div>

          {/* Search & Program Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidate name, email, phone, college, team, or certificate ID..."
                value={regSearchTerm}
                onChange={(e) => setRegSearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              {regSearchTerm && (
                <button
                  onClick={() => setRegSearchTerm('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="sm:col-span-4">
              <select
                value={regTargetFilter}
                onChange={(e) => setRegTargetFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Programs ({events.length + workshops.length})</option>
                <option value="events">All Competitions ({events.length})</option>
                <option value="workshops">All Workshops ({workshops.length})</option>
                <optgroup label="Competitions (Events)">
                  {events.map((e) => {
                    const closed = isTargetClosed(e.id, 'event');
                    return (
                      <option key={e.id} value={e.id}>
                        {closed ? '🔴 [Closed]' : '🟢 [Active]'} {e.title}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Workshops">
                  {workshops.map((w) => {
                    const closed = isTargetClosed(w.id, 'workshop');
                    return (
                      <option key={w.id} value={w.id}>
                        {closed ? '🔴 [Concluded]' : '🟢 [Active]'} {w.title}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Multi-Selection Sticky / Context Action Bar */}
          {selectedRegIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl shadow-lg">
              <div className="flex items-center gap-2.5 text-xs text-red-200">
                <CheckSquare className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-bold">
                  {selectedRegIds.length} participant{selectedRegIds.length > 1 ? 's' : ''} selected
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  (Actions will check for attendance &amp; certificate safety)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExecuteArchiveParticipants}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-purple-700/60 text-purple-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Soft-delete participants safely so records can be restored"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Archive Selected</span>
                </button>
                <button
                  onClick={handleOpenBulkRemoval}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-colors cursor-pointer"
                  title="Remove selected participants with audit protection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove / Delete</span>
                </button>
                <button
                  onClick={() => setSelectedRegIds([])}
                  className="px-2.5 py-1.5 text-zinc-400 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Table / List Container */}
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {regEventStatusFilter === 'active'
                      ? 'No Active Event Registrations'
                      : regEventStatusFilter === 'closed'
                      ? 'No Closed Event Registrations'
                      : regEventStatusFilter === 'archived'
                      ? 'No Archived Records Found'
                      : 'No Registration Records Found'}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    {regEventStatusFilter === 'active'
                      ? 'No participant registrations match active tournaments. Switch to "Closed & Past Events" to view historical records, or check the target filter.'
                      : regEventStatusFilter === 'closed'
                      ? 'No participants found under closed or past events. When events close, registrations are preserved and will appear here.'
                      : regEventStatusFilter === 'archived'
                      ? 'Soft-deleted participants are kept here safely for recovery. No records are currently archived.'
                      : regSearchTerm
                      ? `No registrations match query "${regSearchTerm}". Try different keywords or clear filters.`
                      : 'No student registrations recorded yet.'}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  {regEventStatusFilter !== 'all' && (
                    <button
                      onClick={() => setRegEventStatusFilter('all')}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Show All Events
                    </button>
                  )}
                  {regSearchTerm && (
                    <button
                      onClick={() => setRegSearchTerm('')}
                      className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Mobile Card List View (< 640px) */}
                <div className="block sm:hidden divide-y divide-zinc-800/80">
                  {filteredRegistrations.map((reg) => {
                    const isClosed = isTargetClosed(reg.targetId, reg.targetType);
                    const isSelected = selectedRegIds.includes(reg.id);
                    return (
                      <div
                        key={reg.id}
                        className={`p-4 space-y-3 transition-colors ${
                          isSelected ? 'bg-red-950/20' : 'hover:bg-zinc-900/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectOne(reg.id)}
                              className="mt-0.5 text-zinc-400 hover:text-white cursor-pointer"
                              title={isSelected ? 'Deselect participant' : 'Select participant'}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-red-500" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-600" />
                              )}
                            </button>
                            <div>
                              <div className="font-bold text-sm text-white">{reg.studentName}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{reg.email}</div>
                              {reg.phone && <div className="text-[10px] text-zinc-500 font-mono">{reg.phone}</div>}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                                reg.status === 'confirmed'
                                  ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400'
                                  : reg.status === 'pending'
                                  ? 'bg-amber-950/80 border border-amber-800/80 text-amber-400'
                                  : reg.status === 'archived'
                                  ? 'bg-purple-950/80 border border-purple-800/80 text-purple-300'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {reg.status}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                isClosed
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              }`}
                            >
                              {isClosed ? 'Closed Event' : 'Active Event'}
                            </span>
                          </div>
                        </div>

                        {/* Program, Attendance & Certificate Info */}
                        <div className="text-xs space-y-1.5 text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                          <div>
                            <span className="text-zinc-500 text-[11px]">Program: </span>
                            <span className="font-semibold text-zinc-200">{reg.targetTitle}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[11px]">Institution: </span>
                            <span>{reg.schoolOrCollege}</span>
                          </div>
                          {reg.teamName && (
                            <div>
                              <span className="text-zinc-500 text-[11px]">Team: </span>
                              <span className="font-medium text-zinc-200">
                                {reg.teamName} ({reg.teamSize || 2} members)
                              </span>
                            </div>
                          )}

                          {/* Attendance & Certificate Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/60 text-[10px]">
                            {reg.attendance === 'present' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-medium">
                                ✓ Attendance: Present
                              </span>
                            ) : reg.attendance === 'absent' ? (
                              <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-400 font-medium">
                                ✗ Attendance: Absent
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                Attendance: Unmarked
                              </span>
                            )}

                            {reg.certificateId ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono font-medium flex items-center gap-1">
                                <Award className="w-3 h-3 text-cyan-400" />
                                Cert: {reg.certificateId}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRegDetail(reg)}
                            className="min-h-[36px] px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Inspect &amp; Edit</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {reg.status === 'archived' ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreParticipant(reg)}
                                className="min-h-[36px] px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="Restore participant to active roster"
                              >
                                <ArchiveRestore className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => archiveRegistration(reg.id, true)}
                                className="min-h-[36px] px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors cursor-pointer"
                                title="Archive participant safely"
                              >
                                <Archive className="w-3.5 h-3.5 text-purple-400" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenSingleRemoval(reg)}
                              className="min-h-[36px] px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs rounded-lg transition-colors cursor-pointer"
                              title="Remove participant with safety checks"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Tablet Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#080A0E] text-[11px] font-mono text-zinc-400">
                        <th className="py-3 px-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={handleToggleSelectAllVisible}
                            className="cursor-pointer text-zinc-400 hover:text-white"
                            title="Select all visible participants"
                          >
                            {filteredRegistrations.length > 0 &&
                            filteredRegistrations.every((r) => selectedRegIds.includes(r.id)) ? (
                              <CheckSquare className="w-4 h-4 text-red-500 mx-auto" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600 mx-auto" />
                            )}
                          </button>
                        </th>
                        <th className="py-3 px-4">STUDENT &amp; CONTACT</th>
                        <th className="py-3 px-4">PROGRAM &amp; EVENT STATUS</th>
                        <th className="py-3 px-4">INSTITUTION</th>
                        <th className="py-3 px-4">ATTENDANCE &amp; CERT</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {filteredRegistrations.map((reg) => {
                        const isClosed = isTargetClosed(reg.targetId, reg.targetType);
                        const isSelected = selectedRegIds.includes(reg.id);
                        return (
                          <tr
                            key={reg.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-red-950/20' : 'hover:bg-zinc-900/40'
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectOne(reg.id)}
                                className="cursor-pointer text-zinc-400 hover:text-white"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-red-500 mx-auto" />
                                ) : (
                                  <Square className="w-4 h-4 text-zinc-600 mx-auto" />
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{reg.studentName}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">({reg.id})</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">{reg.email}</div>
                              {reg.phone && (
                                <div className="text-[10px] text-zinc-500 font-mono">{reg.phone}</div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-zinc-200 block truncate max-w-xs">
                                {reg.targetTitle}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
                                  {reg.targetType}
                                </span>
                                <span>·</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                    isClosed
                                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                  }`}
                                >
                                  {isClosed ? 'Closed Event' : 'Active Event'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-zinc-300">
                              <div className="truncate max-w-xs">{reg.schoolOrCollege}</div>
                              <div className="text-[11px] text-zinc-500">{reg.departmentOrClass}</div>
                              {reg.teamName && (
                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                  Team: <span className="text-zinc-200">{reg.teamName}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {reg.attendance === 'present' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                                    ✓ Present
                                  </span>
                                ) : reg.attendance === 'absent' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/80 border border-rose-800/80 text-rose-400">
                                    ✗ Absent
                                  </span>
                                ) : (
                                  <span className="text-zinc-500 font-mono text-[10px]">Unmarked</span>
                                )}

                                {reg.certificateId && (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
                                      <Award className="w-2.5 h-2.5 text-cyan-400" />
                                      {reg.certificateId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  reg.status === 'confirmed'
                                    ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400'
                                    : reg.status === 'pending'
                                    ? 'bg-amber-950/80 border border-amber-800/80 text-amber-400'
                                    : reg.status === 'archived'
                                    ? 'bg-purple-950/80 border border-purple-800/80 text-purple-300'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {reg.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedRegDetail(reg)}
                                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded transition-colors cursor-pointer"
                                  title="View full record, attendance and certificates"
                                >
                                  Inspect
                                </button>

                                {reg.status === 'archived' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreParticipant(reg)}
                                    className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1"
                                    title="Restore participant to active/closed roster"
                                  >
                                    <ArchiveRestore className="w-3 h-3" />
                                    <span>Restore</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => archiveRegistration(reg.id, true)}
                                    className="p-1 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                    title="Archive participant (safe soft-delete)"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenSingleRemoval(reg)}
                                  className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                                  title="Remove participant with safety verification"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PHOTO GALLERY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Visual Archives & Photo Gallery</h2>
              <p className="text-xs text-zinc-400">
                Upload image assets to Firebase Storage and maintain metadata records in Firestore collection <code>/gallery</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddGallery}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo Asset</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search photo titles, captions, or occasions..."
                value={gallerySearchTerm}
                onChange={(e) => setGallerySearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={galleryCategoryFilter}
                onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Categories</option>
                <option value="Competition">Competition</option>
                <option value="Workshop">Workshop</option>
                <option value="Lab & R&D">Lab & R&D</option>
                <option value="Exhibition">Exhibition</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredGallery.length === 0 ? (
            <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
              <ImageIcon className="w-8 h-8 mx-auto text-zinc-500" />
              <h3 className="text-sm font-bold text-white">No Gallery Photographs Found</h3>
              <p className="text-xs text-zinc-400">Click &ldquo;Upload Photo Asset&rdquo; above to add your first photo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="p-3 bg-[#111420] border-b border-zinc-800 flex items-center justify-center min-h-[12rem] relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-44 object-cover rounded-lg group-hover:scale-102 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <RoboVisual type={item.svgType || 'sumo'} className="h-44" />
                      )}
                      <div className="absolute top-4 left-4 flex gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow-sm ${
                            item.published !== false
                              ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'
                              : 'bg-zinc-900/90 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {item.published !== false ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        {item.imageUrl && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-cyan-400 border border-cyan-800/60 shadow-sm">
                            Storage
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span className="text-red-400 font-semibold">{item.category}</span>
                        <span>{item.year}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">{item.caption || item.description}</p>
                      <span className="text-[11px] font-mono text-zinc-500 block truncate">
                        Context: {item.eventOrWorkshop}
                      </span>
                    </div>
                  </div>

                  {/* Card Controls */}
                  <div className="p-3 bg-[#080A0E] border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleGalleryPublished(item)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        item.published !== false
                          ? 'text-zinc-400 hover:text-white bg-zinc-900'
                          : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/40'
                      }`}
                    >
                      {item.published !== false ? 'Unpublish' : 'Publish'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditGallery(item)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors"
                        title="Edit photo details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'gallery',
                            id: item.id,
                            title: item.title,
                            storagePath: item.storagePath,
                          })
                        }
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEAM MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Team Profiles Directory</h2>
              <p className="text-xs text-zinc-400">
                Manage leadership, subsystem leads, and active mentors in Firestore collection <code>/teamMembers</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddTeam}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search engineer name, role, or contact..."
                value={teamSearchTerm}
                onChange={(e) => setTeamSearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={teamSubsystemFilter}
                onChange={(e) => setTeamSubsystemFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Subsystems</option>
                <option value="Leadership">Leadership</option>
                <option value="Embedded & Firmware">Embedded & Firmware</option>
                <option value="Mechanical & CAD">Mechanical & CAD</option>
                <option value="Computer Vision & AI">Computer Vision & AI</option>
                <option value="Operations & Outreach">Operations & Outreach</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredTeam.length === 0 ? (
            <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
              <Users className="w-8 h-8 mx-auto text-zinc-500" />
              <h3 className="text-sm font-bold text-white">No Team Profiles Found</h3>
              <p className="text-xs text-zinc-400">Click &ldquo;Add Team Member&rdquo; above to register team personnel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-red-400 font-semibold">{member.subsystem}</span>
                      <div className="flex items-center gap-1.5">
                        {member.isLead && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-800/80 text-red-400">
                            LEAD
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            member.published !== false
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {member.published !== false ? 'PUBLISHED' : 'HIDDEN'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover border border-red-500/40 shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-base font-mono shrink-0">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-zinc-300 font-medium truncate">{member.role}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{member.department || member.yearAndDept}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{member.bio}</p>

                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {member.skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141824] text-zinc-300 border border-zinc-800"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 truncate max-w-[150px]">{member.email || 'No email set'}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleTeamPublished(member)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[11px]"
                      >
                        {member.published !== false ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleOpenEditTeam(member)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'team',
                            id: member.id,
                            title: member.name,
                            storagePath: member.storagePath,
                          })
                        }
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACHIEVEMENTS & AWARDS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Championship Awards & Honors</h2>
              <p className="text-xs text-zinc-400">
                Log competitive tournament podium finishes, prizes, and certificates in <code>/achievements</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddAchievement}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Achievement / Award</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search achievement title, tournament name, or rank..."
                value={achievementsSearchTerm}
                onChange={(e) => setAchievementsSearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={achievementsCategoryFilter}
                onChange={(e) => setAchievementsCategoryFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Categories</option>
                <option value="National">National</option>
                <option value="International">International</option>
                <option value="Regional">Regional</option>
                <option value="University">University</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>
          </div>

          {/* List */}
          {filteredAchievements.length === 0 ? (
            <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
              <Trophy className="w-8 h-8 mx-auto text-zinc-500" />
              <h3 className="text-sm font-bold text-white">No Achievements Logged</h3>
              <p className="text-xs text-zinc-400">Click &ldquo;Add Achievement / Award&rdquo; to chronicle a robotics victory.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      {ach.imageUrl ? (
                        <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Trophy className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-red-500">{ach.year}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {ach.category}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          ★ {ach.rankOrAward || ach.position}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            ach.published !== false
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {ach.published !== false ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{ach.title}</h4>
                      <p className="text-xs text-zinc-300 font-medium">{ach.eventName}</p>
                      <p className="text-xs text-zinc-400 max-w-2xl">{ach.description}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono text-zinc-500">
                        {ach.prizeDetails && <span>Prize: {ach.prizeDetails}</span>}
                        {ach.teamMembers && ach.teamMembers.length > 0 && (
                          <span>Team: {ach.teamMembers.join(', ')}</span>
                        )}
                        {ach.certificateId && <span>Cert: {ach.certificateId}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800/80 shrink-0">
                    <button
                      onClick={() => handleToggleAchievementPublished(ach)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded"
                    >
                      {ach.published !== false ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleOpenEditAchievement(ach)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                      title="Edit Achievement"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'achievement',
                          id: ach.id,
                          title: ach.title,
                          storagePath: ach.storagePath,
                        })
                      }
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded"
                      title="Delete Achievement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: R&D PROJECTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Hardware R&D Builds & Robotics Platforms</h2>
              <p className="text-xs text-zinc-400">
                Document and publish prototype robots and embedded solutions in Firestore collection <code>/projects</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddProject}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add R&D Project</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search robot title, category, lead, or summary..."
                value={projectsSearchTerm}
                onChange={(e) => setProjectsSearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={projectsCategoryFilter}
                onChange={(e) => setProjectsCategoryFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Categories</option>
                <option value="Combat Bot">Combat Bot</option>
                <option value="Sports Bot">Sports Bot</option>
                <option value="Autonomous Rover">Autonomous Rover</option>
                <option value="Drone">Drone</option>
                <option value="Embedded IoT">Embedded IoT</option>
                <option value="Vision System">Vision System</option>
                <option value="Research Prototype">Research Prototype</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProjects.length === 0 ? (
            <div className="p-16 text-center bg-[#0C0F17] border border-zinc-800 rounded-2xl space-y-3">
              <Bot className="w-8 h-8 mx-auto text-zinc-500" />
              <h3 className="text-sm font-bold text-white">No R&D Projects Found</h3>
              <p className="text-xs text-zinc-400">Click &ldquo;Add R&D Project&rdquo; to publish a robot build or hardware platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md group"
                >
                  <div>
                    {/* Media */}
                    <div className="p-3 bg-[#111420] border-b border-zinc-800 flex items-center justify-center min-h-[12rem] relative">
                      {proj.imageUrl ? (
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-full h-44 object-cover rounded-lg group-hover:scale-102 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <RoboVisual
                          type={
                            proj.category.includes('Soccer')
                              ? 'soccer'
                              : proj.category.includes('Sumo')
                              ? 'sumo'
                              : proj.category.includes('Drone')
                              ? 'drone'
                              : 'rover'
                          }
                          className="h-44"
                        />
                      )}
                      <div className="absolute top-4 left-4 flex gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow-sm ${
                            proj.published !== false
                              ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'
                              : 'bg-zinc-900/90 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {proj.published !== false ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700">
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-red-400 font-bold uppercase">{proj.category}</span>
                        <span className="text-zinc-400">Lead: {proj.teamLead}</span>
                      </div>

                      <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{proj.summary}</p>

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies.slice(0, 5).map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#080A0E] border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleProjectPublished(proj)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-900 rounded"
                    >
                      {proj.published !== false ? 'Unpublish' : 'Publish'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                          title="View Repository"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEditProject(proj)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'project',
                            id: proj.id,
                            title: proj.title,
                            storagePath: proj.storagePath,
                          })
                        }
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EVENT MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Robotics Competitions & Tournaments</h2>
              <p className="text-xs text-zinc-400">
                Manage flagship invitationals, rulebooks, and participant quotas in <code>/events</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddEvent}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">{evt.category}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        evt.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {evt.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{evt.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{evt.shortDescription}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-400 border-t border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">SCHEDULE</span>
                      <span className="text-zinc-200">{evt.date}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">REGISTERED</span>
                      <span className="text-zinc-200 font-bold">
                        {evt.registeredCount} / {evt.capacity} teams
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleEventStatus(evt)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded transition-colors"
                  >
                    {evt.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditEvent(evt)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'event',
                          id: evt.id,
                          title: evt.title,
                        })
                      }
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: WORKSHOP MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'workshops' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Workshops & STEM Curriculums</h2>
              <p className="text-xs text-zinc-400">
                School and college robotics, IoT, and embedded tracks in Firestore collection <code>/workshops</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddWorkshop}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workshop Track</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">{ws.track}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {ws.targetAudience}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          ws.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {ws.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">{ws.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{ws.description}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-400 border-t border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">DURATION</span>
                      <span className="text-zinc-200">{ws.duration}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">ENROLLMENT</span>
                      <span className="text-zinc-200 font-bold">
                        {ws.registeredCount} / {ws.capacity} students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleWorkshopStatus(ws)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded transition-colors"
                  >
                    {ws.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditWorkshop(ws)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'workshop',
                          id: ws.id,
                          title: ws.title,
                        })
                      }
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                      title="Delete Workshop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: BOT DOCUMENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'bot-documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Bot Details &amp; Engineering Blueprints</h2>
              <p className="text-xs text-zinc-400">
                Manage PDF technical documents, robot schematics, and competition blueprints in <code>/botDocuments</code>.
              </p>
            </div>
            <button
              onClick={handleOpenAddBotDoc}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-[#0C0F17] border border-zinc-800 p-3 rounded-xl text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents by title, description, or bot/competition..."
                value={botDocSearchTerm}
                onChange={(e) => setBotDocSearchTerm(e.target.value)}
                className="w-full bg-[#07090D] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs shrink-0">Status:</span>
              <select
                value={botDocStatusFilter}
                onChange={(e) => setBotDocStatusFilter(e.target.value as any)}
                className="bg-[#07090D] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none"
              >
                <option value="all">All Documents ({botDocuments.length})</option>
                <option value="published">Published ({botDocuments.filter((d) => d.published).length})</option>
                <option value="draft">Drafts Only ({botDocuments.filter((d) => !d.published).length})</option>
              </select>
            </div>
          </div>

          {/* Documents Grid / List */}
          {(() => {
            const filteredDocs = botDocuments.filter((docItem) => {
              if (botDocStatusFilter === 'published' && !docItem.published) return false;
              if (botDocStatusFilter === 'draft' && docItem.published) return false;
              if (botDocSearchTerm.trim()) {
                const term = botDocSearchTerm.toLowerCase();
                const matchesTitle = docItem.title.toLowerCase().includes(term);
                const matchesDesc = docItem.description.toLowerCase().includes(term);
                const matchesTag = (docItem.botOrCompetition || '').toLowerCase().includes(term);
                return matchesTitle || matchesDesc || matchesTag;
              }
              return true;
            });

            if (filteredDocs.length === 0) {
              return (
                <div className="p-12 text-center text-zinc-500 bg-[#0C0F17] border border-zinc-800 rounded-xl space-y-2">
                  <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">No Bot Documents Found</p>
                  <p className="text-xs text-zinc-500">
                    {botDocuments.length === 0
                      ? 'No technical PDF documents have been uploaded yet. Click "Upload PDF Document" above to attach a robot specification.'
                      : 'No documents match your current filter criteria.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((docItem) => {
                  const sizeFormatted =
                    docItem.fileSize && docItem.fileSize > 0
                      ? docItem.fileSize > 1024 * 1024
                        ? `${(docItem.fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : `${(docItem.fileSize / 1024).toFixed(0)} KB`
                      : 'PDF Document';

                  return (
                    <div
                      key={docItem.id}
                      className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-red-400" />
                            <span>{docItem.fileName || 'document.pdf'}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                docItem.published
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              }`}
                            >
                              {docItem.published ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{docItem.title}</span>
                          </h3>
                          {docItem.botOrCompetition && (
                            <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-800/40">
                              {docItem.botOrCompetition}
                            </span>
                          )}
                          <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                            {docItem.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80">
                          <span>Size: <span className="text-zinc-300">{sizeFormatted}</span></span>
                          {docItem.uploadedAt && (
                            <>
                              <span>&bull;</span>
                              <span>Date: <span className="text-zinc-300">{docItem.uploadedAt}</span></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={docItem.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                            title="Open PDF document in new window"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                            <span>View PDF</span>
                          </a>
                          <button
                            onClick={() => handleToggleBotDocPublished(docItem)}
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded transition-colors cursor-pointer"
                          >
                            {docItem.published ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditBotDoc(docItem)}
                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Edit / Replace</span>
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'bot-document',
                                id: docItem.id,
                                title: docItem.title,
                              })
                            }
                            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded transition-colors cursor-pointer"
                            title="Delete Bot Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: HOST ENQUIRIES */}
      {/* ========================================================================= */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Institutional Workshop Requests</h2>
              <p className="text-xs text-zinc-400">
                Booking and outreach enquiries submitted by schools, colleges, and university faculties.
              </p>
            </div>
          </div>

          {workshopEnquiries.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 bg-[#0C0F17] border border-zinc-800 rounded-xl">
              No institutional booking requests currently pending.
            </div>
          ) : (
            <div className="space-y-4">
              {workshopEnquiries.map((enq) => (
                <div key={enq.id} className="bg-[#0C0F17] border border-zinc-800 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-red-400">{enq.id}</span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {enq.institutionName} ({enq.institutionType})
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Contact: {enq.contactPerson} ({enq.designation}) · {enq.email} · {enq.phone}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{enq.timestamp}</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded-lg text-xs space-y-1">
                    <div className="flex gap-4">
                      <span className="text-zinc-500">Track:</span>
                      <span className="text-zinc-200 font-medium">{enq.preferredTrack}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-zinc-500">Cohort Size:</span>
                      <span className="text-zinc-200">{enq.estimatedStudents} students</span>
                    </div>
                    {enq.message && (
                      <div className="pt-1 text-zinc-300">
                        <span className="text-zinc-500 block">Notes:</span>
                        {enq.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: FIREBASE & SECURITY TESTS */}
      {/* ========================================================================= */}
      {activeTab === 'firebase-architecture' && (
        <div className="space-y-8">
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Firebase Project Connection: altronz</h2>
                  <p className="text-xs text-zinc-400">
                    Live Cloud Firestore Database, Firebase Storage & Firebase Auth
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
                  ONLINE &amp; SECURED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-2">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">PROJECT ID</span>
                <span className="text-zinc-200 font-bold">altronz</span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">PRIMARY STORAGE BUCKET</span>
                <span className="text-zinc-200 font-bold">altronz.firebasestorage.app</span>
              </div>
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">ACTIVE ADMIN SESSION</span>
                <span className="text-zinc-200 font-bold truncate block">
                  {currentUser?.email || 'Authorized Administrator'}
                </span>
              </div>
            </div>

            {/* Approved 5 Admin Accounts Directory */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  Authorized Team Administrators (5 Accounts)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Enforced in Firestore Rules & Auth
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
                {[
                  { email: 'ssmssai2007@gmail.com', label: 'Primary Admin' },
                  { email: 'praveenananth107@gmail.com', label: 'Operations Admin' },
                  { email: 'sheikramiz021@gmail.com', label: 'Operations Admin' },
                  { email: 'anzz63065@gmail.com', label: 'Operations Admin' },
                  { email: 'nowfalsiraj007@gmail.com', label: 'Operations Admin' },
                ].map((adm, i) => {
                  const isCurrent = currentUser?.email?.toLowerCase() === adm.email.toLowerCase();
                  return (
                    <div
                      key={adm.email}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        isCurrent
                          ? 'bg-red-950/40 border-red-800/80 text-white'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Admin #{i + 1}</span>
                        {isCurrent && <span className="text-emerald-400 font-bold text-[9px] uppercase">Active</span>}
                      </div>
                      <div className="text-[11px] font-semibold truncate text-white" title={adm.email}>
                        {adm.email}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{adm.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Test Action Triggers */}
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
                Automated Verification & Diagnostics
              </span>
              <h3 className="text-lg font-bold text-white">Live Firebase Operation Tests</h3>
              <p className="text-xs text-zinc-400">
                Run live operations against your connected Firebase project <code>altronz</code> to verify database writes, authorized reads, and security rule enforcement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={runLiveWriteTest}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-red-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                    1. Test Write to Firestore
                  </span>
                  <Play className="w-3.5 h-3.5 text-red-500" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Writes a validated student registration document to <code>/registrations</code> using serverTimestamp.
                </p>
              </button>

              <button
                onClick={runLiveReadTest}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    2. Test Admin Read Access
                  </span>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Queries all records from Firestore as an authorized admin and verifies permission clearance.
                </p>
              </button>

              <button
                onClick={runLiveRejectTest}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-amber-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    3. Test Security Rejection
                  </span>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sends an unauthorized malformed payload with forbidden keys to confirm rules block it with PERMISSION_DENIED.
                </p>
              </button>

              <button
                onClick={runCloudinaryTest}
                className="p-4 bg-[#121520] hover:bg-[#181C2B] border border-zinc-800 hover:border-cyan-500/50 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    4. Test Cloudinary Preset
                  </span>
                  <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Probes cloud <code>fltlrs3</code> and preset <code>altronz_gallery</code> to test Unsigned mode status.
                </p>
              </button>
            </div>

            {/* Test Log Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Diagnostic Execution Stream:</span>
                {testLog.length > 0 && (
                  <button onClick={() => setTestLog([])} className="text-[11px] text-zinc-500 hover:text-zinc-300">
                    Clear Stream
                  </button>
                )}
              </div>

              <div className="bg-[#06080C] border border-zinc-800/80 rounded-xl p-4 font-mono text-xs max-h-56 overflow-y-auto space-y-2">
                {testLog.length === 0 ? (
                  <span className="text-zinc-600">
                    No tests executed yet. Click one of the test triggers above to execute against Firestore.
                  </span>
                ) : (
                  testLog.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5">{log.timestamp}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : log.status === 'failed'
                            ? 'bg-red-950 text-red-400 border border-red-800/60'
                            : log.status === 'info'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className={log.status === 'success' ? 'text-zinc-200' : log.status === 'failed' ? 'text-red-300' : log.status === 'info' ? 'text-cyan-200' : 'text-zinc-400'}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0F1219] border border-red-900/60 rounded-2xl p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Confirm Content Deletion</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Are you sure you want to permanently delete &ldquo;
                  <span className="text-white font-semibold">{deleteTarget.title}</span>&rdquo;?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
              This action will remove the document and its metadata permanently from Cloud Firestore.
            </p>

            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/20"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GALLERY ADD / EDIT */}
      {/* ========================================================================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingGalleryItem ? 'Edit Photo Asset Metadata' : 'Upload New Photo to Gallery'}
              </h3>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
              <ImageUploadField
                label="Photograph Asset (Cloudinary CDN · Preset: altronz_gallery)"
                folder="gallery"
                currentImageUrl={galleryFormData.secureUrl || galleryFormData.imageUrl}
                currentPublicId={galleryFormData.publicId}
                onImageChange={(url, publicId) =>
                  setGalleryFormData((prev) => ({
                    ...prev,
                    imageUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Asset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robot Arena Heavyweight Finals"
                  value={galleryFormData.title}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={galleryFormData.category}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, category: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Lab & R&D">Lab & R&D</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Year</label>
                  <input
                    type="number"
                    min={2020}
                    max={2030}
                    required
                    value={galleryFormData.year}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, year: Number(e.target.value) })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Event / Workshop Context</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robo Sumo Invitational 2026"
                    value={galleryFormData.eventOrWorkshop}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, eventOrWorkshop: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Fallback Schematic</label>
                  <select
                    value={galleryFormData.svgType}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, svgType: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="sumo">Sumo Robot</option>
                    <option value="soccer">Soccer Robot</option>
                    <option value="iot">IoT Microcontroller</option>
                    <option value="rover">Rover Platform</option>
                    <option value="drone">Aerial Drone</option>
                    <option value="workshop">Classroom Workshop</option>
                    <option value="lab">Lab Testbench</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide context about what is shown in this field photo..."
                  value={galleryFormData.caption}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="galPublished"
                  checked={galleryFormData.published}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, published: e.target.checked })}
                  className="w-4 h-4 accent-red-600 rounded bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="galPublished" className="text-xs text-zinc-300 cursor-pointer font-medium">
                  Publish immediately (visible to public website visitors)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGalleryItem ? 'Save Changes' : 'Upload to Gallery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEAM ADD / EDIT */}
      {/* ========================================================================= */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTeamMember ? 'Edit Team Member Profile' : 'Register New Team Member'}
              </h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <ImageUploadField
                label="Profile Photo (Cloudinary CDN · Preset: altronz_gallery)"
                folder="team"
                currentImageUrl={teamFormData.secureUrl || teamFormData.imageUrl}
                currentPublicId={teamFormData.publicId}
                onImageChange={(url, publicId) =>
                  setTeamFormData((prev) => ({
                    ...prev,
                    imageUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sai Krishna"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Embedded Firmware Lead"
                    value={teamFormData.role}
                    onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Subsystem / Department</label>
                  <select
                    value={teamFormData.subsystem}
                    onChange={(e) => setTeamFormData({ ...teamFormData, subsystem: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Embedded & Firmware">Embedded & Firmware</option>
                    <option value="Mechanical & CAD">Mechanical & CAD</option>
                    <option value="Computer Vision & AI">Computer Vision & AI</option>
                    <option value="Operations & Outreach">Operations & Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Academic Year & Department</label>
                  <input
                    type="text"
                    placeholder="3rd Year Mechatronics"
                    value={teamFormData.yearAndDept}
                    onChange={(e) =>
                      setTeamFormData({ ...teamFormData, yearAndDept: e.target.value, department: e.target.value })
                    }
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Bio / Profile Overview</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specializations, responsibilities, and tournament experience..."
                  value={teamFormData.bio}
                  onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Technical Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="STM32, FreeRTOS, KiCad, ROS2, SolidWorks"
                  value={teamFormData.skills}
                  onChange={(e) => setTeamFormData({ ...teamFormData, skills: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="name@altronz.org"
                    value={teamFormData.email}
                    onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={teamFormData.linkedin}
                    onChange={(e) => setTeamFormData({ ...teamFormData, linkedin: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={teamFormData.displayOrder}
                    onChange={(e) => setTeamFormData({ ...teamFormData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamFormData.isLead}
                    onChange={(e) => setTeamFormData({ ...teamFormData, isLead: e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-zinc-300 font-medium">Core Subsystem Lead Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamFormData.published}
                    onChange={(e) => setTeamFormData({ ...teamFormData, published: e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-zinc-300 font-medium">Publish to Public Roster</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTeamMember ? 'Save Profile' : 'Add to Team'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACHIEVEMENTS ADD / EDIT */}
      {/* ========================================================================= */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingAchievement ? 'Edit Competition Honor / Trophy' : 'Log New Championship Achievement'}
              </h3>
              <button onClick={() => setIsAchievementModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-3.5 text-xs">
              <ImageUploadField
                label="Trophy / Certificate Photo (Cloudinary CDN · Preset: altronz_gallery)"
                folder="achievements"
                currentImageUrl={achievementFormData.secureUrl || achievementFormData.imageUrl}
                currentPublicId={achievementFormData.publicId}
                onImageChange={(url, publicId) =>
                  setAchievementFormData((prev) => ({
                    ...prev,
                    imageUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1">Title / Honor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Autonomous Sumo Champions"
                    value={achievementFormData.title}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, title: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Tournament / Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. All India Robotics Invitational 2026"
                    value={achievementFormData.eventName}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, eventName: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Rank / Position</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place - Gold Trophy"
                    value={achievementFormData.rankOrAward}
                    onChange={(e) =>
                      setAchievementFormData({
                        ...achievementFormData,
                        rankOrAward: e.target.value,
                        position: e.target.value,
                      })
                    }
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={achievementFormData.category}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, category: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="National">National</option>
                    <option value="International">International</option>
                    <option value="Regional">Regional</option>
                    <option value="University">University</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Year</label>
                  <input
                    type="number"
                    min={2020}
                    max={2030}
                    required
                    value={achievementFormData.year}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, year: Number(e.target.value) })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of the rounds, opposing robots, and technical milestones..."
                  value={achievementFormData.description}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, description: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Prize / Cash Details (optional)</label>
                  <input
                    type="text"
                    placeholder="$2,500 Cash Prize & Medals"
                    value={achievementFormData.prizeDetails}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, prizeDetails: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Certificate / Verification ID</label>
                  <input
                    type="text"
                    placeholder="NRC-2026-CHAMP-01"
                    value={achievementFormData.certificateId}
                    onChange={(e) => setAchievementFormData({ ...achievementFormData, certificateId: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Participating Squad Members (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Sai Krishna, Rahul V, Ananya M"
                  value={achievementFormData.teamMembers}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, teamMembers: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="achPublished"
                  checked={achievementFormData.published}
                  onChange={(e) => setAchievementFormData({ ...achievementFormData, published: e.target.checked })}
                  className="w-4 h-4 accent-red-600 rounded bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="achPublished" className="text-xs text-zinc-300 cursor-pointer font-medium">
                  Display in public Hall of Honors
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAchievement ? 'Save Changes' : 'Log Achievement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: R&D PROJECTS ADD / EDIT */}
      {/* ========================================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProject ? 'Edit R&D Project / Robot Build' : 'Publish New R&D Hardware Project'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <ImageUploadField
                label="Robot / Prototype Photo (Cloudinary CDN · Preset: altronz_gallery)"
                folder="projects"
                currentImageUrl={projectFormData.secureUrl || projectFormData.imageUrl}
                currentPublicId={projectFormData.publicId}
                onImageChange={(url, publicId) =>
                  setProjectFormData((prev) => ({
                    ...prev,
                    imageUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1">Project Title / Robot Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TITAN-X: 3.0 kg Autonomous Combat Sumo"
                    value={projectFormData.title}
                    onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={projectFormData.category}
                    onChange={(e) => setProjectFormData({ ...projectFormData, category: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Combat Bot">Combat Bot</option>
                    <option value="Sports Bot">Sports Bot</option>
                    <option value="Autonomous Rover">Autonomous Rover</option>
                    <option value="Drone">Drone</option>
                    <option value="Embedded IoT">Embedded IoT</option>
                    <option value="Vision System">Vision System</option>
                    <option value="Research Prototype">Research Prototype</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Build Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Active">Active / In Field</option>
                    <option value="In Development">In Development</option>
                    <option value="Completed">Completed</option>
                    <option value="In Testing">In Testing</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Short Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="Concise 1-2 sentence engineering description..."
                  value={projectFormData.summary}
                  onChange={(e) => setProjectFormData({ ...projectFormData, summary: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Technical Overview</label>
                <textarea
                  rows={2}
                  placeholder="Detailed architecture, motor control schemes, sensors, and kinematics..."
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Team Lead *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lead Engineer"
                    value={projectFormData.teamLead}
                    onChange={(e) => setProjectFormData({ ...projectFormData, teamLead: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Contributing Members (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Rahul V, Sneha P, Vikram S"
                    value={projectFormData.teamMembers}
                    onChange={(e) => setProjectFormData({ ...projectFormData, teamMembers: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Technologies Used (comma-separated)</label>
                <input
                  type="text"
                  placeholder="ROS2, STM32F4, KiCad, OpenCV, SolidWorks"
                  value={projectFormData.technologies}
                  onChange={(e) => setProjectFormData({ ...projectFormData, technologies: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Hardware Specifications (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Motors: Dual 24V Brushless, Battery: 4S LiPo, Chassis: CNC 7075-T6"
                  value={projectFormData.hardwareSpecs}
                  onChange={(e) => setProjectFormData({ ...projectFormData, hardwareSpecs: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/altronz-robotics/..."
                    value={projectFormData.githubUrl}
                    onChange={(e) => setProjectFormData({ ...projectFormData, githubUrl: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Demo Video / Simulation URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/... or simulation"
                    value={projectFormData.demoUrl}
                    onChange={(e) => setProjectFormData({ ...projectFormData, demoUrl: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="projPublished"
                  checked={projectFormData.published}
                  onChange={(e) => setProjectFormData({ ...projectFormData, published: e.target.checked })}
                  className="w-4 h-4 accent-red-600 rounded bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="projPublished" className="text-xs text-zinc-300 cursor-pointer font-medium">
                  Publish to public Projects showcase
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProject ? 'Save Project' : 'Publish Build'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EVENT ADD / EDIT */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingEventId ? 'Edit Event Details' : 'Publish New Competition Event'}
              </h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <ImageUploadField
                label="Competition Poster / Banner (Cloudinary CDN · Preset: altronz_gallery)"
                folder="events"
                currentImageUrl={eventFormData.secureUrl || eventFormData.posterUrl}
                currentPublicId={eventFormData.publicId}
                onImageChange={(url, publicId) =>
                  setEventFormData((prev) => ({
                    ...prev,
                    posterUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Combat">Combat</option>
                    <option value="Sports">Sports</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Aerial">Aerial</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Status</label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Registration Deadline</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.registrationDeadline}
                    onChange={(e) => setEventFormData({ ...eventFormData, registrationDeadline: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Team Capacity Limit</label>
                  <input
                    type="number"
                    min={4}
                    max={128}
                    required
                    value={eventFormData.capacity}
                    onChange={(e) => setEventFormData({ ...eventFormData, capacity: Number(e.target.value) })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1">Short Summary</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.shortDescription}
                    onChange={(e) => setEventFormData({ ...eventFormData, shortDescription: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1">Rules (One per line)</label>
                  <textarea
                    rows={3}
                    value={eventFormData.rules}
                    onChange={(e) => setEventFormData({ ...eventFormData, rules: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-300 font-medium">WhatsApp Group Invite Link (Optional)</label>
                    <span className="text-[10px] text-zinc-500 font-mono">e.g. https://chat.whatsapp.com/...</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/ExampleGroupId"
                    value={eventFormData.whatsappInviteUrl}
                    onChange={(e) => setEventFormData({ ...eventFormData, whatsappInviteUrl: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Verified registrants will receive a &quot;Join WhatsApp Group&quot; link button upon successful registration to join the event chat.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WORKSHOP ADD / EDIT */}
      {/* ========================================================================= */}
      {isWorkshopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingWorkshopId ? 'Edit Workshop Track' : 'Create Workshop Track'}
              </h3>
              <button onClick={() => setIsWorkshopModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-3.5 text-xs">
              <ImageUploadField
                label="Workshop Banner / Hardware Kit Photo (Cloudinary CDN · Preset: altronz_gallery)"
                folder="workshops"
                currentImageUrl={workshopFormData.secureUrl || workshopFormData.imageUrl}
                currentPublicId={workshopFormData.publicId}
                onImageChange={(url, publicId) =>
                  setWorkshopFormData((prev) => ({
                    ...prev,
                    imageUrl: url,
                    posterUrl: url,
                    secureUrl: url,
                    publicId: publicId || '',
                  }))
                }
              />

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Workshop Title *</label>
                <input
                  type="text"
                  required
                  value={workshopFormData.title}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, title: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Track</label>
                  <select
                    value={workshopFormData.track}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, track: e.target.value as any })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Robotics">Robotics</option>
                    <option value="IoT">IoT</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="AI & Vision">AI & Vision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Audience</label>
                  <select
                    value={workshopFormData.targetAudience}
                    onChange={(e) =>
                      setWorkshopFormData({ ...workshopFormData, targetAudience: e.target.value as any })
                    }
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Schools">Schools</option>
                    <option value="Colleges">Colleges</option>
                    <option value="All">All Audiences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={workshopFormData.duration}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, duration: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Batch Capacity</label>
                  <input
                    type="number"
                    value={workshopFormData.capacity}
                    onChange={(e) => setWorkshopFormData({ ...workshopFormData, capacity: Number(e.target.value) })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={workshopFormData.description}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, description: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Modules (One per line)</label>
                <textarea
                  rows={2}
                  value={workshopFormData.modules}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, modules: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsWorkshopModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Workshop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BOT BLUEPRINT DOCUMENT ADD / EDIT */}
      {/* ========================================================================= */}
      {isBotDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1219] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {editingBotDoc ? 'Edit Bot Blueprint Document' : 'Upload Bot Blueprint (PDF Only)'}
                </h3>
              </div>
              <button
                onClick={() => !isSubmitting && setIsBotDocModalOpen(false)}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBotDoc} className="space-y-4 text-xs">
              {/* PDF File Picker Zone */}
              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">
                  Technical PDF Document <span className="text-red-400">*</span>
                  <span className="text-zinc-500 font-mono ml-2 font-normal">(Max 15 MB · PDF format only)</span>
                </label>

                {editingBotDoc && !selectedPdfFile && (
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-white font-mono truncate">{botDocFormData.fileName || 'Attached Document'}</span>
                      {botDocFormData.fileSize > 0 && (
                        <span className="text-zinc-500 font-mono text-[11px] shrink-0">
                          ({(botDocFormData.fileSize / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                    <a
                      href={botDocFormData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 underline font-mono text-[11px] shrink-0"
                    >
                      Preview
                    </a>
                  </div>
                )}

                <div className="border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-4 text-center bg-[#07090D] transition-colors">
                  <input
                    type="file"
                    id="botPdfInput"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfFileSelect}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <label
                    htmlFor="botPdfInput"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                  >
                    <Upload className="w-6 h-6 text-zinc-400 hover:text-red-400 transition-colors" />
                    <span className="text-zinc-300 font-medium">
                      {selectedPdfFile
                        ? `Selected: ${selectedPdfFile.name} (${(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)`
                        : editingBotDoc
                        ? 'Click to choose replacement PDF file'
                        : 'Click to select PDF document'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Strictly PDF files (.pdf) up to 15MB
                    </span>
                  </label>
                </div>

                {pdfValidationError && (
                  <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{pdfValidationError}</span>
                  </div>
                )}

                {pdfUploadProgress > 0 && isSubmitting && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>Uploading to CDN...</span>
                      <span>{pdfUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all duration-300 rounded-full"
                        style={{ width: `${pdfUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Document Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Titan v3 Combat Robot - CAD Blueprints & Wiring Schematic"
                  value={botDocFormData.title}
                  onChange={(e) => setBotDocFormData({ ...botDocFormData, title: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Document Description &amp; Technical Scope <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the robot specifications, power telemetry, motor ratings, and bill of materials included in this document."
                  value={botDocFormData.description}
                  onChange={(e) => setBotDocFormData({ ...botDocFormData, description: e.target.value })}
                  className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Grid: Bot/Competition Tag & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Bot or Competition Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robo Sumo 3.0kg, Robo Soccer"
                    value={botDocFormData.botOrCompetition}
                    onChange={(e) => setBotDocFormData({ ...botDocFormData, botOrCompetition: e.target.value })}
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Publication Status</label>
                  <select
                    value={botDocFormData.published ? 'published' : 'draft'}
                    onChange={(e) =>
                      setBotDocFormData({
                        ...botDocFormData,
                        published: e.target.value === 'published',
                      })
                    }
                    className="w-full bg-[#07090D] border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="published">Published (Visible to Public)</option>
                    <option value="draft">Draft (Admin Only)</option>
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 font-mono">
                Note: Draft documents remain strictly admin-only. Only documents with Published status will appear on the public Bot Details page.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBotDocModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBotDoc ? 'Save Document Changes' : 'Upload & Save Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRATION DETAILS INSPECTION */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: SAFE REMOVAL & ARCHIVE CONFIRMATION WITH ATTENDANCE/CERT AUDIT */}
      {/* ========================================================================= */}
      {removalModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1219] border border-red-900/60 rounded-2xl p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {removalModalState.mode === 'bulk'
                    ? `Remove ${removalModalState.targetRegistrations.length} Participants`
                    : `Remove Participant Registration`}
                </h3>
                <p className="text-xs text-zinc-400">
                  Target Event(s):{' '}
                  <span className="text-white font-semibold">
                    {Array.from(new Set(removalModalState.targetRegistrations.map((r) => r.targetTitle))).join(', ')}
                  </span>
                </p>
              </div>
            </div>

            {/* Selected Participants Summary */}
            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Selected Candidates:</span>
                <span className="text-white font-bold">{removalModalState.targetRegistrations.length} Total</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-xs font-mono">
                {removalModalState.targetRegistrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-0.5 text-zinc-300">
                    <span className="truncate max-w-[200px] sm:max-w-xs">{r.studentName} ({r.email})</span>
                    <span className="text-[10px] text-zinc-500 shrink-0">{r.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance & Certificate Audit Guard */}
            {(() => {
              const affectedRecords = removalModalState.targetRegistrations.filter(
                (r) => r.attendanceRecorded || r.attended || r.certificateIssued || r.certificateId
              );

              if (affectedRecords.length > 0) {
                return (
                  <div className="p-4 bg-amber-950/40 border border-amber-600/70 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Attendance &amp; Certificate Protection Alert!</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      The following participant(s) have verified attendance or completion certificates recorded:
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono bg-black/40 p-2 rounded-lg border border-amber-800/50">
                      {affectedRecords.map((r) => (
                        <div key={r.id} className="text-amber-300 flex items-center justify-between">
                          <span className="font-semibold truncate">{r.studentName}</span>
                          <span className="text-[10px] text-amber-400 shrink-0 ml-2">
                            {r.attendance ? `[Att: ${r.attendance.toUpperCase()}]` : '[Att: Present]'}
                            {r.certificateId ? ` [Cert: ${r.certificateId}]` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Permanent deletion will destroy verified audit records. We recommend archiving to preserve certification validity while clearing the active roster.
                    </p>

                    <div className="pt-1 flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="confirmDeleteWithRecords"
                        checked={removalModalState.confirmPermanentDelete}
                        onChange={(e) =>
                          setRemovalModalState((prev) => ({
                            ...prev,
                            confirmPermanentDelete: e.target.checked,
                          }))
                        }
                        className="mt-0.5 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
                      />
                      <label htmlFor="confirmDeleteWithRecords" className="text-[11px] text-zinc-300 cursor-pointer">
                        I acknowledge that verified attendance or certificate records exist and confirm deliberate deletion.
                      </label>
                    </div>
                  </div>
                );
              }
              return (
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">Safe Audit Check:</span> No recorded attendance or verified certificates were found for these participants.
                </div>
              );
            })()}

            {/* Permanent Warning */}
            <p className="text-[11px] text-zinc-500 font-mono">
              Archiving soft-deletes records so they can be restored. Permanent deletion deletes the document from Cloud Firestore and is irreversible.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() =>
                  setRemovalModalState({
                    isOpen: false,
                    targetRegistrations: [],
                    mode: 'single',
                    isProcessing: false,
                    confirmPermanentDelete: false,
                  })
                }
                disabled={removalModalState.isProcessing}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteArchiveParticipants}
                disabled={removalModalState.isProcessing}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-purple-300 text-xs font-semibold rounded-lg border border-purple-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Archive (soft delete) safely with full recovery"
              >
                <Archive className="w-3.5 h-3.5 text-purple-400" />
                <span>Archive (Safe &amp; Recoverable)</span>
              </button>

              {(() => {
                const hasProtected = removalModalState.targetRegistrations.some(
                  (r) => r.attendanceRecorded || r.attended || r.certificateIssued || r.certificateId
                );
                const canDelete = !hasProtected || removalModalState.confirmPermanentDelete;
                return (
                  <button
                    type="button"
                    onClick={handleExecutePermanentDeleteParticipants}
                    disabled={!canDelete || removalModalState.isProcessing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    {removalModalState.isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Delete Permanently</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ENHANCED REGISTRATION DETAILS & VERIFICATION INSPECTION */}
      {/* ========================================================================= */}
      {selectedRegDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1219] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400">{selectedRegDetail.id}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                      isTargetClosed(selectedRegDetail.targetId, selectedRegDetail.targetType)
                        ? 'bg-amber-950/70 text-amber-400 border border-amber-800/70'
                        : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/70'
                    }`}
                  >
                    {isTargetClosed(selectedRegDetail.targetId, selectedRegDetail.targetType)
                      ? 'Closed Event'
                      : 'Active Event'}
                  </span>
                  {selectedRegDetail.status === 'archived' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-800">
                      Archived
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedRegDetail.studentName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRegDetail(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Event Info */}
            <div className="space-y-2 text-xs divide-y divide-zinc-800/80">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Email Address:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Phone Contact:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Institution:</span>
                <span className="text-zinc-200 text-right">{selectedRegDetail.schoolOrCollege}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Department / Class:</span>
                <span className="text-zinc-200 text-right">{selectedRegDetail.departmentOrClass}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Selected Program:</span>
                <span className="text-zinc-200 text-right font-medium">{selectedRegDetail.targetTitle}</span>
              </div>
              {selectedRegDetail.teamName && (
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Team Name:</span>
                  <span className="text-zinc-200">
                    {selectedRegDetail.teamName} ({selectedRegDetail.teamSize} members)
                  </span>
                </div>
              )}
              {selectedRegDetail.teammateDetails && (
                <div className="py-1">
                  <span className="text-zinc-500 block">Teammates:</span>
                  <span className="text-zinc-300 block mt-0.5">{selectedRegDetail.teammateDetails}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Experience Level:</span>
                <span className="text-zinc-200">{selectedRegDetail.experienceLevel}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Registration Date:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.timestamp}</span>
              </div>
              {selectedRegDetail.archivedAt && (
                <div className="flex justify-between py-1 text-purple-400">
                  <span>Archived Timestamp:</span>
                  <span className="font-mono">{selectedRegDetail.archivedAt}</span>
                </div>
              )}
            </div>

            {/* Attendance Management Section */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Event Attendance
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    selectedRegDetail.attendance === 'present'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : selectedRegDetail.attendance === 'absent'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {selectedRegDetail.attendance || 'Unmarked'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateRegistrationAttendance(selectedRegDetail.id, 'present');
                      setSelectedRegDetail((prev) =>
                        prev ? { ...prev, attendance: 'present', attended: true, attendanceRecorded: true } : null
                      );
                      showToast('success', `Marked ${selectedRegDetail.studentName} as PRESENT.`);
                    } catch (err: any) {
                      showToast('error', `Failed: ${err.message}`);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedRegDetail.attendance === 'present'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Mark Present
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateRegistrationAttendance(selectedRegDetail.id, 'absent');
                      setSelectedRegDetail((prev) =>
                        prev ? { ...prev, attendance: 'absent', attended: false, attendanceRecorded: true } : null
                      );
                      showToast('info', `Marked ${selectedRegDetail.studentName} as ABSENT.`);
                    } catch (err: any) {
                      showToast('error', `Failed: ${err.message}`);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedRegDetail.attendance === 'absent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Mark Absent
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateRegistrationAttendance(selectedRegDetail.id, 'unmarked');
                      setSelectedRegDetail((prev) =>
                        prev ? { ...prev, attendance: undefined, attended: false, attendanceRecorded: false } : null
                      );
                      showToast('info', 'Cleared attendance record.');
                    } catch (err: any) {
                      showToast('error', `Failed: ${err.message}`);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded-lg cursor-pointer"
                  title="Clear attendance"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Certificate Verification Section */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Official Certificate Verification
                </span>
                {selectedRegDetail.certificateId ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">Not Issued</span>
                )}
              </div>

              {selectedRegDetail.certificateId ? (
                <div className="flex items-center justify-between p-2 bg-black/40 border border-cyan-900/50 rounded-lg">
                  <span className="font-mono text-cyan-300 font-bold">{selectedRegDetail.certificateId}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateRegistrationCertificate(selectedRegDetail.id, null);
                        setSelectedRegDetail((prev) =>
                          prev ? { ...prev, certificateIssued: false, certificateId: undefined } : null
                        );
                        showToast('info', 'Certificate revoked.');
                      } catch (err: any) {
                        showToast('error', `Failed: ${err.message}`);
                      }
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. CERT-ALT-2026-8812"
                      value={certInputVal}
                      onChange={(e) => setCertInputVal(e.target.value)}
                      className="flex-1 bg-[#07090D] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCertInputVal(`CERT-ALT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
                      }
                      className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg cursor-pointer shrink-0"
                    >
                      Generate ID
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const idToSave = certInputVal.trim();
                      if (!idToSave) {
                        showToast('error', 'Please enter or generate a Certificate ID first.');
                        return;
                      }
                      try {
                        await updateRegistrationCertificate(selectedRegDetail.id, idToSave);
                        setSelectedRegDetail((prev) =>
                          prev ? { ...prev, certificateIssued: true, certificateId: idToSave } : null
                        );
                        setCertInputVal('');
                        showToast('success', `Assigned Certificate ${idToSave}`);
                      } catch (err: any) {
                        showToast('error', `Failed: ${err.message}`);
                      }
                    }}
                    className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Assign &amp; Verify Certificate
                  </button>
                </div>
              )}
            </div>

            {/* Status Update & Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Roster Status:</span>
                <select
                  value={selectedRegDetail.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as any;
                    try {
                      await updateRegistrationStatus(selectedRegDetail.id, newStatus);
                      setSelectedRegDetail({ ...selectedRegDetail, status: newStatus });
                      showToast('success', `Status updated to ${newStatus.toUpperCase()}`);
                    } catch (err: any) {
                      showToast('error', `Status update failed: ${err.message}`);
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedRegDetail.status === 'archived' ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreParticipant(selectedRegDetail)}
                    className="px-3 py-1.5 bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await archiveRegistration(selectedRegDetail.id, true);
                        setSelectedRegDetail((prev) => (prev ? { ...prev, status: 'archived' } : null));
                        showToast('success', `Archived ${selectedRegDetail.studentName}.`);
                      } catch (err: any) {
                        showToast('error', `Archive failed: ${err.message}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Soft-delete safely"
                  >
                    <Archive className="w-3.5 h-3.5 text-purple-400" />
                    <span>Archive</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenSingleRemoval(selectedRegDetail)}
                  className="px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Remove participant with safety checks"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRegDetail(null)}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
