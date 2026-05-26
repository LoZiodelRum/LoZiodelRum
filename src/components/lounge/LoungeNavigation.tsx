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
  const [leftHover, setLeftHover] = React.useState(false);
  const [rightHover, setRightHover] = React.useState(false);

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
          transition: all 0.22s ease;
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
      `}</style>

      {leftTo && (
        <button
          className="lounge-nav-arrow lounge-nav-arrow-left"
          aria-label={leftAriaLabel}
          onClick={() => navigate(leftTo)}
          onMouseEnter={() => setLeftHover(true)}
          onMouseLeave={() => setLeftHover(false)}
          style={
            leftHover
              ? {
                  background: "rgba(0,180,255,0.18)",
                  borderColor: "#00b4ff",
                  color: "#00b4ff",
                  boxShadow: "0 0 18px rgba(0,180,255,0.35)",
                }
              : undefined
          }
        >
          ‹
        </button>
      )}

      {rightTo && (
        <button
          className="lounge-nav-arrow lounge-nav-arrow-right"
          aria-label={rightAriaLabel}
          onClick={() => navigate(rightTo)}
          onMouseEnter={() => setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={
            rightHover
              ? {
                  background: "rgba(0,180,255,0.18)",
                  borderColor: "#00b4ff",
                  color: "#00b4ff",
                  boxShadow: "0 0 18px rgba(0,180,255,0.35)",
                }
              : undefined
          }
        >
          ›
        </button>
      )}
    </>
  );
}
