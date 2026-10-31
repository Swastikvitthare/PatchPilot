'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  ScanLine,
  FileCode,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { ScanResult } from '@/types';
import { scanCode, scanFile } from '@/lib/api';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-cyber-card rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-cyber-accent" size={32} />
    </div>
  ),
});

const DEMO_CODE = `import sqlite3
import pickle
import os
import hashlib
import yaml
import random

# Database credentials
DB_PASSWORD = "super_secret_123"
API_KEY = "sk-proj-ABC123XYZ789"
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"

def get_user(username):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    return cursor.fetchone()

def process_input(user_data):
    result = eval(user_data)
    return result

def run_command(cmd):
    os.system(cmd)

def load_config(data):
    return yaml.load(data)

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

def generate_token():
    return random.randint(100000, 999999)

def handle_request(request):
    try:
        data = pickle.loads(request.body)
        process_input(data)
    except:
        pass
`;

interface ScannerViewProps {
  onScanComplete: (result: ScanResult, code: string) => void;
}

export default function ScannerView({ onScanComplete }: ScannerViewProps) {
  const [code, setCode] = useState<string>('');
  const [filename, setFilename] = useState<string>('untitled.py');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter or upload code to scan.');
      return;
    }
    setError(null);
    setScanning(true);
    try {
      const result = await scanCode(code, 'python', filename);
      onScanComplete(result, code);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Scan failed. Is the backend running?';
      setError(message);
    } finally {
      setScanning(false);
    }
  }, [code, filename, onScanComplete]);

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    const text = await file.text();
    setCode(text);
    setFilename(file.name);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const loadDemo = useCallback(() => {
    setCode(DEMO_CODE);
    setFilename('vulnerable_app.py');
    setError(null);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ScanLine className="text-cyber-accent" size={32} />
          Security Scanner
        </h1>
        <p className="text-cyber-muted mt-2">
          Paste your Python code or upload a file to scan for security vulnerabilities.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-card border border-cyber-border">
          <FileCode size={16} className="text-cyber-accent" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-transparent text-sm text-cyber-text outline-none w-48"
            placeholder="filename.py"
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-card border border-cyber-border
            text-cyber-text hover:border-cyber-accent/50 transition-colors text-sm"
        >
          <Upload size={16} />
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".py,.js,.ts,.jsx,.tsx,.java,.rb,.php"
          onChange={handleFileInput}
          className="hidden"
        />

        <button
          onClick={loadDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30
            text-cyber-accent hover:bg-cyber-accent/20 transition-colors text-sm"
        >
          <AlertTriangle size={16} />
          Load Vulnerable Demo
        </button>

        <div className="flex-1" />

        <button
          onClick={handleScan}
          disabled={scanning || !code.trim()}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all
            ${
              scanning || !code.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-cyber-accent text-cyber-bg hover:bg-cyber-accent/90 glow-accent'
            }`}
        >
          {scanning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <ScanLine size={18} />
              Scan Code
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400">
          <AlertTriangle size={18} />
          <span className="flex-1 text-sm">{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        className={`rounded-xl border-2 transition-colors overflow-hidden ${
          dragOver
            ? 'border-cyber-accent bg-cyber-accent/5'
            : 'border-cyber-border'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyber-bg/80 z-10">
            <div className="text-center">
              <Upload size={48} className="text-cyber-accent mx-auto mb-2" />
              <p className="text-cyber-accent font-medium">Drop file to upload</p>
            </div>
          </div>
        )}

        <MonacoEditor
          height="500px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between mt-4 text-xs text-cyber-muted">
        <span>{code.split('\n').length} lines · {code.length} characters</span>
        <span>Scanners: SQL Injection · Credentials · Unsafe Eval · Python Security</span>
      </div>
    </div>
  );
}
