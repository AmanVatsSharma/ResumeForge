import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { DiffEditor as MonacoDiffEditor } from 'monaco-editor';

interface DiffEditorProps {
  original: string;
  modified: string;
  height?: string;
  readOnly?: boolean;
  onModifiedChange?: (value: string) => void;
}

// Set up Monaco environment
if (typeof window !== 'undefined') {
  // Configure Monaco editor
  monaco.editor.defineTheme('diffTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'diffEditor.insertedTextBackground': '#c3e88d30',
      'diffEditor.removedTextBackground': '#ff9cac30',
      'editor.lineHighlightBackground': '#0000000a',
    },
  });
}

export function DiffEditor({
  original,
  modified,
  height = '400px',
  readOnly = false,
  onModifiedChange,
}: DiffEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoDiffEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor instance
    const editor = monaco.editor.createDiffEditor(containerRef.current, {
      automaticLayout: true,
      readOnly,
      fontSize: 14,
      lineHeight: 21,
      minimap: {
        enabled: false,
      },
      renderSideBySide: false,
      theme: 'diffTheme',
      wordWrap: 'on',
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      scrollBeyondLastLine: false,
      renderOverviewRuler: false,
      overviewRulerBorder: false,
      contextmenu: false,
      fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });

    // Set initial models
    editor.setModel({
      original: monaco.editor.createModel(original, 'text/plain'),
      modified: monaco.editor.createModel(modified, 'text/plain'),
    });

    // Add change listener if needed
    if (!readOnly && onModifiedChange) {
      const modifiedEditor = editor.getModifiedEditor();
      modifiedEditor.onDidChangeModelContent(() => {
        onModifiedChange(modifiedEditor.getValue());
      });
    }

    editorRef.current = editor;

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Update content when props change
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.original.setValue(original);
        model.modified.setValue(modified);
      }
    }
  }, [original, modified]);

  return <div ref={containerRef} style={{ height, width: '100%' }} />;
} 