import React from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f7f4ee" }}>
      {children}
    </div>
  );
}
