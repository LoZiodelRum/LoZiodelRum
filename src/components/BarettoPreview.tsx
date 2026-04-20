import React from "react";
import { useNavigate } from "react-router-dom";

export default function BarettoPreview() {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl shadow-md p-6 bg-white hover:bg-gray-100 border border-gray-200 transition"
      onClick={() => navigate("/baretto")}
      aria-label="Apri chat Il Baretto"
    >
      <div className="flex items-center gap-3">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
        <span className="font-semibold text-lg">Il Baretto</span>
      </div>
      <div className="text-gray-500 mt-2 text-sm">Entra nella nuova chat!</div>
    </div>
  );
}
