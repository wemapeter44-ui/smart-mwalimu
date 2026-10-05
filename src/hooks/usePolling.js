import { useEffect, useRef } from 'react';

/**
 * Calls `callback` every `intervalMs` while enabled.
 * Also fires when the tab regains focus (visibilitychange → visible).
 */
export function usePolling(callback, intervalMs = 15000, enabled = true) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      cbRef.current?.();
    }, intervalMs);

    function onVisible() {
      if (document.visibilityState === 'visible') {
        cbRef.current?.();
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [intervalMs, enabled]);
}