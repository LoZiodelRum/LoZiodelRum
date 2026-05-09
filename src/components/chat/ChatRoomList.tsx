import React from "react";

export default function ChatRoomList({ rooms, onSelect }: { rooms: any[]; onSelect: (room: any) => void }) {
  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id} onClick={() => onSelect(room)} style={{ marginBottom: 20, cursor: "pointer" }}>
          <strong style={{ color: "#c9a86a" }}>Tavolo {room.nome}</strong>
          <p style={{ color: "#7a6a58", fontSize: 12 }}>{room.ultimo_messaggio || "Nessun messaggio"}</p>
        </div>
      ))}
    </div>
  );
}
