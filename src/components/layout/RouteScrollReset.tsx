import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteScrollResetProps {
  scrollContainerSelector?: string;
}

export const RouteScrollReset: React.FC<RouteScrollResetProps> = ({
  scrollContainerSelector = 'main',
}) => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Reset container scroll if present
    if (scrollContainerSelector) {
      const container = document.querySelector(scrollContainerSelector);
      if (container) {
        container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }
  }, [pathname, search, scrollContainerSelector]);

  return null;
};
