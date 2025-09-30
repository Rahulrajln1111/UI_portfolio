'use server';

import { redirect } from 'next/navigation';

/**
 * 🛑 IMPORTANT: Replace this with your actual secure server-side authentication check 
 * (e.g., verifying a session cookie or token). For demonstration, it returns true.
 */
async function getAdminSession(): Promise<boolean> {
    return true; 
}

/**
 * Server Action to perform an authorized redirection after a new post is saved.
 */
export async function onSaveAction(postSlug: string): Promise<void> {
    const isAuth = await getAdminSession();
    if (!isAuth) {
        throw new Error("Unauthorized action attempted. Please log in.");
    }
    
    // Triggers the Next.js redirect signal
    redirect(`/admin?edit=${postSlug}`); 
};