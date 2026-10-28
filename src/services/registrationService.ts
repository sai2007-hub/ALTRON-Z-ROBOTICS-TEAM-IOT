import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Registration } from '../types';

export interface RegistrationInput {
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
}

export interface SaveRegistrationResult {
  success: boolean;
  regId: string;
  status: string;
  message: string;
}

// In-memory idempotency caches to prevent accidental duplicate submissions
const completedSubmissions = new Map<string, SaveRegistrationResult>();
const inFlightSubmissions = new Map<string, Promise<SaveRegistrationResult>>();

export function getRegistrationIdempotencyKey(input: RegistrationInput): string {
  return `${input.email.trim().toLowerCase()}::${input.targetType}::${input.targetId}::${input.studentName.trim().toLowerCase()}`;
}

export async function saveRegistrationToFirestore(input: RegistrationInput): Promise<SaveRegistrationResult> {
  // Client-side pre-flight validation
  if (!input.studentName || input.studentName.trim().length < 2) {
    throw new Error('Student name must be at least 2 characters.');
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!input.phone || input.phone.trim().length < 5) {
    throw new Error('Please enter a valid contact phone number.');
  }
  if (!input.schoolOrCollege || input.schoolOrCollege.trim().length < 2) {
    throw new Error('Please enter your school or college.');
  }
  if (!input.departmentOrClass || input.departmentOrClass.trim().length < 1) {
    throw new Error('Please enter your class or department.');
  }

  const idempotencyKey = getRegistrationIdempotencyKey(input);

  // 1. If an identical submission was completed in this active session, return the saved record
  const cached = completedSubmissions.get(idempotencyKey);
  if (cached) {
    return cached;
  }

  // 2. If an identical submission is currently in-flight, await the ongoing request
  const ongoing = inFlightSubmissions.get(idempotencyKey);
  if (ongoing) {
    return await ongoing;
  }

  const payload: any = {
    studentName: input.studentName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    schoolOrCollege: input.schoolOrCollege.trim(),
    departmentOrClass: input.departmentOrClass.trim(),
    targetType: input.targetType,
    targetId: input.targetId,
    targetTitle: input.targetTitle.trim(),
    status: 'confirmed',
    createdAt: serverTimestamp(),
  };

  if (input.teamName && input.teamName.trim()) {
    payload.teamName = input.teamName.trim();
  }
  if (input.teamSize && input.teamSize >= 1) {
    payload.teamSize = Number(input.teamSize);
  }
  if (input.teammateDetails && input.teammateDetails.trim()) {
    payload.teammateDetails = input.teammateDetails.trim();
  }
  if (input.experienceLevel) {
    payload.experienceLevel = input.experienceLevel;
  }

  const executeWrite = (async (): Promise<SaveRegistrationResult> => {
    try {
      const colRef = collection(db, 'registrations');
      // Use addDoc: actual document ID returned by the successful Firestore write
      const docRef = await addDoc(colRef, payload);
      const regId = docRef.id;

      const result: SaveRegistrationResult = {
        success: true,
        regId,
        status: 'confirmed',
        message: `Registration confirmed in Firebase Firestore! Official registration reference ID: ${regId}`,
      };

      // Store in completed cache for duplicate prevention
      completedSubmissions.set(idempotencyKey, result);
      return result;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      inFlightSubmissions.delete(idempotencyKey);
    }
  })();

  inFlightSubmissions.set(idempotencyKey, executeWrite);
  return await executeWrite;
}

export async function fetchRegistrationsFromFirestore(): Promise<Registration[]> {
  const collectionPath = 'registrations';
  try {
    const colRef = collection(db, collectionPath);
    const snap = await getDocs(colRef);
    const list: Registration[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      let formattedDate = 'Just now';
      if (data.createdAt instanceof Timestamp) {
        formattedDate = data.createdAt.toDate().toISOString().replace('T', ' ').slice(0, 19);
      } else if (typeof data.createdAt === 'string') {
        formattedDate = data.createdAt;
      }

      list.push({
        id: docSnap.id,
        studentName: data.studentName || 'Unknown Student',
        email: data.email || '',
        phone: data.phone || '',
        schoolOrCollege: data.schoolOrCollege || '',
        departmentOrClass: data.departmentOrClass || '',
        targetType: data.targetType || 'event',
        targetId: data.targetId || '',
        targetTitle: data.targetTitle || '',
        teamName: data.teamName || undefined,
        teamSize: data.teamSize || 1,
        teammateDetails: data.teammateDetails || undefined,
        experienceLevel: data.experienceLevel || 'Intermediate',
        timestamp: formattedDate,
        status: (data.status as 'confirmed' | 'pending' | 'waitlist' | 'archived') || 'confirmed',
        attendanceRecorded: typeof data.attendanceRecorded === 'boolean' ? data.attendanceRecorded : !!data.attendance,
        attended: typeof data.attended === 'boolean' ? data.attended : data.attendance === 'present',
        attendance: data.attendance || (data.attended ? 'present' : undefined),
        certificateIssued: typeof data.certificateIssued === 'boolean' ? data.certificateIssued : !!data.certificateId,
        certificateId: data.certificateId || undefined,
        archivedAt: data.archivedAt || undefined,
        archivedBy: data.archivedBy || undefined,
      });
    });

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function updateRegistrationStatusInFirestore(
  regId: string,
  newStatus: 'confirmed' | 'pending' | 'waitlist' | 'archived'
): Promise<void> {
  const docPath = `registrations/${regId}`;
  try {
    const docRef = doc(db, 'registrations', regId);
    await updateDoc(docRef, { status: newStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function archiveRegistrationInFirestore(
  regId: string,
  isArchived: boolean,
  adminEmail?: string
): Promise<void> {
  const docPath = `registrations/${regId}`;
  try {
    const docRef = doc(db, 'registrations', regId);
    const updates: any = {
      status: isArchived ? 'archived' : 'confirmed',
    };
    if (isArchived) {
      updates.archivedAt = new Date().toISOString();
      if (adminEmail) updates.archivedBy = adminEmail;
    } else {
      updates.archivedAt = '';
      updates.archivedBy = '';
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteRegistrationFromFirestore(regId: string): Promise<void> {
  const docPath = `registrations/${regId}`;
  try {
    const docRef = doc(db, 'registrations', regId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function updateRegistrationAttendanceAndCertInFirestore(
  regId: string,
  updates: {
    attendanceRecorded?: boolean;
    attended?: boolean;
    attendance?: 'present' | 'absent' | 'excused' | 'unmarked';
    certificateIssued?: boolean;
    certificateId?: string;
    status?: 'confirmed' | 'pending' | 'waitlist' | 'archived';
  }
): Promise<void> {
  const docPath = `registrations/${regId}`;
  try {
    const docRef = doc(db, 'registrations', regId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
