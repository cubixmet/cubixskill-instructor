import { useEffect, useRef } from 'react';

// A stack lets a confirmation dialog open over a sheet without unlocking it.
const overlays: symbol[] = [];
let previousOverflow = '';

export function useOverlay(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const id = Symbol('overlay');
    const trigger = document.activeElement as HTMLElement | null;
    if (overlays.length === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    overlays.push(id);
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (overlays.at(-1) !== id) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const targets = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => {
      cancelAnimationFrame(frame);
      const wasTop = overlays.at(-1) === id;
      const index = overlays.indexOf(id);
      if (index >= 0) overlays.splice(index, 1);
      document.removeEventListener('keydown', handleKey, true);
      if (overlays.length === 0) document.body.style.overflow = previousOverflow;
      if (wasTop && trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);
  return panelRef;
}
