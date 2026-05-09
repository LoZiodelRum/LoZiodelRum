import React from "react";

export default function ChatMessage({ message, me }: { message: any; me: boolean }) {
  return (
    <div style={{
      background: me ? "#d9d2c7" : "#fff",
      padding: 15,
      borderRadius: 12,
      maxWidth: "60%",
      marginLeft: me ? "auto" : 0,
      marginBottom: 20,
      position: "relative"
    }}>
      <strong style={{ color: "#2c1e14" }}>{message.user}</strong>
      <p style={{ color: "#2c1e14" }}>{message.text}</p>
      {message.image && <img src={message.image} style={{ width: "100%", borderRadius: 10, marginTop: 10 }} alt="allegato" />}
      <span style={{ position: "absolute", right: 10, bottom: 8, fontSize: 11, color: "#aaa" }}>{message.orario}</span>
    </div>
  );
}
