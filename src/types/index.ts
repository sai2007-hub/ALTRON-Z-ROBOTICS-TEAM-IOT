export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: 'Combat' | 'Sports' | 'Autonomous' | 'Aerial' | 'Design';
  shortDescription: string;
  fullDescription: string;
  rules: string[];
  dimensionsAndSpecs: string[];
  date: string;
  time: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  entryFee: string;
  teamSize: string;
  status: 'published' | 'draft' | 'archived';
  published?: boolean;
  whatsappInviteUrl?: string;
  posterUrl?: string;
  publicId?: string;
  secureUrl?: string;
  highlights: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkshopItem {
  id: string;
  slug: string;
  title: string;
  track: 'Robotics' | 'IoT' | 'Embedded Systems' | 'AI & Vision';
  targetAudience: 'Schools' | 'Colleges' | 'All';
  duration: string;
  schedule: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  description: string;
  modules: string[];
  hardwareProvided: string[];
  prerequisites: string;
  status: 'published' | 'draft' | 'completed';
  published?: boolean;
  featured?: boolean;
  imageUrl?: string;
  posterUrl?: string;
  publicId?: string;
  secureUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category:
    | 'Competition Bot'
    | 'Combat Bot'
    | 'Sports Bot'
    | 'Autonomous Rover'
    | 'Autonomous'
    | 'Drone'
    | 'Embedded IoT'
    | 'IoT Solution'
    | 'Vision System'
    | 'Research Prototype'
    | string;
  summary: string;
  description: string;
  technologies: string[];
  status: 'Active' | 'In Development' | 'Completed' | 'In Testing' | 'Archived' | string;
  teamLead: string;
  teamMembers?: string[];
  hardwareSpecs?: { label: string; value: string }[];
  imageUrl?: string;
  storagePath?: string;
  publicId?: string;
  secureUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  eventName: string;
  year: number;
  rankOrAward: string;
  position?: string;
  category: 'National' | 'International' | 'Regional' | 'University' | 'Hackathon' | 'Competition' | 'Workshop' | 'Other';
  description: string;
  prizeDetails?: string;
  teamMembers: string[];
  imageUrl?: string;
  storagePath?: string;
  publicId?: string;
  secureUrl?: string;
  certificateId?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  eventOrWorkshop: string;
  year: number;
  category: 'Competition' | 'Workshop' | 'Lab & R&D' | 'Exhibition' | 'Other';
  caption: string;
  description?: string;
  imageUrl?: string;
  storagePath?: string;
  publicId?: string;
  secureUrl?: string;
  svgType?: 'sumo' | 'soccer' | 'iot' | 'rover' | 'drone' | 'workshop' | 'lab';
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  subsystem: string;
  bio: string;
  yearAndDept?: string;
  skills: string[];
  email?: string;
  linkedin?: string;
  github?: string;
  imageUrl?: string;
  storagePath?: string;
  publicId?: string;
  secureUrl?: string;
  isLead: boolean;
  displayOrder?: number;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Registration {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  schoolOrCollege: string;
  departmentOrClass: string;
  targetType: 'event' | 'workshop';
  targetId: string;
  targetTitle: string;
  teamName?: string;
  teamSize?: number;
  teammateDetails?: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timestamp: string;
  status: 'confirmed' | 'pending' | 'waitlist' | 'archived';
  attendanceRecorded?: boolean;
  attended?: boolean;
  attendance?: 'present' | 'absent' | 'excused' | 'unmarked';
  certificateIssued?: boolean;
  certificateId?: string;
  archivedAt?: string;
  archivedBy?: string;
}

export interface WorkshopEnquiry {
  id: string;
  institutionName: string;
  institutionType: 'School' | 'College' | 'University' | 'Organization';
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  preferredTrack: string;
  estimatedStudents: number;
  preferredDate: string;
  message: string;
  timestamp: string;
}

export interface HomepageStat {
  id: string;
  title: string;
  value: string;
  description: string;
  order?: number;
  updatedAt?: string;
}

export interface BotDocument {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  botOrCompetition?: string;
  status: 'published' | 'draft' | 'archived';
  published?: boolean;
  uploadedAt: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DisciplineItem {
  id: string;
  number: string;
  disciplineNumber?: string;
  title: string;
  description: string;
  iconType: 'cpu' | 'wrench' | 'award';
}

export interface FooterLinkItem {
  id: string;
  label: string;
  targetView: string;
  description?: string;
  externalUrl?: string;
}

export interface FooterAboutConfig {
  id?: string;
  teamName: string;
  shortDescription: string;
  establishedYear: string;
  isEstablishedVerified: boolean;
  subtitle: string;

  // About Page
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  missionTitle: string;
  missionDescription: string;
  missionPoints: string[];
  visionTitle: string;
  visionDescription: string;
  visionPoints: string[];
  disciplines: DisciplineItem[];

  // Footer Specific
  competitionLinks: FooterLinkItem[];
  workshopLinks: FooterLinkItem[];

  // Laboratory Coordinates
  labAddress: string;
  officialEmail: string;
  outreachEmail?: string;
  contactPhone: string;
  workingHours: string;
  visitingNotice: string;

  // Footer Copyright & Actions
  copyrightText: string;
  copyrightYear: string;
  footerLinks: FooterLinkItem[];

  updatedAt?: string;
  updatedBy?: string;
}

export interface ContactItem {
  id: string;
  type: 'address' | 'email' | 'phone' | 'hours' | 'custom';
  label: string;
  value: string;
  subValue?: string;
  link?: string;
  enabled: boolean;
  isPlaceholder?: boolean;
}

export interface ContactPageConfig {
  id?: string;
  badge: string;
  title: string;
  description: string;

  contactItems: ContactItem[];

  showVisitingNotice: boolean;
  visitingNoticeTitle: string;
  visitingNoticeText: string;

  enquirySectionTitle: string;
  enquirySectionDescription: string;
  submitButtonText: string;
  successTitle: string;
  successMessage: string;

  fieldLabels: {
    institutionName: string;
    contactPerson: string;
    institutionCategory: string;
    officialEmail: string;
    contactPhone: string;
    preferredTrack: string;
    targetTimeline: string;
    additionalDetails: string;
  };

  institutionCategories: string[];
  technicalTracks: string[];

  updatedAt?: string;
  updatedBy?: string;
}


