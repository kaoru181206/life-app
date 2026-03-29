import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "~/lib/firebase";
import type { UserProfile } from "~/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setProfile({
        uid: data.uid,
        displayName: data.displayName,
        email: data.email,
        level: data.level ?? 1,
        totalExp: data.totalExp ?? 0,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        photoURL: data.photoURL,
      });
    }
  };

  const createUserProfile = async (user: User, displayName: string) => {
    const docRef = doc(db, "users", user.uid);
    const newProfile: Omit<UserProfile, "createdAt"> & { createdAt: unknown } = {
      uid: user.uid,
      displayName,
      email: user.email ?? "",
      level: 1,
      totalExp: 0,
      photoURL: user.photoURL ?? undefined,
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, newProfile);
    setProfile({ ...newProfile, createdAt: new Date() } as UserProfile);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserProfile(result.user, displayName);
    return result.user;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const docRef = doc(db, "users", result.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await createUserProfile(
        result.user,
        result.user.displayName ?? "ユーザー"
      );
    } else {
      await loadUserProfile(result.user.uid);
    }
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  return {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    refreshProfile,
  };
}