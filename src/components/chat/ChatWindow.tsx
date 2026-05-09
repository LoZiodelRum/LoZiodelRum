import React from "react";

export default function ChatWindow({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ebe5dc" }}>
      {children}
    </main>
  );
}
