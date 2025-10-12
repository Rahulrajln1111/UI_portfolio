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

// 🚀 FIX for Caching: Enable Incremental Static Regeneration (ISR)
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

// 💥 FIX: Define the props interface correctly for a dynamic route.
// This interface correctly tells TypeScript the structure, allowing the 'await' in the function body.
interface BlogPageProps {
  params: {
    slug: string;
  };
  // The searchParams property is optional for this component, but required by PageProps
  searchParams?: { [key: string]: string | string[] | undefined }; 
}

export default async function BlogPostPage(props: BlogPageProps) {
    // ✅ Retained runtime fix: Awaiting the synchronous object to satisfy Next.js runtime warning/error
    const { slug } = await props.params; 
    
    const post = await fetchPost(slug);

    if (!post) return notFound();

    return <BlogPostContent post={post} />;
}