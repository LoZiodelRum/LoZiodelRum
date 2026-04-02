import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function SegnalaLocale() {
  const navigate = useNavigate();
  const { user, status, loading } = useUser();

  const [nome, setNome] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [citta, setCitta] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [telefono, setTelefono] = useState("");
  const [orari, setOrari] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // 🔒 BLOCCO ACCESSO
  if (loading) return null;

  if (!user) return <div className="page fade-in" style={{ padding: 40 }}>Devi effettuare il login</div>;

  if (status !== "attivo")
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        Il tuo account è in attesa di approvazione
      </div>
    );

  const handleSubmit = async () => {
    if (!nome || !indirizzo || !descrizione) {
      alert("Compila i campi obbligatori");
      return;
    }

    setLoadingSubmit(true);

    // 1️⃣ CREA LOCALE
    const { data: locale, error } = await supabase
      .from("Locali")
      .insert([
        {
          nome,
          indirizzo,
          citta,
          descrizione,
          telefono,
          orari,
          status: "in_attesa",
        },
      ])
      .select()
      .single();

    if (error || !locale) {
      console.error(error);
      alert("Errore creazione locale");
      setLoadingSubmit(false);
      return;
    }

    // 2️⃣ UPLOAD MEDIA
    if (files) {
      for (const file of Array.from(files)) {
        const filePath = `locali/${locale.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from("media")
            .getPublicUrl(filePath);

          await supabase.from("Media").insert([
            {
              url_file: data.publicUrl,
              tipo: file.type.includes("video") ? "video" : "foto",
              entity_id: locale.id,      // ✅ QUI CAMBIA
              entity_type: "locale",     // ✅ FONDAMENTALE
              user_id: user.id,
              approvato: false,
            },
          ]);
        }
      }
    }

    alert("Locale inviato! In attesa di approvazione.");
    navigate("/");
  };

  return (
    <div className="page fade-in" style={{ padding: 40, maxWidth: "min(100%, 37.5rem)" }}>
      <h1>Segnala un Locale</h1>

      <input
        placeholder="Nome locale *"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        placeholder="Indirizzo *"
        value={indirizzo}
        onChange={(e) => setIndirizzo(e.target.value)}
      />

      <input
        placeholder="Città"
        value={citta}
        onChange={(e) => setCitta(e.target.value)}
      />

      <textarea
        placeholder="Descrizione *"
        value={descrizione}
        onChange={(e) => setDescrizione(e.target.value)}
      />

      <input
        placeholder="Telefono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      <input
        placeholder="Orari"
        value={orari}
        onChange={(e) => setOrari(e.target.value)}
      />

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <button onClick={handleSubmit} disabled={loadingSubmit}>
        {loadingSubmit ? "Invio..." : "Invia"}
      </button>
    </div>
  );
}