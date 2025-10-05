'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import TiptapWriteupEditor from '@/components/admin/TiptapEditor';

const MARKDOWN_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-markdown';
const FILENAME_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-filename';

export default function CtfWriteupController() {
    const { toast } = useToast(); // ✅ Fix: initialize toast

    const [uploadedMarkdown, setUploadedMarkdown] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
        return null;
    });
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem(FILENAME_LOCAL_STORAGE_KEY);
        return null;
    });

    const handleFileContentLoad = (content: string, fileName: string) => {
        setUploadedMarkdown(content);
        setUploadedFileName(fileName);
        if (typeof window !== 'undefined') {
            localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, content);
            localStorage.setItem(FILENAME_LOCAL_STORAGE_KEY, fileName);
        }
    };

    const handleSave = async (isPublish = false) => {
        if (!uploadedMarkdown) { 
            toast({ title: "Error", description: "Please upload a .md file before saving.", variant: "destructive" });
            return;
        }

        // ... save logic here ...

        if (typeof window !== 'undefined') {
            localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
        }

        toast({ title: "Success", description: "Writeup saved!", variant: "default" });
    };

    return (
        <div className="flex flex-col h-full w-full">
            <TiptapWriteupEditor onFileContentLoad={handleFileContentLoad} />
            <button onClick={() => handleSave(true)}>Save & Publish</button>
        </div>
    );
}
