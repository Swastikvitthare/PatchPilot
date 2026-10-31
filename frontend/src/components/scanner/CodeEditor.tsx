"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  height = "500px",
  className,
}: CodeEditorProps) {
  const handleMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border border-gray-800 ${className || ""}`}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-gray-400 text-sm">
              Loading editor...
            </span>
          </div>
        }
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          autoIndent: "full",
          formatOnPaste: true,
          tabSize: 4,
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          contextmenu: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
