'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore'; 
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    Auth, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    setPersistence,             // <-- NEW IMPORT
    browserSessionPersistence    // <-- NEW IMPORT
} from 'firebase/auth'; 

// ----------------------------------------------------
// ⚠️ 1. YOUR FIREBASE CONFIGURATION (REQUIRED)
// Replace these placeholder values with your actual credentials.
const firebaseConfig = {
  apiKey: "AIzaSyA2SeX7yl9C2kG_tdeO3P1Ao_Z-VLYx7D0",
  authDomain: "personal-portfolio-2af66.firebaseapp.com",
  projectId: "personal-portfolio-2af66",
  storageBucket: "personal-portfolio-2af66.firebasestorage.app",
  messagingSenderId: "541477980245",
  appId: "1:541477980245:web:85e411ca53332ab6246cdc",
  measurementId: "G-7P11V44HXR"
};
// ----------------------------------------------------

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

if (typeof window !== 'undefined') {
    if (!firebaseApp) {
        try {
            firebaseApp = initializeApp(firebaseConfig);
            firestoreDb = getFirestore(firebaseApp);
            firebaseAuth = getAuth(firebaseApp);
        } catch (error) {
            console.error("Firebase Initialization Error:", error);
        }
    }
}

interface AuthContextType {
    user: User | null; 
    db: Firestore | null;
    appId: string;
    isAuthReady: boolean;
    signIn: (email: string, password: string) => Promise<void>; 
    signOut: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); 
    const [db, setDb] = useState<Firestore | null>(firestoreDb);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const appId = firebaseConfig.appId;
    
    // --- SIGN IN FUNCTIONALITY (WITH PERSISTENCE FIX) ---
    const signIn = async (email: string, password: string): Promise<void> => {
        if (!firebaseAuth) {
            throw new Error("Firebase Auth service is not available.");
        }
        
        // FIX: Set persistence to session storage to avoid SecurityError in local dev
        await setPersistence(firebaseAuth, browserSessionPersistence);
        
        await signInWithEmailAndPassword(firebaseAuth, email, password);
    };
    
    // --- SIGN OUT FUNCTIONALITY ---
    const signOut = async (): Promise<void> => {
        if (!firebaseAuth) {
            throw new Error("Firebase Auth service is not available.");
        }
        await firebaseSignOut(firebaseAuth);
    };
    // ----------------------------

    useEffect(() => {
        if (!firebaseAuth) {
            setIsAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true); 
            setDb(firestoreDb);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, db, appId, isAuthReady, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};