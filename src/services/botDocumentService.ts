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
import { BotDocument } from '../types';
import { getCloudinaryCloudName, getCloudinaryUploadPreset } from './cloudinaryService';

export const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Validates that file is strictly a PDF and within size limit
 */
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No PDF file selected.' };
  }

  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();

  const isPdfMime = mime === 'application/pdf' || mime === 'application/x-pdf';
  const isPdfExt = ext === 'pdf';

  if (!isPdfMime && !isPdfExt) {
    return {
      valid: false,
      error: 'Only PDF documents (.pdf) are permitted for Bot Details.',
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `PDF file size (${sizeMb} MB) exceeds maximum allowed limit of 15 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a PDF to Cloudinary with fallback to Base64 Data URL if unsigned preset is blocked
 */
export async function uploadPdfDocument(
  file: File,
  folder: string = 'bot_documents',
  onProgress?: (progressPercent: number) => void
): Promise<{ pdfUrl: string; publicId: string; fileName: string; fileSize: number }> {
  const validation = validatePdfFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cloudName = getCloudinaryCloudName();
  const uploadPreset = getCloudinaryUploadPreset();
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `altronz/${folder}`);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            resolve({
              pdfUrl: data.secure_url,
              publicId: data.public_id || `bot_doc_${Date.now()}`,
              fileName: file.name,
              fileSize: file.size,
            });
            return;
          }
        } catch {
          // fall through to fallback
        }
      }

      // If Cloudinary preset doesn't support raw or returns error, use local FileReader Base64 fallback
      try {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            pdfUrl: reader.result as string,
            publicId: `bot_doc_local_${Date.now()}`,
            fileName: file.name,
            fileSize: file.size,
          });
        };
        reader.onerror = () => {
          throw new Error('Failed to read PDF document.');
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        throw new Error(`Upload failed: ${err.message}`);
      }
    };

    xhr.onerror = async () => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          pdfUrl: reader.result as string,
          publicId: `bot_doc_net_${Date.now()}`,
          fileName: file.name,
          fileSize: file.size,
        });
      };
      reader.onerror = () => {
        throw new Error('Network error reading PDF document.');
      };
      reader.readAsDataURL(file);
    };

    xhr.send(formData);
  });
}

/**
 * Fetch all Bot Documents from Firestore
 */
export async function fetchBotDocumentsFromFirestore(): Promise<BotDocument[]> {
  try {
    const colRef = collection(db, 'botDocuments');
    const snap = await getDocs(colRef);
    const docs: BotDocument[] = [];
    snap.forEach((d) => {
      const data = d.data();
      docs.push({
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        pdfUrl: data.pdfUrl || '',
        publicId: data.publicId || '',
        fileName: data.fileName || 'document.pdf',
        fileSize: data.fileSize || 0,
        botOrCompetition: data.botOrCompetition || '',
        status: data.status || 'published',
        published: data.published !== false && data.status === 'published',
        uploadedAt: data.uploadedAt || new Date().toISOString().slice(0, 10),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    });
    return docs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'botDocuments');
    return [];
  }
}

/**
 * Save a new Bot Document to Firestore
 */
export async function saveBotDocumentToFirestore(
  docData: Omit<BotDocument, 'id'>
): Promise<BotDocument> {
  const docId = `bot-doc-${Date.now()}`;
  try {
    const ref = doc(db, 'botDocuments', docId);
    const rawPayload: Record<string, any> = {
      title: (docData.title || '').trim(),
      description: (docData.description || '').trim(),
      pdfUrl: docData.pdfUrl || '',
      publicId: docData.publicId || '',
      fileName: docData.fileName || 'document.pdf',
      fileSize: Number(docData.fileSize) || 0,
      botOrCompetition: (docData.botOrCompetition || '').trim(),
      status: docData.status || 'published',
      published: docData.published !== false && docData.status === 'published',
      uploadedAt: docData.uploadedAt || new Date().toISOString().slice(0, 10),
      uploadedBy: docData.uploadedBy || 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Filter out any potential undefined properties
    const payload: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawPayload)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }

    await setDoc(ref, payload);
    return {
      id: docId,
      ...docData,
      botOrCompetition: (docData.botOrCompetition || '').trim(),
      published: docData.status === 'published',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `botDocuments/${docId}`);
    throw error;
  }
}

/**
 * Update an existing Bot Document in Firestore
 */
export async function updateBotDocumentInFirestore(
  id: string,
  updates: Partial<BotDocument>
): Promise<void> {
  try {
    const ref = doc(db, 'botDocuments', id);
    const rawPayload: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.title !== undefined) rawPayload.title = updates.title.trim();
    if (updates.description !== undefined) rawPayload.description = updates.description.trim();
    if (updates.pdfUrl !== undefined) rawPayload.pdfUrl = updates.pdfUrl;
    if (updates.publicId !== undefined) rawPayload.publicId = updates.publicId || '';
    if (updates.fileName !== undefined) rawPayload.fileName = updates.fileName;
    if (updates.fileSize !== undefined) rawPayload.fileSize = Number(updates.fileSize) || 0;
    if (updates.botOrCompetition !== undefined) {
      rawPayload.botOrCompetition = (updates.botOrCompetition || '').trim();
    }
    if (updates.status !== undefined) {
      rawPayload.status = updates.status;
      rawPayload.published = updates.status === 'published';
    }
    if (updates.published !== undefined) {
      rawPayload.published = updates.published;
      if (updates.status === undefined) {
        rawPayload.status = updates.published ? 'published' : 'draft';
      }
    }

    // Filter out any potential undefined properties
    const payload: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawPayload)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }

    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `botDocuments/${id}`);
    throw error;
  }
}

/**
 * Delete a Bot Document from Firestore
 */
export async function deleteBotDocumentFromFirestore(id: string): Promise<void> {
  try {
    const ref = doc(db, 'botDocuments', id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `botDocuments/${id}`);
  }
}
