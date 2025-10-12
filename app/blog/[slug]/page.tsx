// app/blog/[slug]/page.tsx

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore'; 
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent'; 
import { db, firebaseConfig } from '@/lib/firebase'; // Adjust path if needed

// 🚀 FIX for Caching: Enable Incremental Static Regeneration (ISR).
// The page will be re-rendered on the server and cached for a maximum of 60 seconds.
export const revalidate = 60; 

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
// This pre-renders pages for known slugs at build time.
export async function generateStaticParams() {
  try {
    const collectionPath = getCollectionPath(firebaseConfig.appId!);
    const q = query(collection(db, collectionPath));
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
    const collectionPath = getCollectionPath(firebaseConfig.appId!);
    const q = query(collection(db, collectionPath), where('slug', '==', slug));
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

// 💥 CORRECTED INTERFACE: Must be a Promise of the params object to satisfy the build type check 
// due to the presence of generateStaticParams.
interface BlogPageProps {
  params: Promise<{ slug: string }>; 
}

export default async function BlogPostPage(props: BlogPageProps) {
    // ✅ REQUIRED: Awaiting props.params to satisfy the Next.js runtime constraint 
    // when using dynamic parameters in async Server Components.
    const { slug } = await props.params; 
    
    const post = await fetchPost(slug);

    if (!post) return notFound();

    return <BlogPostContent post={post} />;
}
