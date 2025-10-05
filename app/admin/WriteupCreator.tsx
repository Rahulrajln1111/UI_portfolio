// app/admin/WriteupCreator.tsx
'use client';

import React, { useState } from 'react';
import TiptapWriteupEditor from '@/components/admin/TiptapEditor';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const MARKDOWN_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-markdown';
const FILENAME_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-filename';

export default function CtfWriteupController() {
  const { toast } = useToast();

  // Load persisted markdown on mount
  const [uploadedMarkdown, setUploadedMarkdown] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
    }
    return null;
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FILENAME_LOCAL_STORAGE_KEY);
    }
    return null;
  });

  // Called when Tiptap editor (stub) loads a file
  const handleFileContentLoad = (content: string, fileName: string) => {
    setUploadedMarkdown(content);
    setUploadedFileName(fileName);

    if (typeof window !== 'undefined') {
      localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, content);
      localStorage.setItem(FILENAME_LOCAL_STORAGE_KEY, fileName);
    }

    toast({
      title: "File Loaded",
      description: `${fileName} loaded successfully.`,
      variant: "default"
    });
  };

  // Save / publish action
  const handleSave = async (isPublish = false) => {
    if (!uploadedMarkdown) {
      toast({
        title: "Error",
        description: "Please upload a .md file before saving.",
        variant: "destructive"
      });
      return;
    }

    // 🔹 Example save logic
    console.log("Saving markdown content:", uploadedMarkdown);

    toast({
      title: "Success",
      description: isPublish ? "Published successfully!" : "Saved successfully!",
      variant: "default"
    });

    // Clear persisted data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
      localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
    }
    setUploadedMarkdown(null);
    setUploadedFileName(null);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#00ff00]">CTF Writeup Creator</h1>
        <div className="space-x-2">
          <Button onClick={() => handleSave(false)}>Save Draft</Button>
          <Button onClick={() => handleSave(true)}>Publish</Button>
        </div>
      </header>

      <div className="flex-1 h-full border border-gray-700 rounded-md p-4 bg-gray-900">
        <TiptapWriteupEditor onFileContentLoad={handleFileContentLoad} />
        {uploadedFileName && (
          <p className="text-gray-300 mt-2 text-sm">Loaded file: {uploadedFileName}</p>
        )}
      </div>
    </div>
  );
}
