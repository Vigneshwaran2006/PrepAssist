'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api/resume';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const ACCEPTED = '.pdf,.docx,.doc';
const MAX_SIZE = 10 * 1024 * 1024;

export default function UploadCard(): React.JSX.Element {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (selected: File): void => {
    const ext = selected.name.toLowerCase().slice(selected.name.lastIndexOf('.'));
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error('File size must be under 10 MB');
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ''));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    if (isUploading) return;
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await resumeApi.upload(file, title.trim() || undefined);
      const resumeId = res.data.data?.resume.id;
      toast.success('Resume uploaded! Analysis started.');
      if (resumeId) {
        router.push(`/dashboard/resumes/${resumeId}`);
      } else {
        router.push('/dashboard/resumes');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Upload failed';
      toast.error(msg);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { if (isUploading) return; e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isUploading ? 'cursor-not-allowed opacity-60 border-gray-300' :
            isDragging ? 'border-blue-500 bg-blue-50 cursor-pointer' :
            'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 cursor-pointer'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={onInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {file ? (
          <div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <p className="text-gray-900 font-medium mb-1">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline mt-3"
              >
                Change file
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">Drop your resume here or click to browse</p>
            <p className="text-sm text-gray-500">PDF or DOCX • Max 10 MB</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Backend Engineer Resume"
            disabled={isUploading}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {file && (
        <div className="mt-6">
          <Button size="lg" fullWidth loading={isUploading} onClick={handleUpload}>
            Upload & Analyze Resume
          </Button>
        </div>
      )}
    </div>
  );
}