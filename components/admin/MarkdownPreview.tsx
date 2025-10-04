'use client';

import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus'; 
import rehypeSlug from 'rehype-slug'; 
import 'prismjs/themes/prism-tomorrow.css'; 
import { ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; 

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Custom component for rendering code blocks (Block and Inline)
const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const { toast } = useToast(); 
    
    // Ref to target the <code> DOM element for reliable text extraction
    const codeRef = useRef<HTMLElement>(null); 
    
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    const handleCopy = () => {
        let codeToCopy = '';

        // Extract text directly from the rendered DOM element using the ref
        if (codeRef.current) {
            codeToCopy = codeRef.current.textContent || '';
        }
        
        // Final cleanup
        codeToCopy = codeToCopy.replace(/\n$/, '');


        if (codeToCopy.length === 0) {
             toast({ 
                title: "Copy Failed", 
                description: "The content to copy was empty.", 
                variant: "destructive" 
            });
             return;
        }

        navigator.clipboard.writeText(codeToCopy)
            .then(() => toast({ 
                title: "Copied!", 
                description: `Code block (${language}) copied to clipboard.`, 
                variant: "default" 
            }))
            .catch(() => {
                 toast({ title: "Error", description: `Failed to copy code.`, variant: "destructive" });
            });
    };

    // BLOCK CODE LOGIC
    if (!inline && match) {
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
                {/* REF APPLIED HERE */}
                <pre className="p-4 text-sm overflow-x-auto font-mono">
                    <code ref={codeRef} className={className} {...props}>
                        {children}
                    </code>
                </pre>
            </div>
        );
    }

    // INLINE CODE LOGIC
    return (
        <code ref={codeRef} className="px-1 py-0.5 bg-gray-700/70 rounded-sm text-[#00ff00] text-sm font-mono font-semibold" {...props}>
            {children}
        </code>
    );
};


// HYDRATION FIX: Custom Paragraph Component
const CustomParagraph = ({ children, node }: any) => {
    const hasBlockContent = node.children.some((child: any) => {
        if (child.type !== 'element') {
            return false;
        }
        const blockTags = ['pre', 'div', 'table', 'blockquote', 'ul', 'ol', 'h1', 'h2', 'h3', 'hr'];
        return blockTags.includes(child.tagName);
    });

    if (hasBlockContent) {
        return <>{children}</>; 
    }
    
    return <p>{children}</p>;
};


export default function MarkdownRenderer({ content, className = 'prose prose-invert max-w-none' }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, rehypePrism, rehypeSlug]} 
                components={{
                    // Use the robust custom paragraph component
                    p: CustomParagraph, 
                    // Use the fixed CodeBlock component for all code
                    code: CodeBlock, 
                    
                    // 🔥 FIX: Custom Ordered List (ol) for nested indentation
                    ol: ({ children, ...props }) => (
                        <ol className="list-decimal pl-6 my-4" {...props}>
                            {children}
                        </ol>
                    ),
                    // 🔥 FIX: Custom Unordered List (ul) for nested indentation
                    ul: ({ children, ...props }) => (
                        <ul className="list-disc pl-6 my-4" {...props}>
                            {children}
                        </ul>
                    ),

                    // Headings with CTF style
                    h2: ({ children }) => <h2 className="text-3xl font-bold border-b-2 border-[#00ff00] pb-1 mt-8 mb-4 text-[#00ff00] scroll-mt-24">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3 text-white scroll-mt-24">{children}</h3>,
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