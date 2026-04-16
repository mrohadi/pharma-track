'use client';

import { useState } from 'react';

/**
 * A link that lazily fetches a presigned S3 URL on click and opens
 * the photo in a new tab. Avoids pre-generating signed URLs for
 * every row on page load.
 */
export function PodPhotoLink({ photoKey }: { photoKey: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pod-view?key=${encodeURIComponent(photoKey)}`);
      if (!res.ok) return;
      const { url } = (await res.json()) as { url: string };
      window.open(url, '_blank', 'noopener');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-blue-600 hover:underline disabled:opacity-50"
    >
      {loading ? 'Loading…' : 'View photo'}
    </button>
  );
}
