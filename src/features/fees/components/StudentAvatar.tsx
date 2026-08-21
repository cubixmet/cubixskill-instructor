import React, { useState } from 'react';
import { User } from 'lucide-react';

interface StudentAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  src,
  name = '',
  className = 'w-7 h-7 sm:w-8 sm:h-8',
}) => {
  const [hasError, setHasError] = useState(false);

  // Check if image source exists and is not a default unsplash fallback
  const isValidSrc = Boolean(
    src &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    !src.includes('images.unsplash.com') &&
    !hasError
  );

  return (
    <div
      className={`rounded-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] flex items-center justify-center shrink-0 overflow-hidden text-slate-400 ${className}`}
      title={name}
    >
      {isValidSrc ? (
        <img
          src={src!}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      )}
    </div>
  );
};
