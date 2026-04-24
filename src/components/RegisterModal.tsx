import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  // const [dataNascita, setDataNascita] = useState("");
  const [isMaggiorenne, setIsMaggiorenne] = useState(false);
  const [citta, setCitta] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  if (!open) return null;

  const validStep1 =
    nome.trim() &&
    cognome.trim() &&
    username.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword &&
    usernameAvailable === true;

  const validStep2 = telefono.trim() && isMaggiorenne && citta.trim();
  const validStep3 = bio.trim().length <= 300;

  async function checkUsername(val: string) {
    setUsername(val);
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const { data } = await supabase
      .from("Profili")
      .select("id")
      .eq("username", val)
      .maybeSingle();
    setUsernameAvailable(!data);
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError || !authData.user) {
      setMsg(authError?.message || "Errore registrazione");
      setLoading(false);
      return;
    }
    const userId = authData.user.id;
    let avatar_url = "";
    if (avatar) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`public/${userId}_${avatar.name}`, avatar, { upsert: true });
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);
        avatar_url = urlData?.publicUrl || "";
      }
    }
    const { error: profiloError } = await supabase.from("Profili").insert([
      {
        id: userId,
        username,
        nome,
        cognome,
        email,
        telefono,
        // data_nascita: dataNascita, // campo non più richiesto
        citta,
        avatar_url,
        bio,
        ruolo: "utente",
        stato: "attivo",
        creato_il: new Date().toISOString(),
      },
    ]);
    if (profiloError) {
      setMsg(profiloError.message);
      setLoading(false);
      return;
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setMsg("Registrazione ok, errore login automatico");
      setLoading(false);
      return;
    }
    setMsg("");
    setLoading(false);
    onClose();
    window.location.href = "/home";
  }

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 2000,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#181818",
          borderRadius: 18,
          padding: 24,
          minWidth: 320,
          maxWidth: 380,
          width: "90vw",
          boxShadow: "0 8px 32px #000a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            background: "none",
            border: "none",
            color: "#FFD36A",
            fontSize: 28,
            cursor: "pointer",
          }}
          aria-label="Chiudi"
        >
          ×
        </button>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 26, marginBottom: 8 }}>
          Crea il tuo account
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {step === 1 && (
            <>
              <input
                placeholder="Nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                style={{ marginBottom: 10 }}
              />
              <input
                placeholder="Cognome"
                value={cognome}
                onChange={e => setCognome(e.target.value)}
                required
                style={{ marginBottom: 10 }}
              />
              <input
                placeholder="Username"
                value={username}
                onChange={e => checkUsername(e.target.value)}
                required
                style={{
                  marginBottom: 6,
                  borderColor:
                    username.length > 2
                      ? usernameAvailable === false
                        ? "red"
                        : usernameAvailable === true
                        ? "green"
                        : "#333"
                      : "#333",
                }}
              />
              {username.length > 2 && usernameAvailable === false && (
                <div style={{ color: "red", fontSize: 13, marginBottom: 6 }}>
                  Username già in uso
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ marginBottom: 10 }}
              />
              <input
                type="password"
                placeholder="Password (min 6 caratteri)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
                style={{ marginBottom: 10 }}
              />
              <input
                type="password"
                placeholder="Conferma password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                style={{ marginBottom: 10 }}
              />
              {step === 2 && (
                <>
                  <input
                    placeholder="Telefono"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    required
                    style={{ marginBottom: 10 }}
                  />
                  <input
                    placeholder="Città"
                    value={citta}
                    onChange={e => setCitta(e.target.value)}
                    required
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      id="maggiorenne"
                      checked={isMaggiorenne}
                      onChange={e => setIsMaggiorenne(e.target.checked)}
                      required
                      style={{ marginRight: 8 }}
                    />
                    <label htmlFor="maggiorenne" style={{ color: "#FFD36A", fontSize: 15, cursor: "pointer" }}>
                      Dichiaro di essere maggiorenne
                    </label>
                  </div>
                  <button
                    type="button"
                    disabled={!validStep2}
                    onClick={() => setStep(3)}
                    style={{
                      width: "100%",
                      background: "#FFD36A",
                      color: "#181818",
                      fontWeight: 700,
                      fontSize: 18,
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 0",
                      marginTop: 8,
                      marginBottom: 4,
                      boxShadow: "0 2px 0 #b48a2c",
                      opacity: !validStep2 ? 0.5 : 1,
                      cursor: !validStep2 ? "not-allowed" : "pointer",
                    }}
                  >
                    Avanti
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={!validStep2}
                onClick={() => setStep(3)}
                style={{
                  width: "100%",
                  background: "#FFD36A",
                  color: "#181818",
                  fontWeight: 700,
                  fontSize: 18,
                  border: "none",
                  borderRadius: 10,
                  {step === 3 && (
                    <>
                      <div style={{ color: "#FFD36A", fontWeight: 700, marginBottom: 8, marginTop: 8 }}>Carica avatar</div>
                      <input type="file" accept="image/*" onChange={handleAvatar} style={{ marginBottom: 10 }} />
                      {avatarUrl && (
                        <img src={avatarUrl} alt="avatar preview" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 10, objectFit: "cover" }} />
                      )}
                      <textarea
                        placeholder="Bio (max 300 caratteri) - facoltativa"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        maxLength={300}
                        style={{ width: "100%", minHeight: 80, marginBottom: 10 }}
                      />
                      <button
                        type="submit"
                        disabled={!validStep3 || loading}
                        style={{
                          width: "100%",
                          background: "#FFD36A",
                          color: "#181818",
                          fontWeight: 700,
                          fontSize: 18,
                          border: "none",
                          borderRadius: 10,
                          padding: "12px 0",
                          marginTop: 8,
                          marginBottom: 4,
                          boxShadow: "0 2px 0 #b48a2c",
                          opacity: !validStep3 || loading ? 0.5 : 1,
                          cursor: !validStep3 || loading ? "not-allowed" : "pointer",
                        }}
                      >
                        Crea il tuo account
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        style={{
                          width: "100%",
                          background: "none",
                          color: "#FFD36A",
                          border: "none",
                          fontSize: 16,
                          marginTop: 8,
                          cursor: "pointer",
                        }}
                      >
                        Indietro
                      </button>
                    </>
                  )}
                  />
                </label>
              </div>
              <textarea
                placeholder="Bio (max 300 caratteri)"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={300}
                rows={4}
                style={{ width: "100%", marginBottom: 10, borderRadius: 8, padding: 8 }}
              />
              <button
                type="submit"
                disabled={!validStep3 || loading}
                style={{
                  width: "100%",
                  background: "#FFD36A",
                  color: "#181818",
                  fontWeight: 700,
                  fontSize: 18,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 0",
                  marginTop: 8,
                  marginBottom: 4,
                  boxShadow: "0 2px 0 #b48a2c",
                  opacity: !validStep3 || loading ? 0.5 : 1,
                  cursor: !validStep3 || loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "..." : "Crea il tuo account"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  width: "100%",
                  background: "none",
                  color: "#FFD36A",
                  border: "none",
                  fontSize: 16,
                  marginTop: 8,
                  cursor: "pointer",
                }}
              >
                Indietro
              </button>
            </>
          )}
        </form>
        {msg && (
          <div style={{ color: "#FFD36A", marginTop: 12, textAlign: "center" }}>{msg}</div>
        )}
      </div>
    </div>
  );
}
