"use client";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  file: File | null;
}

export default function UploadDropzone({ onFile, file }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-2xl p-10 flex flex-col items-center gap-4 transition-all duration-200 text-center"
      style={{
        border: `2px dashed ${dragging ? "rgba(136,117,214,0.8)" : "rgba(254,254,254,0.12)"}`,
        background: dragging ? "rgba(90,71,177,0.1)" : "rgba(1,1,4,0.4)",
        boxShadow: dragging ? "0 0 30px rgba(90,71,177,0.2)" : "none",
      }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(90,71,177,0.2)" }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(163,154,207,0.8)" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      {file ? (
        <div>
          <p className="text-lavender font-medium text-sm">{file.name}</p>
          <p className="text-muted text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : (
        <div>
          <p className="text-light/70 text-sm">Drop your PDF here</p>
          <p className="text-muted text-xs mt-1">or click to choose file</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleChange} className="hidden" />

      <button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="px-5 py-2 rounded-xl text-xs text-lavender transition-all duration-200 hover:text-light"
        style={{ border: "1px solid rgba(163,154,207,0.3)", background: "rgba(90,71,177,0.15)" }}
      >
        Choose File
      </button>
    </div>
  );
}
