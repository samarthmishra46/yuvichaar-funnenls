'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as tus from 'tus-js-client';

interface VideoUploaderProps {
  onUploadComplete: (data: { videoId: string; streamUrl: string }) => void;
  className?: string;
}

export default function VideoUploader({ onUploadComplete, className = '' }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const uploadRef = useRef<tus.Upload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setProgress(0);
      setError('');
    }
  };

  const startUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    setError('');

    try {
      // Step 1: Create video on Bunny
      const createRes = await fetch('/api/bunny/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: file.name.replace(/\.[^/.]+$/, '') }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create video');
      }

      const { videoId, libraryId, authSignature, authExpire, streamUrl } = await createRes.json();

      // Step 2: Upload via TUS
      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: authSignature,
          AuthorizationExpire: String(authExpire),
          VideoId: videoId,
          LibraryId: String(libraryId),
        },
        metadata: {
          filetype: file.type,
          title: file.name.replace(/\.[^/.]+$/, ''),
        },
        onError: (err) => {
          console.error('TUS upload error:', err);
          setStatus('error');
          setError('Upload failed. Please try again.');
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = Math.round((bytesUploaded / bytesTotal) * 100);
          setProgress(pct);
        },
        onSuccess: () => {
          setStatus('success');
          setProgress(100);
          onUploadComplete({ videoId, streamUrl });
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setError('Something went wrong');
    }
  };

  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File selector */}
      {status !== 'uploading' && status !== 'success' && (
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.15)] text-[#94a3b8] text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.25)] transition-all">
          <Upload className="w-5 h-5 shrink-0" />
          <span>{file ? file.name : 'Choose a video file'}</span>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Upload button */}
      {file && status === 'idle' && (
        <button
          onClick={startUpload}
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9333ea] to-[#e91e8c] text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-all"
        >
          Upload Video
        </button>
      )}

      {/* Progress bar */}
      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Uploading {file?.name}…</span>
            <div className="flex items-center gap-2">
              <span className="text-[#f472b6] font-semibold">{progress}%</span>
              <button onClick={cancelUpload} className="p-1 rounded hover:bg-white/10 text-[#64748b] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9333ea] to-[#e91e8c] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] text-[#4ade80] text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Video uploaded successfully!</span>
          <button onClick={cancelUpload} className="ml-auto text-[#64748b] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#f87171] text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={cancelUpload} className="ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
