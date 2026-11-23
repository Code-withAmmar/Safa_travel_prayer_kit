import { useState } from 'react';

interface SafaImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function SafaImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: SafaImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--safa-surface-alt)] text-[var(--safa-ink-muted)] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="font-arabic text-3xl text-[#C5A15B] mb-2" dir="rtl">
          صفا
        </span>
        <span className="text-xs tracking-wide">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
