import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  GalleryItem,
  TeamMember,
  AchievementItem,
  ProjectItem,
  EventItem,
  WorkshopItem,
} from '../types';

export {
  uploadImageToCloudinary,
  validateImageFile,
  createLocalImagePreview,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from './cloudinaryService';
export type { CloudinaryUploadResult, UploadProgressCallback } from './cloudinaryService';

/**
 * Backward-compatibility alias redirecting uploads to Cloudinary without Firebase Storage
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = 'gallery',
  onProgress?: (progressPercent: number) => void
): Promise<{ downloadUrl: string; secureUrl: string; publicId: string; storagePath: string }> {
  const { uploadImageToCloudinary } = await import('./cloudinaryService');
  const result = await uploadImageToCloudinary(file, folder, onProgress);
  return {
    downloadUrl: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    storagePath: `cloudinary://${result.public_id}`,
  };
}

function formatFirestoreTimestamp(ts: any): string {
  if (ts instanceof Timestamp) {
    return ts.toDate().toISOString().replace('T', ' ').slice(0, 19);
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ==========================================
// 1. PHOTO GALLERY CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchGalleryFromFirestore(publishedOnly = false): Promise<GalleryItem[]> {
  const collectionPath = 'gallery';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: GalleryItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const imageUrl = d.secureUrl || d.imageUrl || '';
      const item: GalleryItem = {
        id: docSnap.id,
        title: d.title || 'Untitled Archive',
        eventOrWorkshop: d.eventOrWorkshop || "ALTRON'Z Activities",
        year: Number(d.year) || new Date().getFullYear(),
        category: d.category || 'Competition',
        caption: d.caption || '',
        description: d.description || d.caption || '',
        imageUrl: imageUrl,
        secureUrl: imageUrl,
        publicId: d.publicId || '',
        storagePath: d.storagePath || '',
        svgType: d.svgType || 'sumo',
        published: d.published !== false,
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || item.published) {
        list.push(item);
      }
    });

    // Sort by year descending
    return list.sort((a, b) => b.year - a.year);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createGalleryItemInFirestore(
  item: Omit<GalleryItem, 'id'>
): Promise<GalleryItem> {
  const collectionPath = 'gallery';
  const newId = `gal-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const imageUrl = item.secureUrl || item.imageUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      title: item.title.trim(),
      eventOrWorkshop: item.eventOrWorkshop.trim(),
      year: Number(item.year) || new Date().getFullYear(),
      category: item.category || 'Competition',
      caption: (item.caption || item.description || '').trim(),
      description: (item.description || item.caption || '').trim(),
      imageUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: item.publicId || '',
      storagePath: item.storagePath || '',
      svgType: item.svgType || 'sumo',
      published: item.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...item,
      id: newId,
      imageUrl,
      secureUrl: imageUrl,
      publicId: item.publicId || '',
      published: item.published !== false,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateGalleryItemInFirestore(
  id: string,
  updates: Partial<GalleryItem>
): Promise<void> {
  const docPath = `gallery/${id}`;
  try {
    const docRef = doc(db, 'gallery', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.secureUrl || updates.imageUrl) {
      payload.imageUrl = updates.secureUrl || updates.imageUrl;
      payload.secureUrl = updates.secureUrl || updates.imageUrl;
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteGalleryItemFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `gallery/${id}`;
  try {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 2. TEAM MEMBERS CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchTeamMembersFromFirestore(publishedOnly = false): Promise<TeamMember[]> {
  const collectionPath = 'teamMembers';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: TeamMember[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const imageUrl = d.secureUrl || d.imageUrl || '';
      const member: TeamMember = {
        id: docSnap.id,
        name: d.name || 'Team Member',
        role: d.role || 'Robotics Engineer',
        department: d.department || d.yearAndDept || '',
        subsystem: d.subsystem || 'Embedded & Firmware',
        bio: d.bio || '',
        yearAndDept: d.yearAndDept || d.department || '',
        skills: Array.isArray(d.skills) ? d.skills : [],
        email: d.email || '',
        linkedin: d.linkedin || '',
        github: d.github || '',
        imageUrl: imageUrl,
        secureUrl: imageUrl,
        publicId: d.publicId || '',
        storagePath: d.storagePath || '',
        isLead: !!d.isLead,
        displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 99,
        published: d.published !== false,
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || member.published) {
        list.push(member);
      }
    });

    return list.sort((a, b) => {
      if ((a.displayOrder || 99) !== (b.displayOrder || 99)) {
        return (a.displayOrder || 99) - (b.displayOrder || 99);
      }
      if (a.isLead !== b.isLead) return a.isLead ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createTeamMemberInFirestore(
  member: Omit<TeamMember, 'id'>
): Promise<TeamMember> {
  const collectionPath = 'teamMembers';
  const newId = `tm-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const imageUrl = member.secureUrl || member.imageUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      name: member.name.trim(),
      role: member.role.trim(),
      department: (member.department || member.yearAndDept || '').trim(),
      subsystem: member.subsystem || 'Leadership',
      bio: member.bio.trim(),
      yearAndDept: (member.yearAndDept || member.department || '').trim(),
      skills: member.skills || [],
      email: (member.email || '').trim(),
      linkedin: (member.linkedin || '').trim(),
      github: (member.github || '').trim(),
      imageUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: member.publicId || '',
      storagePath: member.storagePath || '',
      isLead: !!member.isLead,
      displayOrder: Number(member.displayOrder) || 1,
      published: member.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...member,
      id: newId,
      imageUrl,
      secureUrl: imageUrl,
      publicId: member.publicId || '',
      published: member.published !== false,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateTeamMemberInFirestore(
  id: string,
  updates: Partial<TeamMember>
): Promise<void> {
  const docPath = `teamMembers/${id}`;
  try {
    const docRef = doc(db, 'teamMembers', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.secureUrl || updates.imageUrl) {
      payload.imageUrl = updates.secureUrl || updates.imageUrl;
      payload.secureUrl = updates.secureUrl || updates.imageUrl;
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteTeamMemberFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `teamMembers/${id}`;
  try {
    const docRef = doc(db, 'teamMembers', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 3. ACHIEVEMENTS CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchAchievementsFromFirestore(publishedOnly = false): Promise<AchievementItem[]> {
  const collectionPath = 'achievements';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: AchievementItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const imageUrl = d.secureUrl || d.imageUrl || '';
      const item: AchievementItem = {
        id: docSnap.id,
        title: d.title || 'Competition Honor',
        eventName: d.eventName || 'Robotics Championship',
        year: Number(d.year) || new Date().getFullYear(),
        rankOrAward: d.rankOrAward || 'Award Winner',
        position: d.position || d.rankOrAward || 'Winner',
        category: d.category || 'National',
        description: d.description || '',
        prizeDetails: d.prizeDetails || '',
        teamMembers: Array.isArray(d.teamMembers) ? d.teamMembers : [],
        imageUrl: imageUrl,
        secureUrl: imageUrl,
        publicId: d.publicId || '',
        storagePath: d.storagePath || '',
        certificateId: d.certificateId || '',
        published: d.published !== false,
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || item.published) {
        list.push(item);
      }
    });

    return list.sort((a, b) => b.year - a.year);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createAchievementInFirestore(
  ach: Omit<AchievementItem, 'id'>
): Promise<AchievementItem> {
  const collectionPath = 'achievements';
  const newId = `ach-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const imageUrl = ach.secureUrl || ach.imageUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      title: ach.title.trim(),
      eventName: ach.eventName.trim(),
      year: Number(ach.year) || new Date().getFullYear(),
      rankOrAward: ach.rankOrAward.trim(),
      position: (ach.position || ach.rankOrAward).trim(),
      category: ach.category || 'National',
      description: ach.description.trim(),
      prizeDetails: (ach.prizeDetails || '').trim(),
      teamMembers: ach.teamMembers || [],
      imageUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: ach.publicId || '',
      storagePath: ach.storagePath || '',
      certificateId: (ach.certificateId || '').trim(),
      published: ach.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...ach,
      id: newId,
      imageUrl,
      secureUrl: imageUrl,
      publicId: ach.publicId || '',
      published: ach.published !== false,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateAchievementInFirestore(
  id: string,
  updates: Partial<AchievementItem>
): Promise<void> {
  const docPath = `achievements/${id}`;
  try {
    const docRef = doc(db, 'achievements', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.secureUrl || updates.imageUrl) {
      payload.imageUrl = updates.secureUrl || updates.imageUrl;
      payload.secureUrl = updates.secureUrl || updates.imageUrl;
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteAchievementFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `achievements/${id}`;
  try {
    const docRef = doc(db, 'achievements', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 4. R&D PROJECTS CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchProjectsFromFirestore(publishedOnly = false): Promise<ProjectItem[]> {
  const collectionPath = 'projects';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: ProjectItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const imageUrl = d.secureUrl || d.imageUrl || '';
      const item: ProjectItem = {
        id: docSnap.id,
        title: d.title || 'R&D Machine',
        category: d.category || 'Competition Bot',
        summary: d.summary || '',
        description: d.description || '',
        technologies: Array.isArray(d.technologies) ? d.technologies : [],
        status: d.status || 'Active',
        teamLead: d.teamLead || 'Team Lead',
        teamMembers: Array.isArray(d.teamMembers) ? d.teamMembers : [],
        hardwareSpecs: Array.isArray(d.hardwareSpecs) ? d.hardwareSpecs : [],
        imageUrl: imageUrl,
        secureUrl: imageUrl,
        publicId: d.publicId || '',
        storagePath: d.storagePath || '',
        githubUrl: d.githubUrl || '',
        demoUrl: d.demoUrl || '',
        published: d.published !== false,
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || item.published) {
        list.push(item);
      }
    });

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createProjectInFirestore(
  proj: Omit<ProjectItem, 'id'>
): Promise<ProjectItem> {
  const collectionPath = 'projects';
  const newId = `proj-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const imageUrl = proj.secureUrl || proj.imageUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      title: proj.title.trim(),
      category: proj.category || 'Competition Bot',
      summary: proj.summary.trim(),
      description: proj.description.trim(),
      technologies: proj.technologies || [],
      status: proj.status || 'Active',
      teamLead: proj.teamLead.trim(),
      teamMembers: proj.teamMembers || [],
      hardwareSpecs: proj.hardwareSpecs || [],
      imageUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: proj.publicId || '',
      storagePath: proj.storagePath || '',
      githubUrl: (proj.githubUrl || '').trim(),
      demoUrl: (proj.demoUrl || '').trim(),
      published: proj.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...proj,
      id: newId,
      imageUrl,
      secureUrl: imageUrl,
      publicId: proj.publicId || '',
      published: proj.published !== false,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateProjectInFirestore(
  id: string,
  updates: Partial<ProjectItem>
): Promise<void> {
  const docPath = `projects/${id}`;
  try {
    const docRef = doc(db, 'projects', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.secureUrl || updates.imageUrl) {
      payload.imageUrl = updates.secureUrl || updates.imageUrl;
      payload.secureUrl = updates.secureUrl || updates.imageUrl;
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteProjectFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `projects/${id}`;
  try {
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 5. EVENTS CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchEventsFromFirestore(publishedOnly = false): Promise<EventItem[]> {
  const collectionPath = 'events';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: EventItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const posterUrl = d.posterUrl || d.secureUrl || d.imageUrl || '';
      const item: EventItem = {
        id: docSnap.id,
        slug: d.slug || docSnap.id,
        title: d.title || 'Robotics Event',
        category: d.category || 'Combat',
        shortDescription: d.shortDescription || '',
        fullDescription: d.fullDescription || '',
        rules: Array.isArray(d.rules) ? d.rules : [],
        dimensionsAndSpecs: Array.isArray(d.dimensionsAndSpecs) ? d.dimensionsAndSpecs : [],
        date: d.date || 'TBD 2026',
        time: d.time || '10:00 AM',
        venue: d.venue || "ALTRON'Z Lab",
        registrationDeadline: d.registrationDeadline || 'Rolling',
        capacity: Number(d.capacity) || 50,
        registeredCount: Number(d.registeredCount) || 0,
        entryFee: d.entryFee || 'Free',
        teamSize: d.teamSize || '2-4 members',
        status: d.status || (d.published ? 'published' : 'draft'),
        published: d.published !== false && d.status !== 'draft',
        posterUrl: posterUrl,
        secureUrl: posterUrl,
        publicId: d.publicId || '',
        highlights: Array.isArray(d.highlights) ? d.highlights : [],
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || item.status === 'published' || item.published) {
        list.push(item);
      }
    });

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createEventInFirestore(
  evt: Omit<EventItem, 'id' | 'registeredCount'>
): Promise<EventItem> {
  const collectionPath = 'events';
  const newId = evt.slug || `evt-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const posterUrl = evt.posterUrl || evt.secureUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      ...evt,
      posterUrl,
      secureUrl: posterUrl,
      publicId: evt.publicId || '',
      registeredCount: 0,
      published: evt.status === 'published' || evt.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...evt,
      id: newId,
      posterUrl,
      secureUrl: posterUrl,
      publicId: evt.publicId || '',
      registeredCount: 0,
      published: payload.published,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateEventInFirestore(
  id: string,
  updates: Partial<EventItem>
): Promise<void> {
  const docPath = `events/${id}`;
  try {
    const docRef = doc(db, 'events', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.posterUrl || updates.secureUrl) {
      payload.posterUrl = updates.posterUrl || updates.secureUrl;
      payload.secureUrl = updates.posterUrl || updates.secureUrl;
    }
    if (updates.status) {
      payload.published = updates.status === 'published';
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteEventFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `events/${id}`;
  try {
    const docRef = doc(db, 'events', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 6. WORKSHOPS CMS (Cloudinary + Firestore)
// ==========================================

export async function fetchWorkshopsFromFirestore(publishedOnly = false): Promise<WorkshopItem[]> {
  const collectionPath = 'workshops';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: WorkshopItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const imageUrl = d.imageUrl || d.posterUrl || d.secureUrl || '';
      const item: WorkshopItem = {
        id: docSnap.id,
        slug: d.slug || docSnap.id,
        title: d.title || 'Technical Workshop',
        track: d.track || 'Robotics',
        targetAudience: d.targetAudience || 'All',
        duration: d.duration || '2 Days',
        schedule: d.schedule || 'Upcoming',
        venue: d.venue || "ALTRON'Z Lab",
        capacity: Number(d.capacity) || 40,
        registeredCount: Number(d.registeredCount) || 0,
        description: d.description || '',
        modules: Array.isArray(d.modules) ? d.modules : [],
        hardwareProvided: Array.isArray(d.hardwareProvided) ? d.hardwareProvided : [],
        prerequisites: d.prerequisites || 'None',
        status: d.status || (d.published ? 'published' : 'draft'),
        published: d.published !== false && d.status !== 'draft',
        featured: !!d.featured,
        imageUrl: imageUrl,
        posterUrl: imageUrl,
        secureUrl: imageUrl,
        publicId: d.publicId || '',
        createdAt: formatFirestoreTimestamp(d.createdAt),
        updatedAt: formatFirestoreTimestamp(d.updatedAt),
      };

      if (!publishedOnly || item.status === 'published' || item.published) {
        list.push(item);
      }
    });

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createWorkshopInFirestore(
  ws: Omit<WorkshopItem, 'id' | 'registeredCount'>
): Promise<WorkshopItem> {
  const collectionPath = 'workshops';
  const newId = ws.slug || `ws-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  const imageUrl = ws.imageUrl || ws.posterUrl || ws.secureUrl || '';

  try {
    const docRef = doc(db, collectionPath, newId);
    const payload = {
      ...ws,
      imageUrl,
      posterUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: ws.publicId || '',
      registeredCount: 0,
      published: ws.status === 'published' || ws.published !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);

    return {
      ...ws,
      id: newId,
      imageUrl,
      posterUrl: imageUrl,
      secureUrl: imageUrl,
      publicId: ws.publicId || '',
      registeredCount: 0,
      published: payload.published,
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionPath}/${newId}`);
  }
}

export async function updateWorkshopInFirestore(
  id: string,
  updates: Partial<WorkshopItem>
): Promise<void> {
  const docPath = `workshops/${id}`;
  try {
    const docRef = doc(db, 'workshops', id);
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.imageUrl || updates.posterUrl || updates.secureUrl) {
      const img = updates.imageUrl || updates.posterUrl || updates.secureUrl;
      payload.imageUrl = img;
      payload.posterUrl = img;
      payload.secureUrl = img;
    }
    if (updates.status) {
      payload.published = updates.status === 'published';
    }
    delete payload.id;
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteWorkshopFromFirestore(id: string, _storagePathOrPublicId?: string): Promise<void> {
  const docPath = `workshops/${id}`;
  try {
    const docRef = doc(db, 'workshops', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
