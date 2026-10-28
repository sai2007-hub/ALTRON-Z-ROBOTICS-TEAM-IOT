import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FooterAboutConfig, ContactPageConfig } from '../types';
import { initialFooterAboutConfig, initialContactPageConfig } from '../data/initialData';

const SITE_CONTENT_COLLECTION = 'siteContent';
const FOOTER_ABOUT_DOC_ID = 'footerAbout';
const CONTACT_PAGE_DOC_ID = 'contactPage';

const LOCAL_STORAGE_FOOTER_ABOUT_KEY = 'altrons_footer_about_config';
const LOCAL_STORAGE_CONTACT_PAGE_KEY = 'altrons_contact_page_config';

/**
 * Sanitizes object by removing any undefined keys and converting them to null or safe defaults
 * to prevent Firestore "Unsupported field value: undefined" errors.
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// Footer & About Content Service
// ============================================================================

export async function fetchFooterAboutConfig(): Promise<FooterAboutConfig> {
  try {
    const docRef = doc(db, SITE_CONTENT_COLLECTION, FOOTER_ABOUT_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as FooterAboutConfig;
      const merged: FooterAboutConfig = {
        ...initialFooterAboutConfig,
        ...data,
        id: FOOTER_ABOUT_DOC_ID,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_FOOTER_ABOUT_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore storage quota
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch footerAbout from Firestore, checking localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_FOOTER_ABOUT_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...initialFooterAboutConfig, ...parsed, id: FOOTER_ABOUT_DOC_ID };
    }
  } catch (e) {
    // ignore
  }

  return initialFooterAboutConfig;
}

export async function saveFooterAboutConfig(
  config: FooterAboutConfig,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanData: FooterAboutConfig = {
      ...config,
      id: FOOTER_ABOUT_DOC_ID,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || 'admin',
    };

    const sanitized = sanitizeForFirestore(cleanData);
    const docRef = doc(db, SITE_CONTENT_COLLECTION, FOOTER_ABOUT_DOC_ID);
    await setDoc(docRef, sanitized, { merge: true });

    try {
      localStorage.setItem(LOCAL_STORAGE_FOOTER_ABOUT_KEY, JSON.stringify(cleanData));
    } catch (e) {
      // ignore
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save footerAbout to Firestore:', err);
    // Still save to localStorage as fallback so UI updates immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_FOOTER_ABOUT_KEY, JSON.stringify(config));
    } catch (e) {
      // ignore
    }
    return { success: false, error: err.message || 'Failed to persist configuration to Firestore' };
  }
}

// ============================================================================
// Contact Page Content Service
// ============================================================================

export async function fetchContactPageConfig(): Promise<ContactPageConfig> {
  try {
    const docRef = doc(db, SITE_CONTENT_COLLECTION, CONTACT_PAGE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ContactPageConfig;
      const merged: ContactPageConfig = {
        ...initialContactPageConfig,
        ...data,
        id: CONTACT_PAGE_DOC_ID,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_CONTACT_PAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch contactPage from Firestore, checking localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_CONTACT_PAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...initialContactPageConfig, ...parsed, id: CONTACT_PAGE_DOC_ID };
    }
  } catch (e) {
    // ignore
  }

  return initialContactPageConfig;
}

export async function saveContactPageConfig(
  config: ContactPageConfig,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanData: ContactPageConfig = {
      ...config,
      id: CONTACT_PAGE_DOC_ID,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || 'admin',
    };

    const sanitized = sanitizeForFirestore(cleanData);
    const docRef = doc(db, SITE_CONTENT_COLLECTION, CONTACT_PAGE_DOC_ID);
    await setDoc(docRef, sanitized, { merge: true });

    try {
      localStorage.setItem(LOCAL_STORAGE_CONTACT_PAGE_KEY, JSON.stringify(cleanData));
    } catch (e) {
      // ignore
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save contactPage to Firestore:', err);
    try {
      localStorage.setItem(LOCAL_STORAGE_CONTACT_PAGE_KEY, JSON.stringify(config));
    } catch (e) {
      // ignore
    }
    return { success: false, error: err.message || 'Failed to persist configuration to Firestore' };
  }
}
