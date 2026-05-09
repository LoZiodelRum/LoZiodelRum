import React from "react";

export default function ChatParticipants({ members }: { members: any[] }) {
  return (
    <div style={{ marginTop: 20 }}>
      <strong style={{ color: "#2c1e14" }}>Partecipanti</strong>
      {members.map((m) => (
        <p key={m.id} style={{ color: "#7a6a58", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: m.online ? "#4ade80" : "#aaa", fontSize: 16 }}>●</span> {m.nome || m.username}
        </p>
      ))}
    </div>
  );
}
