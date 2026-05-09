import React, { useRef } from "react";

export default function ChatInput({ value, onChange, onSend }: { value: string; onChange: (v: string) => void; onSend: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 100,
        background: "#f7f4ee",
        padding: "16px 12px calc(16px + env(safe-area-inset-bottom, 0px)) 12px",
        borderTop: "1px solid #e0d7c6",
        boxShadow: "0 -2px 16px #0001",
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        minHeight: 70
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Scrivi un messaggio..."
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          padding: "14px 16px",
          borderRadius: 18,
          border: "1px solid #d2c7b8",
          background: "#fff",
          color: "#2c1e14",
          fontSize: 16,
          boxShadow: "0 2px 8px #0001",
          outline: "none",
          minHeight: 44,
          maxHeight: 120,
          lineHeight: 1.4
        }}
      />
      <button
        onClick={onSend}
        style={{
          background: value.trim() ? "#c9a86a" : "#e0d7c6",
          borderRadius: "50%",
          width: 48,
          height: 48,
          border: "none",
          cursor: value.trim() ? "pointer" : "not-allowed",
          color: "#fff",
          fontSize: 22,
          boxShadow: "0 2px 8px #c9a86a22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        disabled={!value.trim()}
        aria-label="Invia messaggio"
      >
        &#x27A4;
      </button>
    </div>
  );
}
