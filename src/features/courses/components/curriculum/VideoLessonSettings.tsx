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
export const extractYouTubeVideoId = (url: string): string => {
  if (!url) return '';
  const cleanUrl = url.trim();

  // Raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return ytMatch[1];
  }

  const genericMatch = cleanUrl.match(/(?:v=|v\/|vi\/|embed\/)([a-zA-Z0-9_-]{11})/i);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return '';
};

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

  const youtubeId = extractYouTubeVideoId(targetUrl);
  if (youtubeId || lowerTarget.includes('youtube.com') || lowerTarget.includes('youtu.be')) {
    return {
      provider: 'YouTube',
      videoId: youtubeId,
      embedUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : targetUrl,
    };
  }

  if (lowerTarget.includes('vimeo.com')) {
    const vimeoMatch = targetUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    const videoId = vimeoMatch ? vimeoMatch[1] : '';
    return {
      provider: 'Vimeo',
      videoId,
      embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : targetUrl,
    };
  }

  if (lowerTarget.includes('wistia.')) {
    return {
      provider: 'Wistia',
      videoId: '',
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
