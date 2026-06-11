import React from "react";

export default function ChatMessage({
  message,
  me,
}: {
  message: any;
  me: boolean;
}) {
  const nome =
    message?.profili?.username ||
    message?.profili?.nome ||
    "Utente";

  const avatar =
    message?.profili?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
        marginBottom: 16,
      }}
    >
      {!me && (
        <img
          src={avatar}
          alt={nome}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            marginRight: 8,
            objectFit: "cover",
          }}
        />
      )}

      <div
        style={{
          maxWidth: "75%",
        }}
      >
        {!me && (
          <div
            style={{
              fontSize: 12,
              marginBottom: 4,
              color: "#D4A54A",
              fontWeight: 600,
            }}
          >
            {nome}
          </div>
        )}

        <div
          style={{
            background: me ? "#D4A54A" : "#182232",
            color: me ? "#000" : "#fff",
            padding: "12px 14px",
            borderRadius: 18,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          <div
            style={{
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {message.testo || message.text}
          </div>

          {message.image && (
            <img
              src={message.image}
              alt="allegato"
              style={{
                width: "100%",
                borderRadius: 12,
                marginTop: 10,
              }}
            />
          )}

          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              marginTop: 6,
              opacity: 0.7,
            }}
          >
            {message.orario}
          </div>
        </div>
      </div>
    </div>
  );
}