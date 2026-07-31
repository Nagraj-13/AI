"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react";

interface UploadedFileItem {
  file: File;
  status: "pending" | "uploading" | "parsing" | "completed" | "error";
  progress: number;
  extractedText?: string;
  error?: string;
}

interface ResumeUploaderProps {
  jobId: string;
  onScreeningCompleted: () => void;
}

export default function ResumeUploader({ jobId, onScreeningCompleted }: ResumeUploaderProps) {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScreeningActive, setIsScreeningActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newItems: UploadedFileItem[] = Array.from(selectedFiles).map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newItems]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processAndScreenAll = async () => {
    if (files.length === 0) return;
    setIsScreeningActive(true);

    for (let i = 0; i < files.length; i++) {
      const item = files[i];

      // Step 1: Upload & Extract Raw Text
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading", progress: 30 } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("jobId", jobId);

        const uploadRes = await fetch("/api/resumes/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || "Failed to parse document text.");
        }

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "parsing", progress: 70 } : f))
        );

        // Retrieve active user session for candidateId association
        let candidateId: string | undefined = undefined;
        try {
          const stored = localStorage.getItem("user_session");
          if (stored) {
            const session = JSON.parse(stored);
            if (session.role === "CANDIDATE") {
              candidateId = session.id;
            }
          }
        } catch {}

        // Step 2: Trigger AI Evaluation Pipeline
        const screenRes = await fetch("/api/screen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            rawText: uploadData.data.rawText,
            fileName: uploadData.data.fileName,
            fileType: uploadData.data.fileType,
            candidateId,
          }),
        });

        const screenData = await screenRes.json();
        if (!screenRes.ok || !screenData.success) {
          throw new Error(screenData.error || "AI evaluation failed.");
        }

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "completed", progress: 100 } : f))
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: err.message || "Processing error" } : f
          )
        );
      }
    }

    setIsScreeningActive(false);
    onScreeningCompleted();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Upload Candidate Resumes</span>
          </h3>
          <p className="text-xs text-slate-400">Supported formats: PDF, DOCX (Batch upload up to 20 files)</p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
            : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-200">
          <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop candidate resumes
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF, DOCX, or Word documents</p>
      </div>

      {/* Queue List */}
      {files.length > 0 && (
        <div className="mt-5 space-y-2 max-h-56 overflow-y-auto pr-1">
          {files.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center space-x-3 truncate">
                <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="font-medium text-slate-200 truncate">{item.file.name}</span>
                <span className="text-[10px] text-slate-500">({(item.file.size / 1024).toFixed(0)} KB)</span>
              </div>

              <div className="flex items-center space-x-3">
                {item.status === "pending" && (
                  <span className="text-slate-400 font-mono">Ready</span>
                )}
                {(item.status === "uploading" || item.status === "parsing") && (
                  <span className="flex items-center space-x-1.5 text-indigo-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{item.status === "uploading" ? "Extracting..." : "Evaluating..."}</span>
                  </span>
                )}
                {item.status === "completed" && (
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evaluated</span>
                  </span>
                )}
                {item.status === "error" && (
                  <span className="flex items-center space-x-1 text-rose-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error</span>
                  </span>
                )}

                {!isScreeningActive && item.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start AI Screening Button */}
      {files.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={processAndScreenAll}
            disabled={isScreeningActive || files.every((f) => f.status === "completed")}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isScreeningActive ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini AI Screening Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Screening Pipeline ({files.filter((f) => f.status === "pending").length})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
