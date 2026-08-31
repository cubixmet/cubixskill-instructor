import React from 'react';
import type { CourseLesson } from '../../../../types/curriculum.types';
import { SingleLessonEditor } from './SingleLessonEditor';

interface VideoLessonSettingsProps {
  lesson: CourseLesson;
  moduleTitle?: string;
  onSaveLesson: (updated: Partial<CourseLesson>) => void;
  onCancel?: () => void;
  onChangeModule?: () => void;
  isCreateMode?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const parseEmbedVideoUrl = (url: string) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const lowerUrl = cleanUrl.toLowerCase();

  // NEVER iframe local media files, uploaded paths, or direct video extensions
  if (
    lowerUrl.includes('/media/') ||
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.webm') ||
    lowerUrl.includes('.m3u8') ||
    lowerUrl.includes('.mov') ||
    lowerUrl.includes('.ogg') ||
    lowerUrl.includes('localhost:8000') ||
    lowerUrl.includes('127.0.0.1:8000')
  ) {
    return null;
  }

  const iframeSrcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
  const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : cleanUrl;
  const lowerTarget = targetUrl.toLowerCase();

  if (lowerTarget.includes('youtube.com') || lowerTarget.includes('youtu.be')) {
    let videoId = '';
    const ytMatch = targetUrl.match(/(?:embed\/|v=|v\/|vi\/|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) videoId = ytMatch[1];
    return {
      provider: 'YouTube',
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : targetUrl,
    };
  }

  if (lowerTarget.includes('vimeo.com')) {
    const vimeoMatch = targetUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    const videoId = vimeoMatch ? vimeoMatch[1] : '';
    return {
      provider: 'Vimeo',
      embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : targetUrl,
    };
  }

  if (lowerTarget.includes('wistia.')) {
    return {
      provider: 'Wistia',
      embedUrl: targetUrl,
    };
  }

  return null;
};

export const VideoLessonSettings: React.FC<VideoLessonSettingsProps> = ({
  lesson,
  moduleTitle,
  onSaveLesson,
  onCancel,
  isCreateMode = true,
}) => {
  return (
    <SingleLessonEditor
      type="video"
      moduleTitle={moduleTitle}
      onSaveLesson={onSaveLesson}
      onCancel={onCancel}
      lesson={lesson}
      isCreateMode={isCreateMode}
    />
  );
};
