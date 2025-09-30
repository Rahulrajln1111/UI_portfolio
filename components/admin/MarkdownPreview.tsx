'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
// Add rehype-prism-plus if you want code syntax highlighting
import rehypePrism from 'rehype-prism-plus'; 
// You should have a theme imported in your global CSS or here:
import 'prismjs/themes/prism-tomorrow.css'; 
import { ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; 

interface MarkdownRendererProps {
    /** The raw markdown string content to be rendered. */
    content: string;
    /** Optional Tailwind CSS class to apply to the top-level container (e.g., 'prose-xl'). */
    className?: string;
}

// Custom component for rendering code blocks (Block and Inline)
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const { toast } = useToast(); 
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    const handleCopy = () => {
        const codeToCopy = String(children).replace(/\n$/, '');
        navigator.clipboard.writeText(codeToCopy)
            .then(() => toast({ title: "Copied!", description: `Code block (${language}) copied.`, variant: "default" }))
            .catch(() => toast({ title: "Error", description: "Failed to copy code.", variant: "destructive" }));
    };

    // 📦 BLOCK CODE FIX: Renders <pre> wrapper with nested <code>
    if (!inline) {
        return (
            <div className="my-4 rounded-md bg-gray-900 relative group border border-gray-700 shadow-xl">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700/50">
                    <span className="text-xs text-gray-400 font-sans">{language}</span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={handleCopy} 
                        aria-label="Copy code"
                    >
                        <ClipboardCopy size={14} />
                    </Button>
                </div>
                {/* Ensure code tag is inside pre for prism-plus */}
                <pre className="p-4 text-sm overflow-x-auto font-mono">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            </div>
        );
    }
    
    // ✅ INLINE CODE FIX: Renders correct inline code with CTF styling
    return (
        <code className="px-1 py-0.5 bg-gray-700/70 rounded-sm text-[#00ff00] text-sm font-mono font-semibold" {...props}>
            {children}
        </code>
    );
};


export default function MarkdownRenderer({ content, className = 'prose prose-invert max-w-none' }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]} // Essential for parsing tables, task lists, and other standard markdown features
                rehypePlugins={[rehypeRaw, rehypePrism]} // rehypeRaw allows custom HTML, rehypePrism handles syntax highlighting
                components={{
                    // Use the fixed CodeBlock component for all code
                    code: CodeBlock, 
                    // Headings with CTF style
                    h2: ({ children }) => <h2 className="text-3xl font-bold border-b-2 border-[#00ff00] pb-1 mt-8 mb-4 text-[#00ff00]">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3 text-white">{children}</h3>,
                    // Blockquotes for hints/quotes
                    blockquote: ({ children }) => (
                        <blockquote className="my-6 pl-4 border-l-4 border-[#00ff00] bg-gray-800/50 p-4 rounded-md italic text-gray-300">
                            {children}
                        </blockquote>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00ff00] hover:text-green-400 underline underline-offset-4">
                            {children}
                        </a>
                    ),
                    // Tables (optional styling)
                    table: ({ children }) => (
                        <table className="table-auto w-full border border-gray-700 my-4 text-sm">
                            {children}
                        </table>
                    ),
                    th: ({ children }) => (
                        <th className="p-2 border-b-2 border-[#00ff00] bg-gray-800/70 text-[#00ff00] font-bold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="p-2 border border-gray-700 align-top">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}