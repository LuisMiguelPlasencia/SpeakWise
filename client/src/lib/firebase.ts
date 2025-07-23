import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Save pitch analysis to Firestore
export async function savePitchAnalysis(analysis: any) {
  try {
    const docRef = await addDoc(collection(db, "pitchAnalyses"), {
      ...analysis,
      savedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    throw error;
  }
}

// Get all pitch analyses from Firestore
export async function getPitchAnalyses() {
  try {
    const querySnapshot = await getDocs(collection(db, "pitchAnalyses"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching from Firebase:", error);
    throw error;
  }
}
