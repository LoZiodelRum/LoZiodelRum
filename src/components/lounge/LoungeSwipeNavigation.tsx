import { useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook: swipe orizzontale mobile (< 980px) per navigazione lounge.
 *
 * Restituisce { onTouchStart, onTouchEnd } da spreaddare sul wrapper della pagina.
 *
 * Soglia minima: 60px.
 * Non blocca lo scroll verticale.
 * Su desktop non fa nulla.
 */
export function useLoungeSwipe(prevRoute: string | null, nextRoute: string | null) {
  const navigate = useNavigate();
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (window.innerWidth >= 980) return;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    // Ignora se il gesto è prevalentemente verticale (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 60) return;

    if (dx < 0 && nextRoute) {
      navigate(nextRoute);
    } else if (dx > 0 && prevRoute) {
      navigate(prevRoute);
    }
  }

  return { onTouchStart, onTouchEnd };
}
