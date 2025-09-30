'use client';

import React from 'react';
import MarkdownPreview from '@/components/admin/MarkdownPreview'; // Assuming this is the correct path
import { Calendar, Tag, User } from 'lucide-react'; 

interface PostData {
    id: string;
    title: string;
    content: string; 
    slug: string;
    tags: string[];
    authorName: string;
    createdAt: Date | null;
}

interface BlogPostContentProps {
    post: PostData;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
    
    const formattedDate = post.createdAt?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) || 'N/A';

    return (
        <div className="pt-24 min-h-screen bg-slate-950 text-gray-200">
            <article className="w-[85%] max-w-7xl mx-auto p-4 md:p-8 lg:p-12"> 
                {/* Header Metadata */}
                <header className="mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{post.title}</h1>
                    <div className="flex flex-wrap items-center text-sm text-gray-400 gap-x-4 gap-y-2">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {post.authorName}
                        </span>
                        {post.tags.map((tag, index) => (
                            <span key={index} className="flex items-center px-3 py-1 bg-gray-800 text-indigo-400 rounded-full text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Post Content (Markdown) */}
                <div className="max-w-none text-lg">
                    <MarkdownPreview content={post.content} />
                </div>
            </article>
        </div>
    );
}