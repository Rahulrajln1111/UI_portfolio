// src/components/admin/TiptapEditor.tsx
"use client";

import * as React from 'react';

// Define the props interface
export interface TiptapWriteupEditorProps {
  initialContent?: string;
  onUpdate?: (markdown: string) => void;
  onEditorReady?: (editor: any) => void;
}

// Stub component: renders nothing but accepts props for TypeScript
const TiptapWriteupEditor: React.FC<TiptapWriteupEditorProps> = ({
  initialContent,
  onUpdate,
  onEditorReady,
}) => {
  // Optional: you could console.log for debug
  React.useEffect(() => {
    if (onEditorReady) onEditorReady(null);
  }, [onEditorReady]);

  React.useEffect(() => {
    if (onUpdate && initialContent) onUpdate(initialContent);
  }, [initialContent, onUpdate]);

  return null; // Stub hides visual editor
};

export default TiptapWriteupEditor;
