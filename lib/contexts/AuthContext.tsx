"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export interface ClientProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: ClientProfile | null;
  loginWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profileData: ClientProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to race a promise against a timeout
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
};

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  const fetchProfile = async (uid: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "users", uid);
      // Timeout getDoc after 3 seconds, falling back to null
      const docSnap = await withTimeout(getDoc(docRef), 3000, null);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data() as ClientProfile;
        setProfile(data);
        if (typeof window !== "undefined") {
          localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
        }
      } else {
        // Fallback to local storage cache if it exists
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(`profile_${uid}`);
          if (cached) {
            setProfile(JSON.parse(cached));
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(`profile_${uid}`);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch (e) {
            console.error("Failed to parse cached profile", e);
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Authentication is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment.");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Authentication is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment.");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Authentication is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Authentication is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment.");
    await signOut(auth);
  };

  const saveProfile = async (profileData: ClientProfile) => {
    if (!user) throw new Error("No authenticated user found.");
    
    const updatedProfile = {
      ...profileData,
      email: user.email || profileData.email,
      updatedAt: new Date().toISOString(),
    };

    // Save locally first so the UI can proceed immediately
    setProfile(updatedProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));
    }

    if (db) {
      try {
        const docRef = doc(db, "users", user.uid);
        // Try to save to Firestore, but timeout after 3 seconds and do not throw error if it fails/times out
        await withTimeout(
          setDoc(docRef, updatedProfile, { merge: true }),
          3000,
          undefined
        );
      } catch (error) {
        console.warn("Failed to sync profile to Firestore (offline or connection issue). Saved locally.", error);
      }
    }
  };

  const refreshProfile = async () => {
    if (user && db) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        loginWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
