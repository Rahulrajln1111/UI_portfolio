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
    setPersistence,
    browserSessionPersistence,
} from 'firebase/auth'; 

// ----------------------------------------------------
// ⚠️ 1. YOUR FIREBASE CONFIGURATION (REQUIRED)
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
            
            if (firebaseAuth) {
                setPersistence(firebaseAuth, browserSessionPersistence)
                    .catch(error => console.error("Firebase Init Error: Failed to set persistence:", error));
            }
        } catch (error) {
            console.error("❌ Firebase Initialization Error:", error);
        }
    }
}

interface CustomUser extends User {
    isAdmin?: boolean;
}

interface AuthContextType {
    user: CustomUser | null; 
    db: Firestore | null;
    appId: string;
    isAuthReady: boolean;
    signIn: (email: string, password: string) => Promise<void>; // 🚀 Revert to original signature
    signOut: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function: ADMIN BYPASS LOGIC
const checkAdminStatus = (user: User | null, setUser: React.Dispatch<React.SetStateAction<CustomUser | null>>) => {
    if (user) {
        const isAdmin = true; // ⚠️ ADMIN BYPASS
        
        console.log(`[AuthContext] BYPASS: User ${user.email} isAdmin: ${isAdmin}`);

        setUser({
            ...user,
            isAdmin: isAdmin,
        } as CustomUser); 

    } else {
        setUser(null);
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CustomUser | null>(null); 
    const [db, setDb] = useState<Firestore | null>(firestoreDb);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const appId = firebaseConfig.appId;
    
    // --- SIGN IN FUNCTIONALITY (Updates state directly) ---
    const signIn = async (email: string, password: string): Promise<void> => {
        if (!firebaseAuth) {
            throw new Error("Firebase Auth service is not available.");
        }
        
        console.log(`[AuthContext] Attempting sign-in for: ${email}`);
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        
        // 🚀 CRITICAL FIX: Update state immediately after success
        if (userCredential.user) {
             checkAdminStatus(userCredential.user, setUser); 
        }
        
        console.log(`[AuthContext] Sign-in successful. State updated directly.`);
    };
    
    // --- SIGN OUT FUNCTIONALITY ---
    const signOut = async (): Promise<void> => {
        if (!firebaseAuth) throw new Error("Firebase Auth service is not available.");
        await firebaseSignOut(firebaseAuth);
        setUser(null);
    };

    // Use onAuthStateChanged for initial page load and automatic session checks
    useEffect(() => {
        if (!firebaseAuth) {
            setIsAuthReady(true);
            return;
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
            console.log(`[AuthContext] onAuthStateChanged fired. User present: ${!!currentUser}`);

            if (currentUser) {
                checkAdminStatus(currentUser, setUser); 
                console.log("[AuthContext] Auth Check Complete (Logged In).");
            } else {
                setUser(null);
                console.log("[AuthContext] Auth Check Complete (Logged Out).");
            }
            setIsAuthReady(true); // Always set ready *after* the check is done
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