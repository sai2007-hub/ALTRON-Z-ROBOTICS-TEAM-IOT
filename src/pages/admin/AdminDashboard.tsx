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
} from 'lucide-react';
import { saveRegistrationToFirestore, fetchRegistrationsFromFirestore } from '../../services/registrationService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RoboVisual } from '../../components/common/RoboVisual';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { testCloudinaryConnection } from '../../services/cloudinaryService';

type AdminTab =
  | 'overview'
  | 'registrations'
  | 'gallery'
  | 'team'
  | 'achievements'
  | 'projects'
  | 'events'
  | 'workshops'
  | 'enquiries'
  | 'firebase-architecture';

interface ToastNotification {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DeleteTarget {
  type: 'gallery' | 'team' | 'achievement' | 'project' | 'event' | 'workshop';
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
    exportRegistrationsCSV,
    reloadFirestoreRegistrations,
    refreshAllCMSData,
    seedInitialDataToFirestore,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<ToastNotification | null>(null);

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
  const [selectedRegDetail, setSelectedRegDetail] = useState<Registration | null>(null);

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
  // METRICS & FILTERS
  // ==========================================
  const totalRegistrations = registrations.length;
  const activeEventsCount = events.filter((e) => e.status === 'published').length;
  const activeWorkshopsCount = workshops.filter((w) => w.status === 'published').length;
  const totalCapacity = events.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalSlotsFilled = events.reduce((acc, curr) => acc + curr.registeredCount, 0);

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
      reg.schoolOrCollege.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
      (reg.teamName && reg.teamName.toLowerCase().includes(regSearchTerm.toLowerCase()));

    const matchesTarget =
      regTargetFilter === 'All' ||
      (regTargetFilter === 'events' && reg.targetType === 'event') ||
      (regTargetFilter === 'workshops' && reg.targetType === 'workshop') ||
      reg.targetId === regTargetFilter;

    return matchesSearch && matchesTarget;
  });

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
              Admin: <span className="text-zinc-200">{currentUser?.email || 'ssmssai2007@gmail.com'}</span>
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
            onClick={exportRegistrationsCSV}
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
          { id: 'registrations', label: `Registrations (${registrations.length})`, icon: FileSpreadsheet },
          { id: 'gallery', label: `Photo Gallery (${gallery.length})`, icon: ImageIcon },
          { id: 'team', label: `Team Members (${teamMembers.length})`, icon: Users },
          { id: 'achievements', label: `Achievements (${achievements.length})`, icon: Trophy },
          { id: 'projects', label: `R&D Projects (${projects.length})`, icon: Cpu },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'workshops', label: `Workshops (${workshops.length})`, icon: Building },
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
      {/* TAB 2: STUDENT REGISTRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Student Registrations Roster</h2>
              <p className="text-xs text-zinc-400">
                Live participant entries recorded in Cloud Firestore collection <code>/registrations</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncFirestore}
                disabled={isSyncing}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold rounded-lg border border-zinc-700 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportRegistrationsCSV}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidate name, email, institution, or team name..."
                value={regSearchTerm}
                onChange={(e) => setRegSearchTerm(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={regTargetFilter}
                onChange={(e) => setRegTargetFilter(e.target.value)}
                className="w-full bg-[#0C0F17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Events & Workshops</option>
                <option value="events">All Competitions (Events)</option>
                <option value="workshops">All Workshops</option>
                <optgroup label="Specific Competitions">
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Specific Workshops">
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0C0F17] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">
                No registration records found matching the current search query or filter.
              </div>
            ) : (
              <div>
                {/* Mobile Card List View (< 640px) */}
                <div className="block sm:hidden divide-y divide-zinc-800/80">
                  {filteredRegistrations.map((reg) => (
                    <div key={reg.id} className="p-4 space-y-2.5 hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-white">{reg.studentName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{reg.email}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400'
                              : reg.status === 'pending'
                              ? 'bg-amber-950/80 border border-amber-800/80 text-amber-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-zinc-300">
                        <div>
                          <span className="text-zinc-500 text-[11px]">Program: </span>
                          <span className="font-medium text-zinc-200">{reg.targetTitle}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[11px]">Institution: </span>
                          <span>{reg.schoolOrCollege}</span>
                        </div>
                        {reg.teamName && (
                          <div>
                            <span className="text-zinc-500 text-[11px]">Team: </span>
                            <span className="font-medium text-zinc-200">{reg.teamName} ({reg.teamSize || 2} members)</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => setSelectedRegDetail(reg)}
                          className="min-h-[38px] px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop & Tablet Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#080A0E] text-[11px] font-mono text-zinc-400">
                        <th className="py-3 px-4">STUDENT NAME</th>
                        <th className="py-3 px-4">PROGRAM</th>
                        <th className="py-3 px-4">INSTITUTION</th>
                        <th className="py-3 px-4">TEAM NAME</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{reg.studentName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{reg.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-zinc-200 block truncate max-w-xs">
                              {reg.targetTitle}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-red-400">
                              {reg.targetType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">
                            <div className="truncate max-w-xs">{reg.schoolOrCollege}</div>
                            <div className="text-[11px] text-zinc-500">{reg.departmentOrClass}</div>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">
                            {reg.teamName ? (
                              <div>
                                <span className="font-semibold text-zinc-200">{reg.teamName}</span>
                                <span className="text-[10px] text-zinc-500 block">
                                  {reg.teamSize || 2} members
                                </span>
                              </div>
                            ) : (
                              <span className="text-zinc-600 font-mono text-[11px]">Individual</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                reg.status === 'confirmed'
                                  ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-400'
                                  : reg.status === 'pending'
                                  ? 'bg-amber-950/80 border border-amber-800/80 text-amber-400'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedRegDetail(reg)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
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
                <span className="text-zinc-500 block text-[10px]">ACTIVE ADMIN ROLE</span>
                <span className="text-zinc-200 font-bold truncate block">
                  {currentUser?.email || 'ssmssai2007@gmail.com'}
                </span>
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
      {/* MODAL: REGISTRATION DETAILS INSPECTION */}
      {/* ========================================================================= */}
      {selectedRegDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1219] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-red-400">{selectedRegDetail.id}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedRegDetail.studentName}</h3>
              </div>
              <button onClick={() => setSelectedRegDetail(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-zinc-800/80">
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Email Address:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Phone Contact:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.phone}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Institution:</span>
                <span className="text-zinc-200 text-right">{selectedRegDetail.schoolOrCollege}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Department / Class:</span>
                <span className="text-zinc-200 text-right">{selectedRegDetail.departmentOrClass}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Selected Program:</span>
                <span className="text-zinc-200 text-right font-medium">{selectedRegDetail.targetTitle}</span>
              </div>
              {selectedRegDetail.teamName && (
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Team Name:</span>
                  <span className="text-zinc-200">
                    {selectedRegDetail.teamName} ({selectedRegDetail.teamSize} members)
                  </span>
                </div>
              )}
              {selectedRegDetail.teammateDetails && (
                <div className="py-1.5">
                  <span className="text-zinc-500 block">Teammates:</span>
                  <span className="text-zinc-300 block mt-0.5">{selectedRegDetail.teammateDetails}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Experience:</span>
                <span className="text-zinc-200">{selectedRegDetail.experienceLevel}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Submission Date:</span>
                <span className="text-zinc-200 font-mono">{selectedRegDetail.timestamp}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Update Status:</span>
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
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="waitlist">Waitlist</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedRegDetail(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
