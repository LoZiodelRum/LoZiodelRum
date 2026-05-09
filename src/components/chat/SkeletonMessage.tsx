import React from "react";

export default function SkeletonMessage() {
  return (
    <div style={{
      background: "#ececec",
      borderRadius: 12,
      height: 48,
      marginBottom: 20,
      width: "60%",
      animation: "pulse 1.2s infinite alternate"
    }} />
  );
}
