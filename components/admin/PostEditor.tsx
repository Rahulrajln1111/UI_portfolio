'use client';

import React, { useState } from 'react';
import { Maximize, Minimize, Check, Copy, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PostEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-8' : 'h-full'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-primary flex items-center">
                    <Pencil className="w-6 h-6 mr-2" />
                    Markdown Content Editor
                </h2>
                <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
            </div>
            
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Start typing your structured Markdown content here..."
                // Apply code-editor-like styling
                className={`min-h-[60vh] font-mono p-4 text-base ${isFullScreen ? 'h-[calc(100vh-100px)]' : 'h-[600px]'} resize-none`}
            />
        </div>
    );
}