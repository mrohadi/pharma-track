'use client';

import { useRef, useState } from 'react';

type Props = {
  orderId: string;
  required: boolean;
  onUploaded: (key: string) => void;
};

export function PodPhotoInput({ orderId, required, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5 MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // 1. Get presigned URL
      const res = await fetch('/api/pod-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, contentType: file.type }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to get upload URL');
      }
      const { uploadUrl, key } = (await res.json()) as { uploadUrl: string; key: string };

      // 2. Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      // 3. Show preview + notify parent
      setPreview(URL.createObjectURL(file));
      onUploaded(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600">
        Proof of delivery photo{required ? ' *' : ' (optional)'}
      </label>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="POD preview"
            className="h-24 w-24 rounded border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUploaded('');
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
          >
            x
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Take / select photo'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
