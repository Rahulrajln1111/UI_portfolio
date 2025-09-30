'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus'; 
import rehypeSlug from 'rehype-slug'; // Necessary for creating heading IDs
import 'prismjs/themes/prism-tomorrow.css'; 
import { ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; 

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Custom component for rendering code blocks (Block and Inline)
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    // 🛠️ FIX: Toast setup
    const { toast } = useToast(); 
    
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    const handleCopy = () => {
        // 🛠️ FIX: Convert children array/nodes safely to a string for copying (resolves [object Object])
        const codeContentArray = React.Children.toArray(children);
        // This flattens the React nodes to their text content
        let codeToCopy = codeContentArray.map(child => {
            // Check if the child is a string, otherwise convert it
            return typeof child === 'string' ? child : '';
        }).join('');
        
        // Remove trailing newline
        codeToCopy = codeToCopy.replace(/\n$/, '');
        
        navigator.clipboard.writeText(codeToCopy)
            .then(() => toast({ title: "Copied!", description: `Code block (${language}) copied.`, variant: "default" }))
            .catch(() => toast({ title: "Error", description: "Failed to copy code.", variant: "destructive" }));
    };

    // 📦 BLOCK CODE: Renders a block-level <div>
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
                {/* The pre tag is the block element causing nesting issues */}
                <pre className="p-4 text-sm overflow-x-auto font-mono">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            </div>
        );
    }

    // ✅ INLINE CODE
    return (
        <code className="px-1 py-0.5 bg-gray-700/70 rounded-sm text-[#00ff00] text-sm font-mono font-semibold" {...props}>
            {children}
        </code>
    );
};


// 🛠️ FINAL FIX: Custom Paragraph Component to skip the <p> wrapper if it contains ANY block element
const CustomParagraph = ({ children, node }: any) => {
    
    // Check the raw AST nodes for block-level tags that ReactMarkdown might nest inside <p>.
    const hasBlockContent = node.children.some((child: any) => {
        // We only care about element nodes
        if (child.type !== 'element') {
            return false;
        }

        // List of tags that MUST NOT be inside <p> (including the problematic 'pre', 'div')
        const blockTags = ['pre', 'div', 'table', 'blockquote', 'ul', 'ol', 'h1', 'h2', 'h3', 'hr'];
        
        // If the tag name is in the illegal list, return true
        if (blockTags.includes(child.tagName)) {
            return true;
        }

        return false;
    });

    if (hasBlockContent) {
        // If a block element is detected, return a Fragment to avoid the illegal <p> wrapper.
        // This resolves the hydration errors.
        return <>{children}</>; 
    }
    
    // Default rendering: return a standard paragraph.
    return <p>{children}</p>;
};


export default function MarkdownRenderer({ content, className = 'prose prose-invert max-w-none' }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, rehypePrism, rehypeSlug]} 
                components={{
                    // 🛠️ FIX: Use the robust custom paragraph component
                    p: CustomParagraph, 
                    // Use the fixed CodeBlock component for all code
                    code: CodeBlock, 
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