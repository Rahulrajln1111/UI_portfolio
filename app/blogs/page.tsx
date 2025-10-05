import React from 'react';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import { 
    collection, 
    query, 
    getDocs, 
    orderBy, 
    getFirestore, 
    DocumentData
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight } from 'lucide-react'; 
import { db, firebaseConfig } from '@/lib/firebase'; // Adjust path if needed

// ----------------------------------------------------
// ----------------------------------------------------

interface Post {
    id: string;
    title: string;
    slug: string;
    summary: string;
    tags: string[];
    createdAt: Date | null;
}

const getCollectionPath = (appId: string) => `/artifacts/${appId}/public/data/blog_posts`;

// Blog List Item (Can remain simple)
const BlogListItem: React.FC<{ post: Post }> = ({ post }) => {
    const formattedDate = post.createdAt?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }) || 'N/A';

    return (
        <Link href={`/blog/${post.slug}`} className="block group">
            <div className="py-8 px-4 border-b border-border hover:bg-muted/50 transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-0 hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </p>
                </div>
                <p className="text-base text-foreground/80 mb-4 line-clamp-2">
                    {post.summary}
                </p>
                <div className="flex flex-wrap justify-between items-center mt-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-secondary rounded-full text-secondary-foreground font-medium flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </span>
                        ))}
                    </div>
                    <span className="text-primary font-semibold flex items-center">
                        Read More 
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </Link>
    );
};


// ASYNCHRONOUS SERVER COMPONENT
export default async function BlogPage() {
    let posts: Post[] = [];

    try {
        const serverApp = initializeApp(firebaseConfig, "server-side-fetch-blog-list"); 
        const serverDb = getFirestore(serverApp);
        
        const path = getCollectionPath(firebaseConfig.appId);
        const postsRef = collection(serverDb, path);
        
        // Order by createdAt. This assumes all posts have the field now.
        const q = query(postsRef, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);

        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                title: data.title,
                slug: data.slug,
                summary: data.summary,
                tags: Array.isArray(data.tags) ? data.tags : [],
                createdAt: data.createdAt ? data.createdAt.toDate() : null,
            });
        });

    } catch (error) {
        console.error("Server-side fetching error (Blog List):", error);
    }

    const renderContent = () => {
        if (posts.length === 0) {
            return (
                <div className="text-center p-12 border border-dashed rounded-lg bg-card/50">
                    <p className="text-xl font-semibold mb-2">No Write-ups Yet</p>
                    <p className="text-muted-foreground">The blog is ready! Publish your first post from the `/admin` page.</p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-border">
                {posts.map(post => (
                    <BlogListItem key={post.id} post={post} />
                ))}
            </div>
        );
    };

    return (
        <div className="pt-24">
            <SectionContainer>
                <PageHeader
                    title="Cyber Writeups"
                    description="A collection of my write-ups covering CTF challenges, CVE analysis, reverse engineering, and offensive security research."
                />

                {renderContent()}
                
            </SectionContainer>
        </div>
    );
}