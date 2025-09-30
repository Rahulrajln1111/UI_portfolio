'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypePrism from 'rehype-prism-plus';
import 'prismjs/themes/prism-tomorrow.css'; 

interface MarkdownPreviewProps {
    content: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw, rehypePrism]} 
            components={{
                // CRITICAL FIX: The custom 'p' component is REMOVED to prevent the illegal <p> wrapping <pre>.
                
                code({ inline, className, children, ...props }) {
                    // ✅ INLINE CODE: Renders the simple inline element.
                    if (inline) {
                        return (
                            <code 
                                className="inline bg-gray-700/70 text-yellow-400 px-1 py-0.5 rounded font-mono text-sm"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    }
                    
                    // 📦 BLOCK CODE: Renders the <pre> block.
                    return (
                        <pre 
                            className={`overflow-x-auto bg-gray-900 rounded-lg p-4 my-4 text-sm font-mono border border-gray-700 ${className || ''}`}
                            {...props}
                        >
                            {children}
                        </pre>
                    );
                },
                
                // Custom tag mappings
                blockquote: ({ children }) => (
                    <blockquote className="my-6 pl-4 border-l-4 border-indigo-500 bg-gray-800/50 p-4 rounded-md italic text-gray-300">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                        {children}
                    </a>
                ),
                h1: ({ children }) => <h1 className="mt-10 mb-6 text-4xl font-extrabold">{children}</h1>,
                h2: ({ children }) => <h2 className="mt-8 mb-5 text-3xl font-bold border-b border-gray-700 pb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-6 mb-4 text-2xl font-semibold">{children}</h3>,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownPreview;