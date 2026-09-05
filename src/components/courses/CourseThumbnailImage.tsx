import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { resolveMediaUrl, type MediaLike } from '../../utils/media.utils';

export interface CourseThumbnailImageProps {
  src?: MediaLike;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  iconClassName?: string;
}

export const CourseThumbnailImage: React.FC<CourseThumbnailImageProps> = ({
  src,
  alt = 'Course thumbnail',
  className = 'w-full h-full object-cover',
  placeholderClassName = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50 to-sky-100 dark:from-[#172033] dark:to-[#1E293B] text-blue-600 dark:text-[#60A5FA]',
  iconClassName = 'w-8 h-8',
}) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const resolvedUrl = resolveMediaUrl(src);

  // Reset error state when image source URL changes
  useEffect(() => {
    setImageFailed(false);
  }, [resolvedUrl]);

  if (!resolvedUrl || imageFailed) {
    return (
      <div className={placeholderClassName}>
        <BookOpen className={iconClassName} />
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
