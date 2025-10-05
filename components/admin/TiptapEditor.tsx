// src/components/admin/TiptapEditor.tsx
"use client";

import * as React from 'react';

// Props interface
export interface TiptapWriteupEditorProps {
  /** Callback called when a markdown file is loaded */
  onFileContentLoad?: (content: string, fileName: string) => void;
}

// Stub component: renders nothing for now
const TiptapWriteupEditor: React.FC<TiptapWriteupEditorProps> = ({ onFileContentLoad }) => {
  // Example: you could trigger this for testing
  // React.useEffect(() => {
  //   if (onFileContentLoad) onFileContentLoad("# Test Markdown", "test.md");
  // }, [onFileContentLoad]);

  return null;
};

export default TiptapWriteupEditor;
