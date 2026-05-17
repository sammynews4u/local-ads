'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, FileImage, FileVideo, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  label?: string;
  accept?: 'image' | 'video' | 'both';
  value?: string;
  onUpload: (url: string, fileInfo: { name: string; size: number; type: string }) => void;
  onRemove?: () => void;
  helperText?: string;
  className?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  label,
  accept = 'both',
  value,
  onUpload,
  onRemove,
  helperText,
  className,
  maxSizeMB,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = accept === 'image'
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : accept === 'video'
    ? 'video/mp4,video/webm,video/ogg'
    : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg';

  const handleFile = useCallback(async (file: File) => {
    setError('');

    // Quick client-side validation
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please upload an image or video file');
      return;
    }

    if (accept === 'image' && !isImage) {
      setError('Only image files are allowed');
      return;
    }

    if (accept === 'video' && !isVideo) {
      setError('Only video files are allowed');
      return;
    }

    const maxSize = maxSizeMB
      ? maxSizeMB * 1024 * 1024
      : isImage
      ? 5 * 1024 * 1024
      : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(`File is too large. Max size: ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Show preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setPreview(null);
        return;
      }

      onUpload(data.file.url, {
        name: data.file.name,
        size: data.file.size,
        type: data.file.type,
      });
    } catch {
      setError('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [accept, maxSizeMB, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  // File is uploaded and we have a URL
  const hasFile = !!value;
  const isImageFile = value?.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  const isVideoFile = value?.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {/* If file already uploaded, show preview */}
      {hasFile ? (
        <div className="relative border-2 border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {isImageFile ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
            ) : isVideoFile ? (
              <div className="w-32 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0">
                <video src={value} className="w-full h-full object-cover" muted />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> File uploaded
              </p>
              <p className="text-xs text-green-600 truncate mt-1">{value}</p>
            </div>
            <Button
              type="button" variant="ghost" size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleInputChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center gap-3">
              <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {(accept === 'image' || accept === 'both') && (
                  <FileImage className="h-8 w-8 text-gray-400" />
                )}
                {(accept === 'video' || accept === 'both') && (
                  <FileVideo className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {accept === 'image' && 'JPG, PNG, GIF, WEBP up to 5MB'}
                  {accept === 'video' && 'MP4, WEBM, OGG up to 50MB'}
                  {accept === 'both' && 'Images (5MB max) or Videos (50MB max)'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
