import React from "react";

export default function ChatSidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside style={{ width: 260, background: "#f4efe7", padding: 20, borderRight: "1px solid #ddd" }}>
      {children}
    </aside>
  );
}
