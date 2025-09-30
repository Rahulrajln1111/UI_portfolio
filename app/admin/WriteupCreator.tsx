'use client';

import React, { useState, useEffect } from 'react';
// Assuming you use TiptapWriteupEditor as the uploader UI
import TiptapWriteupEditor from '@/components/admin/TiptapEditor'; 
// ... (Other imports like Firebase, useRouter, lucide-react, hooks)

// Define persistent local storage keys
const MARKDOWN_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-markdown';
const FILENAME_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-filename';

// ... (useFirebaseSetup hook remains the same)

export default function CtfWriteupController() {
    // ... (Hooks and setup calls: useWriteUp, useFirebaseSetup, useToast, useRouter)
    // ...
    
    // 🟢 CRITICAL FIX: Initialize state from localStorage to survive the redirect/remount
    const [uploadedMarkdown, setUploadedMarkdown] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const content = localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
            return content; // If null, returns null. If content exists, returns content.
        }
        return null;
    });
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const name = localStorage.getItem(FILENAME_LOCAL_STORAGE_KEY);
            return name;
        }
        return null;
    });

    // 🟢 NEW FUNCTION: Callback received from TiptapWriteupEditor on successful file load
    const handleFileContentLoad = (content: string, fileName: string) => {
        console.log(`DEBUG: WriteupCreator: Received ${content.length} bytes from TiptapEditor. PERSISTING to localStorage.`);
        
        setUploadedMarkdown(content);
        setUploadedFileName(fileName);
        
        // 🟢 ACTION: Save to local storage immediately, GUARANTEEING persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, content);
            localStorage.setItem(FILENAME_LOCAL_STORAGE_KEY, fileName);
        }
    };

    // FUNCTION: Handles the save/publish logic
    const handleSave = async (isPublish = false) => {
        // 🔴 CRITICAL CHECK: This check now relies on persisted data
        if (!uploadedMarkdown) { 
            toast({ title: "Error", description: "Please upload a .md file before saving.", variant: "destructive" });
            return;
        }

        // ... (Remaining setup and save logic using uploadedMarkdown) ...

        // CLEANUP: Clear local storage after successful save, before the redirect.
        if (typeof window !== 'undefined') {
            localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
        }
        
        // ... (Toast success message)
    };
    
    // --- Main Component Render ---
    return (
        <div className="flex flex-col h-full w-full"> 
             {/* ... Header/SaveButtons JSX which uses uploadedMarkdown status ... */}
             
             <div className="flex-1 h-full">
                {/* 🟢 PASS THE HANDLER: This links the uploader to the state manager */}
                <TiptapWriteupEditor 
                    onFileContentLoad={handleFileContentLoad} 
                />
             </div>
        </div>
    );
}