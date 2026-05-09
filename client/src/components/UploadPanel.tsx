import { useRef, useState, useCallback } from 'react';
import { formatFileSize } from '../utils/parser';

type ProcessingState = 'idle' | 'reading-pdf' | 'extracting' | 'error';

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  processing: ProcessingState;
  error: string | null;
}

export default function UploadPanel({ files, onFilesChange, onSubmit, processing, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const pdfs = Array.from(incoming).filter((f) => f.type === 'application/pdf');
      if (pdfs.length === 0) return;
      const existing = new Set(files.map((f) => f.name + f.size));
      const next = [...files, ...pdfs.filter((f) => !existing.has(f.name + f.size))];
      onFilesChange(next);
    },
    [files, onFilesChange]
  );

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
    if (next.length === 0 && inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const busy = processing === 'reading-pdf' || processing === 'extracting';

  const processingLabel =
    processing === 'reading-pdf'
      ? 'Reading PDF files…'
      : processing === 'extracting'
      ? 'Extracting with AI…'
      : null;

  return (
    <div className="upload-view" role="main">
      <div className="upload-workspace">
        <h1 className="upload-heading">Upload syllabi</h1>
        <p className="upload-subheading">
          Drop one or more PDF syllabi. Dates, assignments, and exams will be extracted for review.
        </p>

        {/* Drop zone */}
        <div
          className={`drop-zone${dragging ? ' drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload PDF files"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <svg
            className="drop-zone-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="drop-zone-label">
            Drop PDF files here, or <em>browse</em>
          </p>
          <p className="drop-zone-hint">Accepts .pdf · Multiple files supported</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="file-list" role="list" aria-label="Selected files">
            <div className="file-list-header">
              <span className="file-list-label">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onFilesChange([])}
                aria-label="Remove all files"
              >
                Clear all
              </button>
            </div>
            {files.map((file, i) => (
              <div key={file.name + file.size} className="file-item" role="listitem">
                <svg
                  className="file-item-icon"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span className="file-item-name" title={file.name}>
                  {file.name}
                </span>
                <span className="file-item-size">{formatFileSize(file.size)}</span>
                <button
                  className="file-item-remove"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  disabled={busy}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Processing / error banner */}
        {processingLabel && (
          <div className="status-banner status-banner-info" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            {processingLabel}
          </div>
        )}
        {processing === 'error' && error && (
          <div className="status-banner status-banner-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" />
              <line x1="7" y1="4" x2="7" y2="7.5" />
              <circle cx="7" cy="10" r="0.5" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions">
          <button
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={files.length === 0 || busy}
            aria-label={`Process ${files.length} syllab${files.length === 1 ? 'us' : 'i'}`}
          >
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? 'Processing…' : `Process ${files.length > 0 ? `${files.length} ` : ''}syllab${files.length === 1 ? 'us' : 'i'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
