'use client'; // 🛑 BUILD FIX: Must be the very first line

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import NewPostForm from '@/components/admin/NewPostForm'; 
import { onSaveAction } from './actions'; 


// --- Interface Assumption (Matches auth-context.tsx) ---
interface AuthUser { 
    isAdmin?: boolean; 
}
interface AuthContext {
    user: AuthUser | null;
    isAuthReady: boolean; 
}
// ----------------------------------------------------

/**
 * Component that renders the actual Admin Editor form.
 */
function AdminDashboardContent({ onSaveAction }: { onSaveAction: (slug: string) => Promise<void> }) {
    // FIX: Using URLSearchParams to correctly read client-side query parameters
    const editParam = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('edit');
    const isNew = !editParam;

    return (
        <div className="min-h-screen w-full bg-gray-950 text-white">
            <NewPostForm 
                isNew={isNew}
                initialPost={null} 
                onSaveAction={onSaveAction} 
            /> 
        </div>
    );
}
// ----------------------------------------------------


export default function AdminPage() {
    const { user, isAuthReady } = useAuth() as AuthContext;
    const router = useRouter();

    const isAuthenticatedAdmin = user && user.isAdmin;
    const targetPath = '/admin-login';
    
    useEffect(() => {
        // Redirection logic (Client-side Guard)
        if (isAuthReady && !isAuthenticatedAdmin) {
            console.log('[AdminPage] Not authenticated. Redirecting to login.');
            router.replace(targetPath);
        }
    }, [isAuthReady, isAuthenticatedAdmin, router]);

    
    // --- Rendering Logic ---

    if (!isAuthReady) {
        return (
            <div className="flex justify-center items-center h-screen text-[#00ff00] text-lg">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> 
                Verifying admin status...
            </div>
        );
    }

    if (!isAuthenticatedAdmin) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500 text-lg">
                Access Denied. Redirecting...
            </div>
        );
    }

    // Pass the imported Server Action
    return <AdminDashboardContent onSaveAction={onSaveAction} />;
}