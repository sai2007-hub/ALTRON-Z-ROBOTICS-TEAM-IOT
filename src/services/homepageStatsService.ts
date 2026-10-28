import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { HomepageStat } from '../types';

function formatFirestoreTimestamp(ts: any): string {
  if (!ts) return new Date().toISOString().replace('T', ' ').slice(0, 19);
  if (typeof ts?.toDate === 'function') {
    return ts.toDate().toISOString().replace('T', ' ').slice(0, 19);
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const COLLECTION_PATH = 'homepageStats';

/**
 * Fetch all homepage statistics from Firestore sorted by order
 */
export async function fetchHomepageStatsFromFirestore(): Promise<HomepageStat[]> {
  try {
    const colRef = collection(db, COLLECTION_PATH);
    const snap = await getDocs(colRef);
    const list: HomepageStat[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        title: d.title || '',
        value: d.value || '',
        description: d.description || '',
        order: typeof d.order === 'number' ? d.order : 99,
        updatedAt: formatFirestoreTimestamp(d.updatedAt || d.createdAt),
      });
    });

    return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
  }
}

/**
 * Save or update a single homepage statistic in Firestore
 */
export async function saveHomepageStatToFirestore(stat: HomepageStat): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_PATH, stat.id);
    await setDoc(
      docRef,
      {
        title: stat.title.trim(),
        value: stat.value.trim(),
        description: stat.description.trim(),
        order: stat.order ?? 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_PATH}/${stat.id}`);
  }
}

/**
 * Delete a homepage statistic from Firestore
 */
export async function deleteHomepageStatFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_PATH, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_PATH}/${id}`);
  }
}

/**
 * Batch seed or synchronize a list of statistics
 */
export async function syncAllHomepageStatsToFirestore(stats: HomepageStat[]): Promise<void> {
  for (let i = 0; i < stats.length; i++) {
    const item = stats[i];
    await saveHomepageStatToFirestore({
      ...item,
      order: i + 1,
    });
  }
}
