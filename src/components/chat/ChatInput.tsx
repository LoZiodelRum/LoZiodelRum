import React from "react";

export default function ChatInput({ value, onChange, onSend }: { value: string; onChange: (v: string) => void; onSend: () => void }) {
  return (
    <div style={{ padding: 15, borderTop: "1px solid #ddd", display: "flex", gap: 10 }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
        }}
        placeholder="Scrivi un messaggio..."
        style={{ flex: 1, padding: 12, borderRadius: 20, border: "1px solid #ddd", background: "#fff", color: "#2c1e14" }}
      />
      <button
        onClick={onSend}
        style={{ background: "#c9a86a", borderRadius: "50%", width: 45, height: 45, border: "none", cursor: "pointer" }}
      >➤</button>
    </div>
  );
}
