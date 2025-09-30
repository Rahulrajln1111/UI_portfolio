import NewPostForm from '@/components/admin/NewPostForm';
import { redirect } from 'next/navigation';

// 🟢 FIX 1: Ensure the page is always dynamic to safely read searchParams.
export const dynamic = 'force-dynamic';

// --- Shared Interface ---
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

// NOTE: Placeholder for your server-side data fetching logic
const getBlogPostBySlug = async (slug: string): Promise<PostData | null> => {
    // Replace this with your actual Firestore server query
    console.log(`[SERVER] Attempting to fetch post with slug: ${slug}`);
    return null; 
};
// ------------------------

export default async function AdminPage({ 
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 🟢 FINAL FIX: Access the property of searchParams immediately.
    // The previous error was pointing to the usage of `searchParams.edit` 
    // in the logic flow that led to line 39 (which is the data fetch line).
    const slugToEdit = typeof searchParams.edit === 'string' 
        ? searchParams.edit 
        : undefined;
    
    let initialPost: PostData | null = null;
    let isNew = true;

    // Data Fetching Logic (Server-Side)
    if (slugToEdit) {
        try {
            // Line 39 in your stack trace is here: post is defined using await
            const post = await getBlogPostBySlug(slugToEdit); 
             
            if (post) {
                initialPost = post;
                isNew = false;
            }
        } catch (error) {
            console.error("[SERVER] Error fetching post data in AdminPage:", error);
        }
    }

    // Server-side action passed to the client component
    const onSaveSuccess = async (slug: string) => {
        'use server';

        if (isNew) {
            redirect(`/admin?edit=${slug}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <NewPostForm
                isNew={isNew}
                initialPost={initialPost}
                onSaveSuccess={onSaveSuccess}
            />
        </div>
    );
}