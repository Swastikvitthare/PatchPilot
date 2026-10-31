"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface DiffViewerProps {
  originalCode: string;
  patchedCode: string;
  language?: string;
  height?: string;
}

export default function DiffViewer({
  originalCode,
  patchedCode,
  language = "python",
  height = "500px",
}: DiffViewerProps) {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (_editor, monaco) => {
    editorRef.current = monaco;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Original */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <h3 className="text-sm font-semibold text-red-400">Original Code</h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-red-900/30">
          <Editor
            height={height}
            language={language}
            value={originalCode}
            theme="vs-dark"
            loading={
              <div className="flex items-center justify-center h-full bg-gray-900">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            }
            onMount={handleMount}
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              renderLineHighlight: "none",
              padding: { top: 12, bottom: 12 },
              contextmenu: false,
            }}
          />
        </div>
      </div>

      {/* Patched */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
          <h3 className="text-sm font-semibold text-emerald-400">
            Patched Code
          </h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-emerald-900/30">
          <Editor
            height={height}
            language={language}
            value={patchedCode}
            theme="vs-dark"
            loading={
              <div className="flex items-center justify-center h-full bg-gray-900">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            }
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              renderLineHighlight: "none",
              padding: { top: 12, bottom: 12 },
              contextmenu: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
