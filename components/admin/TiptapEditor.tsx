// src/components/admin/TiptapEditor.tsx
"use client";

import * as React from 'react';

// Updated props interface to include onFileContentLoad
export interface TiptapWriteupEditorProps {
  initialContent?: string;
  onUpdate?: (markdown: string) => void;
  onEditorReady?: (editor: any) => void;
  onFileContentLoad?: (content: string, fileName: string) => void;
}

// Stub component: accepts all props for TS, does nothing visually
const TiptapWriteupEditor: React.FC<TiptapWriteupEditorProps> = ({
  initialContent,
  onUpdate,
  onEditorReady,
  onFileContentLoad,
}) => {
  React.useEffect(() => {
    if (onEditorReady) onEditorReady(null);
  }, [onEditorReady]);

  React.useEffect(() => {
    if (onUpdate && initialContent) onUpdate(initialContent);
  }, [initialContent, onUpdate]);

  // Optionally call onFileContentLoad for testing/demo
  React.useEffect(() => {
    if (onFileContentLoad && initialContent) {
      onFileContentLoad(initialContent, 'demo.md');
    }
  }, [initialContent, onFileContentLoad]);

  return null; // Stub hides visual editor
};

export default TiptapWriteupEditor;
