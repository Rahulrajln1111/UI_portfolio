import { redirect } from 'next/navigation';
import NewPostForm from '@/components/admin/NewPostForm'; 

// Ensure the page is always dynamic for safe server-side checks.
export const dynamic = 'force-dynamic';

// --- Shared Interfaces (Must be defined once) ---
interface PostData {
    id?: string;
    title: string;
    slug: string;
    content: string;
    tags: string;
    authorName: string;
    createdAt?: any;
    updatedAt?: any;
}
// ----------------------------------------------------

// NOTE: Placeholder for your server-side data fetching logic
const getBlogPostBySlug = async (slug: string): Promise<PostData | null> => {
    console.log(`[SERVER] Attempting to fetch post with slug: ${slug}`);
    // Replace with actual data fetching (e.g., Firestore Admin SDK)
    return null; 
};

/**
 * 🚨 CRITICAL SECURITY IMPLEMENTATION: Server-side check for admin status.
 * 🛑 WARNING: This MUST be a real check (e.g., verifying a session cookie/token).
 */
async function getAdminSession(): Promise<boolean> {
    // 🛑 TEMPORARY: Returning true to allow the page to load after login.
    return true; 
}


export default async function AdminPage({ 
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // ----------------------------------------------------
    // 🎯 SECURITY CHECK (Server Gate)
    const isAdmin = await getAdminSession();
    
    if (!isAdmin) {
        redirect('/admin-login'); 
    }
    // ----------------------------------------------------
    
    const editParam = searchParams['edit'];
    
    const slugToEdit = typeof editParam === 'string' ? editParam : undefined;
    
    let initialPost: PostData | null = null;
    let isNew = true;

    // Data Fetching Logic (Server-Side)
    if (slugToEdit) {
        try {
            const post = await getBlogPostBySlug(slugToEdit); 
            
            if (post) {
                initialPost = post;
                isNew = false;
            }
        } catch (error) {
            console.error("[SERVER] Error fetching post data in AdminPage:", error);
        }
    }

    // 🚀 Server-side action definition
    const savePostAction = async (postData: PostData) => {
        'use server';

        const isAuth = await getAdminSession();
        if (!isAuth) {
            throw new Error("Unauthorized action attempted. Please log in.");
        }
        
        // 🛑 CRITICAL: ADD YOUR FIRESTORE ADMIN SDK SAVE/UPDATE LOGIC HERE
        try {
            console.log(`[SERVER ACTION] ${isNew ? 'Saving' : 'Updating'} post: ${postData.title}`);
            // Example: await firestoreServer.savePost(postData);

            if (isNew) {
                // Redirect to the edit view of the newly created post
                redirect(`/admin?edit=${postData.slug}`); 
            }
            
        } catch (error) {
            console.error("[SERVER ACTION] Failed to save post:", error);
            throw new Error("Post failed to save to database.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <NewPostForm
                isNew={isNew}
                initialPost={initialPost}
                // 🟢 FIX: The prop passed down is named 'onSaveAction'
                onSaveAction={savePostAction} 
            />
        </div>
    );
}