"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface DiffViewerProps {
  original: string;
  patched: string;
}

export default function DiffViewer({ original, patched }: DiffViewerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Original */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm text-gray-400 font-semibold">Original (Vulnerable)</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-red-500/20 bg-gray-900">
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400 font-mono">
            — before patch
          </div>
          <Editor
            height="300px"
            language="python"
            value={original || "# No original code snippet"}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              padding: { top: 8, bottom: 8 },
              scrollbar: { verticalScrollbarSize: 4 },
            }}
            loading={<div className="h-72 flex items-center justify-center"><Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /></div>}
          />
        </div>
      </div>

      {/* Patched */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-gray-400 font-semibold">Patched (Secure)</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-gray-900">
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-400 font-mono">
            + after patch
          </div>
          <Editor
            height="300px"
            language="python"
            value={patched || "# No patched code"}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              padding: { top: 8, bottom: 8 },
              scrollbar: { verticalScrollbarSize: 4 },
            }}
            loading={<div className="h-72 flex items-center justify-center"><Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /></div>}
          />
        </div>
      </div>
    </div>
  );
}
