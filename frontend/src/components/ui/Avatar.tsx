import React, { useState } from 'react';
import { cn, getInitials } from '../../lib/utils';

export interface AvatarProps {
  src?: string;
  name?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, email, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = getInitials(name, email);

  // Generate consistent pseudo-random hue from name
  const stringForHash = name || email || 'user';
  let hash = 0;
  for (let i = 0; i < stringForHash.length; i++) {
    hash = stringForHash.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [
    'from-indigo-600 to-indigo-800',
    'from-purple-600 to-purple-800',
    'from-blue-600 to-cyan-800',
    'from-emerald-600 to-teal-800',
    'from-rose-600 to-pink-800',
    'from-amber-600 to-orange-800',
  ];
  const bgGradient = hues[Math.abs(hash) % hues.length];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-sm ring-1 ring-white/10 shrink-0 select-none',
        sizes[size],
        bgGradient,
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || email || 'Avatar'}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
