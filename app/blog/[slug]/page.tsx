// app/blog/[slug]/page.tsx

import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getFirestore,
    DocumentData,
    QueryDocumentSnapshot 
} from 'firebase/firestore'; 
import { initializeApp, getApps } from 'firebase/app';
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent'; 

// --- Firebase config ---
const firebaseConfig = {
    apiKey: "AIzaSyA2SeX7yl9C2kG_tdeO3P1Ao_Z-VLYx7D0",
    authDomain: "personal-portfolio-2af66.firebaseapp.com",
    projectId: "personal-portfolio-2af66",
    storageBucket: "personal-portfolio-2af66.firebasestorage.app",
    messagingSenderId: "541477980245",
    appId: "1:541477980245:web:85e411ca53332ab6246cdc",
    measurementId: "G-7P11V44HXR"
};

// Initialize Firebase only once
function getFirebaseApp(name: string) {
    const existingApp = getApps().find(app => app.name === name);
    return existingApp ?? initializeApp(firebaseConfig, name);
}

interface PostData {
    id: string;
    title: string;
    content: string; 
    slug: string;
    tags: string[];
    authorName: string;
    createdAt: Date | null;
}

// Collection path helper
const getCollectionPath = (appId: string) => `/artifacts/${appId}/public/data/blog_posts`;

// --- Generate static paths for SSG ---
export async function generateStaticParams() {
    try {
        const serverApp = getFirebaseApp("nextjs-build-static-params");
        const serverDb = getFirestore(serverApp);

        const collectionPath = getCollectionPath(firebaseConfig.appId);
        const q = query(collection(serverDb, collectionPath));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return [];

        return querySnapshot.docs
            .map((doc: DocumentData) => {
                const slug = doc.data().slug;
                return typeof slug === 'string' && slug ? { slug } : null;
            })
            .filter(Boolean) as { slug: string }[];
    } catch (error) {
        console.error("FIREBASE ERROR during generateStaticParams:", error);
        return [];
    }
}

// --- Fetch a single post ---
async function fetchPost(slug: string): Promise<PostData | null> {
    try {
        const serverApp = getFirebaseApp("nextjs-fetch-single-post");
        const serverDb = getFirestore(serverApp);

        const collectionPath = getCollectionPath(firebaseConfig.appId);
        const q = query(collection(serverDb, collectionPath), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0] as QueryDocumentSnapshot<DocumentData>;
        const data = doc.data();

        return {
            id: doc.id,
            title: data.title || 'Untitled',
            content: data.content || '',
            slug: data.slug || slug,
            tags: data.tags || [],
            authorName: data.authorName || 'Anonymous',
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
        };
    } catch (error) {
        console.error(`Error fetching post with slug ${slug}:`, error);
        return null;
    }
}


interface BlogPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BlogPostPage(props: BlogPageProps) {
    const { slug } = await props.params; 
    const post = await fetchPost(slug);

    if (!post) return notFound();

    return <BlogPostContent post={post} />;
}


