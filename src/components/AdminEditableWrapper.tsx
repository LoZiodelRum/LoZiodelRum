import { ReactNode, useState } from "react";
import { useUser } from "../context/UserContext";

type Props = {
  children: ReactNode;
  onSave?: () => void;
  onDelete?: () => void;
};

export default function AdminEditableWrapper({ children, onSave, onDelete }: Props) {
  const { role } = useUser();
  const isAdmin = role === "admin";

  const [editMode, setEditMode] = useState(isAdmin);

  if (!isAdmin) return <>{children}</>;

  return (
    <div style={{ border: "2px solid #00ffc8", padding: "10px", marginTop: "10px" }}>
      
      {/* BOTTONI */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        
        <button
          style={{ background: "blue", color: "#fff", padding: "6px 12px" }}
          onClick={() => setEditMode(!editMode)}
        >
          Modifica
        </button>

        <button
          style={{ background: "green", color: "#fff", padding: "6px 12px" }}
          onClick={onSave}
        >
          Salva
        </button>

        <button
          style={{ background: "red", color: "#fff", padding: "6px 12px" }}
          onClick={onDelete}
        >
          Elimina
        </button>
      </div>

      {/* CONTENUTO EDITABILE */}
      <div contentEditable={editMode} suppressContentEditableWarning>
        {children}
      </div>
    </div>
  );
}