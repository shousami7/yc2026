"use client";

import { useRef, useState, useCallback } from "react";

interface UploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export default function Upload({ onUpload, isLoading }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) return;
    setFileName(file.name);
    onUpload(file);
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [onUpload]
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload Floor Plan
        </h1>
        <p className="text-sm text-white/40">
          PNG · JPG · PDF — AI extracts walls, rooms, doors, windows
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "relative border rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4",
          "h-64",
          dragging
            ? "border-blue-400 bg-blue-400/5"
            : "border-white/10 hover:border-white/20 bg-white/[0.02]",
          isLoading ? "pointer-events-none" : "",
        ].join(" ")}
      >
        {isLoading ? (
          <Extracting fileName={fileName} />
        ) : (
          <Idle dragging={dragging} />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

function Idle({ dragging }: { dragging: boolean }) {
  return (
    <>
      <div
        className={[
          "w-12 h-12 rounded-xl border flex items-center justify-center transition-colors",
          dragging ? "border-blue-400 text-blue-400" : "border-white/20 text-white/30",
        ].join(" ")}
      >
        <UploadIcon />
      </div>
      <div className="text-center">
        <p className="text-sm text-white/60">
          {dragging ? "Drop to upload" : "Drop file here or click to browse"}
        </p>
      </div>
    </>
  );
}

function Extracting({ fileName }: { fileName: string | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm text-white/60">Extracting layout…</p>
        {fileName && (
          <p className="text-xs text-white/30 truncate max-w-xs">{fileName}</p>
        )}
      </div>
      <div className="text-xs text-white/20 space-y-0.5 text-center">
        <p>detecting walls · rooms · doors · windows</p>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
