import React from "react";
import { useNavigate } from "react-router-dom";

type LoungeNavigationProps = {
  leftTo?: string;
  rightTo?: string;
  leftAriaLabel?: string;
  rightAriaLabel?: string;
};

export default function LoungeNavigation({
  leftTo,
  rightTo,
  leftAriaLabel = "Vai alla pagina precedente",
  rightAriaLabel = "Vai alla pagina successiva",
}: LoungeNavigationProps) {
  const navigate = useNavigate();
  const [visibleControls, setVisibleControls] = React.useState(true);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsVisibleRef = React.useRef(true);

  const scheduleHide = React.useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      controlsVisibleRef.current = false;
      setVisibleControls(false);
    }, 4000);
  }, []);

  const handleUserActivity = React.useCallback(() => {
    if (!controlsVisibleRef.current) {
      controlsVisibleRef.current = true;
      setVisibleControls(true);
    }
    scheduleHide();
  }, [scheduleHide]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    scheduleHide();

    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("click", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });
    window.addEventListener("scroll", handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [handleUserActivity, scheduleHide]);

  const hiddenClass = visibleControls ? "" : " lounge-nav-arrow--hidden";

  return (
    <>
      <style>{`
        .lounge-nav-arrow {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1300;
          width: clamp(34px, 7vw, 44px);
          height: clamp(52px, 10vw, 68px);
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(0,0,0,0.45);
          color: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(18px, 3.8vw, 22px);
          cursor: pointer;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          transition: opacity 0.35s ease, background 0.22s ease, border-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
          opacity: 1;
          pointer-events: auto;
        }

        .lounge-nav-arrow:hover {
          background: rgba(0,180,255,0.18);
          border-color: #00b4ff;
          color: #00b4ff;
          box-shadow: 0 0 18px rgba(0,180,255,0.35);
        }

        .lounge-nav-arrow-left {
          left: clamp(6px, 1.8vw, 12px);
        }

        .lounge-nav-arrow-right {
          right: clamp(6px, 1.8vw, 12px);
        }

        .lounge-nav-arrow--hidden {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .lounge-nav-arrow {
            width: clamp(30px, 6.4vw, 36px);
            height: clamp(46px, 9.2vw, 56px);
            font-size: clamp(16px, 3.2vw, 20px);
            border-radius: 12px;
          }
        }
      `}</style>

      {leftTo && (
        <button
          className={`lounge-nav-arrow lounge-nav-arrow-left${hiddenClass}`}
          aria-label={leftAriaLabel}
          onClick={() => navigate(leftTo)}
        >
          ‹
        </button>
      )}

      {rightTo && (
        <button
          className={`lounge-nav-arrow lounge-nav-arrow-right${hiddenClass}`}
          aria-label={rightAriaLabel}
          onClick={() => navigate(rightTo)}
        >
          ›
        </button>
      )}
    </>
  );
}
