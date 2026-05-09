import React from "react";

export default function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span style={{ color: online ? "#4ade80" : "#aaa", fontSize: 16, marginRight: 6 }}>●</span>
  );
}
