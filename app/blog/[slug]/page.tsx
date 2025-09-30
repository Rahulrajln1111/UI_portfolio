import { 
    // All Firestore imports merged into one statement
    collection, 
    query, 
    where, 
    getDocs, 
    getFirestore,
    DocumentData,
    QueryDocumentSnapshot 
} from 'firebase/firestore'; 
import { initializeApp } from 'firebase/app';
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent'; 

// ----------------------------------------------------
// ⚠️ FIREBASE CONFIG (REQUIRED for Server/Build)
const firebaseConfig = {
  apiKey: "AIzaSyA2SeX7yl9C2kG_tdeO3P1Ao_Z-VLYx7D0",
  authDomain: "personal-portfolio-2af66.firebaseapp.com",
  projectId: "personal-portfolio-2af66",
  storageBucket: "personal-portfolio-2af66.firebasestorage.app",
  messagingSenderId: "541477980245",
  appId: "1:541477980245:web:85e411ca53332ab6246cdc",
  measurementId: "G-7P11V44HXR"
};
interface PostData {
    id: string;
    title: string;
    content: string; 
    slug: string;
    tags: string[];
    authorName: string;
    createdAt: Date | null;
}

const getCollectionPath = (appId: string) => `/artifacts/${appId}/public/data/blog_posts`;

// 🎯 1. Server Function: generateStaticParams
export async function generateStaticParams() {
    try {
        const serverApp = initializeApp(firebaseConfig, "nextjs-build-static-params"); 
        const serverDb = getFirestore(serverApp);
        
        const collectionPath = getCollectionPath(firebaseConfig.appId);
        const q = query(collection(serverDb, collectionPath));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        // Filter out any documents missing the 'slug' field and ensure the return type is correct
        return querySnapshot.docs.map((doc: DocumentData) => {
            const slug = doc.data().slug;
            if (typeof slug === 'string' && slug) {
                return { slug };
            }
            return null;
        }).filter(p => p !== null) as { slug: string }[]; 

    } catch (error) {
        console.error("FIREBASE ERROR during generateStaticParams:", error);
        // Return an empty array on error to prevent the build process from crashing
        return [];
    }
}

// 🎯 2. Server Function: Fetches data for the specific slug
async function fetchPost(slug: string): Promise<PostData | null> {
    try {
        const serverApp = initializeApp(firebaseConfig, "nextjs-fetch-single-post");
        const serverDb = getFirestore(serverApp);

        const collectionPath = getCollectionPath(firebaseConfig.appId);
        const q = query(
            collection(serverDb, collectionPath),
            where('slug', '==', slug)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

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


// 🎯 3. Default Export (Server Component)
interface BlogPageProps {
    params: {
        slug: string;
    };
}

// 🎯 FIX: Await the 'params' object before using 'params.slug'
export default async function BlogPostPage({ params }: BlogPageProps) {
    
    // Explicitly await params to resolve the Next.js warning
    const awaitedParams = await params;
    
    // Use the awaited object property
    const post = await fetchPost(awaitedParams.slug);

    if (!post) {
        return notFound();
    }

    // Pass the fully fetched data to the Client Component for rendering
    return <BlogPostContent post={post} />;
}