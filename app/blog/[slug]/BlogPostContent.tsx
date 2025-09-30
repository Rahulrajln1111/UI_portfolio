'use client';

import React, { useState, useMemo } from 'react';
import MarkdownRenderer from '@/components/admin/MarkdownPreview';
import { FileText, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; 

// --- Data Interfaces (Unchanged) ---
interface TocItem { id: string; level: number; text: string; }
interface PostSection { id: string; title: string; content: string; type?: string; answer?: string; flagValue?: string; }
interface PostData { id: string; title: string; authorName: string; tags: string[]; createdAt: Date | null; content?: string; sections?: PostSection[]; }
interface BlogPostContentProps { post: PostData; }


// --- TOC Extraction Logic for Legacy Content (Unchanged) ---
const extractToc = (markdown: string): TocItem[] => {
    const lines = markdown.split('\n');
    const toc: TocItem[] = [];
    let counter = 0;

    lines.forEach(line => {
        const match = line.match(/^(#+)\s+(.*)/);

        if (match) {
            counter++;
            const level = match[1].length;
            const text = match[2].trim();

            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');

            toc.push({ id: id, level, text: text });
        }
    });
    return toc;
};

// 🛠️ NEW FIX: Function to sanitize IDs for use in HTML/URLs
const sanitizeId = (id: string) => {
    if (!id) return '';
    // Converts to lowercase, replaces non-alphanumeric/hyphen/space with hyphen,
    // collapses multiple hyphens, and removes leading/trailing hyphens.
    return id.toLowerCase()
             .replace(/[^a-z0-9\s-]/g, '-')
             .trim()
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-')
             .replace(/^-|-$/g, '');
};


// 🛠️ ENHANCEMENT: Function to handle smooth scrolling to target ID
const handleScrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${id}`);
    }
};


// --- Main Component ---
export default function BlogPostContent({ post }: BlogPostContentProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const authorName = post.authorName || 'Anonymous Hacker';
    const dateDisplay = post.createdAt ? post.createdAt.toLocaleDateString() : 'N/A';

    const sectionsToRender: PostSection[] = post.sections || [];

    // Legacy TOC logic remains to support older posts
    const legacyToc = useMemo(() => {
        return sectionsToRender.length === 0 && post.content
            ? extractToc(post.content)
            : [];
    }, [post.content, sectionsToRender.length]);


    return (
        <div className="flex min-h-screen w-full bg-gray-950 text-white font-mono antialiased">

            {/* 🟢 1. Sidebar (TOC) */}
            <aside
                className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'
                } overflow-hidden border-r-4 border-[#00ff00] bg-gray-900 sticky top-0 h-screen shadow-lg`}
            >
                <div className="h-full overflow-y-auto p-6 space-y-8">
                     <header className="flex items-center justify-between pb-3 border-b-2 border-[#00ff00]">
                         <h1 className="text-xl font-bold text-[#00ff00] flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            {post.title}
                        </h1>
                    </header>

                    {/* Metadata (unchanged) */}
                    <section className="space-y-2 text-sm text-gray-400 p-3 border border-gray-700 rounded-md bg-gray-800/50">
                        <p className="flex justify-between">
                            <strong className="text-[#00ff00]">Author:</strong>
                            <span className="text-gray-300">{authorName}</span>
                        </p>
                        <p className="flex justify-between">
                            <strong className="text-[#00ff00]">Date:</strong>
                            <span className="text-gray-300">{dateDisplay}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {post.tags.map(tag => <span key={tag} className="text-xs text-[#00ff00] border border-[#00ff00] px-1 rounded">{tag}</span>)}
                        </div>
                    </section>

                    {/* Table of Contents (TOC) - Links point to element IDs */}
                    <section className="space-y-3 pt-4">
                        <h2 className="text-sm font-bold uppercase text-[#00ff00] border-b border-gray-700 pb-1 flex items-center">
                            <Menu className="w-4 h-4 mr-2" />
                            Contents
                        </h2>
                        <ul className="text-gray-300 text-sm space-y-1">
                            {/* Structured Sections Links */}
                            {sectionsToRender.length > 0 ? sectionsToRender.map((section, index) => {
                                // 💡 USE SANITIZED ID HERE
                                const safeId = sanitizeId(section.id);
                                const targetId = `section-${safeId}-heading`;

                                return (
                                    <li key={section.id}>
                                        {/* Link points to the generated heading ID */}
                                        <a
                                            href={`#${targetId}`}
                                            onClick={(e) => handleScrollToId(e, targetId)} // Applied smooth scroll handler
                                            className="hover:text-[#00ff00] transition-colors block whitespace-nowrap overflow-hidden text-ellipsis"
                                        >
                                            {index + 1}. {section.title}
                                        </a>
                                    </li>
                                );
                            }) :
                            /* Legacy Content Heading Links */
                            legacyToc.length > 0 ? legacyToc.map((item) => (
                                <li key={item.id} style={{ marginLeft: `${(item.level - 1) * 10}px` }}>
                                    {/* Link points to the H tag ID generated by rehype-slug */}
                                    <a
                                        href={`#${item.id}`}
                                        onClick={(e) => handleScrollToId(e, item.id)} // Applied smooth scroll handler
                                        className="hover:text-[#00ff00] transition-colors block whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            )) : (
                                <li className="text-gray-500 italic">No structured content found.</li>
                            )}
                        </ul>
                    </section>
                </div>
            </aside>

            {/* 🟢 2. Main Content Area */}
            {/* The main content area must be the scrollable container. */}
            <div className="flex-1 flex flex-col overflow-y-auto relative"> 

                {/* Toggle Button (unchanged) */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-20 p-2 rounded-r-lg bg-[#00ff00] text-gray-900 hover:bg-green-400 transition-colors focus:outline-none z-20 shadow-xl"
                    style={{ left: isSidebarOpen ? '320px' : '0' }}
                >
                    {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>

                <main className="flex-1 p-10 pb-20 w-full bg-gray-950">
                    <div className="max-w-4xl mx-auto">

                        <header className="mb-10 pb-4 border-b-4 border-[#00ff00]">
                             <h1 className="text-5xl font-extrabold text-[#00ff00] mb-2">{post.title}</h1>
                             <p className="text-lg text-gray-400">By {authorName}</p>
                        </header>

                        {/* 🚀 CRITICAL CONTENT LOGIC: Render sections directly or fallback */}
                        {sectionsToRender.length > 0 ? (
                            // --- OPTION 1: RENDER SECTIONS DIRECTLY ---
                            <div>
                                {sectionsToRender.map((section, index) => {
                                    // 💡 USE SANITIZED ID HERE
                                    const safeId = sanitizeId(section.id);
                                    const targetId = `section-${safeId}-heading`;

                                    return (
                                        <div key={section.id} className="mb-10 border-b border-gray-700/50 pb-6">

                                            {/* Green Title Heading - SCROLL TARGET. ID uses sanitized ID. */}
                                            <h2
                                                id={targetId}
                                                className="text-3xl font-bold border-b-2 border-[#00ff00] pb-1 mt-8 mb-4 text-[#00ff00] scroll-mt-24"
                                            >
                                                {index + 1}. {section.title}
                                            </h2>

                                            {/* Content */}
                                            <div className="p-0 pt-0">
                                                <MarkdownRenderer
                                                    content={section.content}
                                                    className="prose prose-invert lg:prose-lg max-w-full mt-4"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : post.content ? (
                            // --- OPTION 2: RENDER OLD SINGLE CONTENT FIELD (Legacy Fallback) ---
                            <MarkdownRenderer
                                content={post.content}
                                className="prose prose-invert lg:prose-xl max-w-full"
                            />
                        ) : (
                            // --- OPTION 3: NO CONTENT ---
                            <p className="text-gray-500 italic">No content found for this post.</p>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}