import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc } from 'firebase/firestore';

export async function saveScanRecord(scan: any) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'scans', scan.id);
      await setDoc(docRef, scan);
      console.log('Scan synced to Firestore:', scan.id);
    } catch (e) {
      console.error('Failed to save scan in Firestore, falling back:', e);
    }
  }

  // Dual store to LocalStorage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('leakmap_history') || '[]';
    try {
      const parsed = JSON.parse(raw);
      // Avoid duplicate
      const filtered = parsed.filter((item: any) => item.id !== scan.id);
      localStorage.setItem('leakmap_history', JSON.stringify([scan, ...filtered]));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }
}

export async function saveEvidencePacket(packet: any) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'evidencePackets', packet.id);
      await setDoc(docRef, packet);
      console.log('Evidence packet synced to Firestore:', packet.id);
    } catch (e) {
      console.error('Failed to sync evidence packet to Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`evidence_packet_${packet.id}`, JSON.stringify(packet));
  }
}

export async function getEvidencePacket(id: string) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'evidencePackets', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (e) {
      console.error('Failed to fetch evidence packet from Firestore, trying local:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`evidence_packet_${id}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export async function savePassportRecord(passport: any) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'passports', passport.id);
      await setDoc(docRef, passport);
      console.log('Passport synced to Firestore:', passport.id);
    } catch (e) {
      console.error('Failed to save passport in Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`passport_${passport.id}`, JSON.stringify(passport));
    // Append to list of passports
    const raw = localStorage.getItem('leakmap_passports') || '[]';
    try {
      const parsed = JSON.parse(raw);
      const filtered = parsed.filter((item: any) => item.id !== passport.id);
      localStorage.setItem('leakmap_passports', JSON.stringify([passport, ...filtered]));
    } catch (e) {
      console.error('LocalStorage write error for passports list:', e);
    }
  }
}

export async function getPassportRecord(id: string) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'passports', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (e) {
      console.error('Failed to fetch passport from Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`passport_${id}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export async function getPassportsList() {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, 'passports'));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.error('Failed to fetch passports list from Firestore:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('leakmap_passports') || '[]';
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  return [];
}
