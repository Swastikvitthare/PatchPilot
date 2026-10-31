"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";
import clsx from "clsx";

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  accept?: string;
}

export default function FileUpload({
  onFileContent,
  accept = ".py,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.go,.rs,.rb,.php",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setUploadedFile(file.name);
        onFileContent(content, file.name);
      };
      reader.readAsText(file);
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setUploadedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300",
        isDragging
          ? "border-cyan-400 bg-cyan-400/5"
          : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30",
        uploadedFile && "border-emerald-500/50 bg-emerald-500/5"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {uploadedFile ? (
        <div className="flex items-center justify-center gap-3">
          <File className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-mono">
            {uploadedFile}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload
            className={clsx(
              "w-8 h-8 mx-auto transition-colors",
              isDragging ? "text-cyan-400" : "text-gray-500"
            )}
          />
          <p className="text-sm text-gray-400">
            <span className="text-cyan-400 font-medium">Click to upload</span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-600">
            Supports .py, .js, .ts, .java, .c, .cpp, .go, .rs, .rb, .php
          </p>
        </div>
      )}
    </div>
  );
}
