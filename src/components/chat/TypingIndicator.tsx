import React from "react";

export default function TypingIndicator({ users }: { users: string[] }) {
  if (!users.length) return null;
  return (
    <div style={{ fontSize: 13, color: "#7a6a58", padding: "4px 12px" }}>
      {users.join(", ")} sta scrivendo…
    </div>
  );
}
