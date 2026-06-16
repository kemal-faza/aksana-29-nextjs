'use client';

import { useState, useRef, DragEvent } from 'react';
import { adminPost } from '@/lib/admin-api';

interface ImageUploadProps {
  entity: 'students' | 'teachers' | 'sambutan' | 'sudut-sekolah';
  entityId: string;
  onSuccess: (canonicalPath: string) => void;
  currentImage?: string | null;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  preview: string | null;
  error: string;
}

export function ImageUpload({ entity, entityId, onSuccess, currentImage }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    preview: null,
    error: '',
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setState((prev) => ({ ...prev, error: 'Hanya file JPG, PNG, atau WebP' }));
      return;
    }

    if (file.size > maxSize) {
      setState((prev) => ({ ...prev, error: 'Maksimal ukuran file 2MB' }));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setState((prev) => ({
        ...prev,
        preview: e.target?.result as string,
        error: '',
        progress: 0,
      }));
    };
    reader.readAsDataURL(file);

    // Start upload
    setState((prev) => ({ ...prev, uploading: true, progress: 0, error: '' }));

    try {
      // 1. Get signed upload URL
      const { url: uploadUrl, path } = await adminPost<{ url: string; path: string }>(
        '/api/admin/images/sign-upload',
        {
          fileName: file.name,
          contentType: file.type,
        }
      );

      setState((prev) => ({ ...prev, progress: 20 }));

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        throw new Error('Gagal upload file');
      }

      setState((prev) => ({ ...prev, progress: 50 }));

      // 3. Process image (generate WebP variants)
      const processResult = await adminPost<{ canonical: string; paths: string[] }>(
        '/api/admin/images/process',
        {
          storagePath: path,
          entity,
          entityId,
        }
      );

      setState((prev) => ({ ...prev, progress: 100 }));
      onSuccess(processResult.canonical);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: err instanceof Error ? err.message : 'Upload gagal',
      }));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Foto</label>

      {/* Preview */}
      {(state.preview || currentImage) && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.preview || currentImage || ''}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {state.uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">Uploading... {state.progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="text-primary font-medium">Klik untuk upload</span> atau drag-drop
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP (max 2MB)</p>
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {state.progress === 100 && !state.error && (
        <p className="text-sm text-green-600">Upload berhasil!</p>
      )}
    </div>
  );
}
