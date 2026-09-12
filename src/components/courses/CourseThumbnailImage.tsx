import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { resolveMediaUrl, type MediaLike } from '../../utils/media.utils';

export interface CourseThumbnailImageProps {
  src?: MediaLike;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  iconClassName?: string;
  initials?: string;
}

export const CourseThumbnailImage: React.FC<CourseThumbnailImageProps> = ({
  src,
  alt = 'Course thumbnail',
  className = 'w-full h-full object-cover',
  placeholderClassName = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold',
  iconClassName = 'w-5 h-5',
  initials,
}) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const resolvedUrl = resolveMediaUrl(src);

  // Reset error state when image source URL changes
  useEffect(() => {
    setImageFailed(false);
  }, [resolvedUrl]);

  if (!resolvedUrl || imageFailed) {
    return (
      <div className={placeholderClassName} aria-label={alt}>
        {initials ? (
          <span className="text-sm font-semibold tracking-wider uppercase select-none">{initials}</span>
        ) : (
          <BookOpen className={iconClassName} />
        )}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      onError={() => setImageFailed(true)}
      className={className}
    />
  );
};

export default CourseThumbnailImage;
