import React from "react";

export default function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      background: "#c9a86a",
      color: "#fff",
      borderRadius: 12,
      fontSize: 12,
      padding: "2px 8px",
      marginLeft: 8,
      fontWeight: 600
    }}>{count}</span>
  );
}
