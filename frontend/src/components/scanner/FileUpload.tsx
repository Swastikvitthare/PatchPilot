"use client";
import { useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".py")) {
      alert("Only .py Python files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".py"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold rounded-lg transition-all text-sm"
      >
        <Upload className="w-4 h-4" />
        Upload .py
      </button>
    </>
  );
}
