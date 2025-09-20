import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PlayerAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatar({
  name,
  imageUrl,
  size = 'md',
  className
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-lg',
    lg: 'w-32 h-32 text-2xl'
  };

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (imageUrl) {
    return (
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={imageUrl}
          alt={`${name} profile`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white font-bold ${getBackgroundColor(name)}">${getInitials(name)}</div>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-bold',
        sizeClasses[size],
        getBackgroundColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}