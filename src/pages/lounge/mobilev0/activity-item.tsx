import { MessageCircle } from "lucide-react";

interface ActivityItemProps {
  activity?: {
    user_name?: string;
    text?: string;
    timestamp?: string;
  };
  index?: number;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(82,247,235,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MessageCircle size={16} color="#52f7eb" />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {activity?.user_name || "User"}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            marginTop: 2,
          }}
        >
          {activity?.text || "Nessuna attività disponibile"}
        </div>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 11,
        }}
      >
        {activity?.timestamp || "-"}
      </div>
    </div>
  );
}