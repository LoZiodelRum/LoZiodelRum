import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<"auth" | "ruolo">("auth");

  const [ruolo, setRuolo] = useState("utente");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");

  const [esperienze, setEsperienze] = useState("");
  const [specialita, setSpecialita] = useState("");
  const [citta, setCitta] = useState("");
  const [social, setSocial] = useState("");

  const [nomeLocale, setNomeLocale] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const loginRaw = username.trim();
    const loginValue = loginRaw.toLowerCase();
    const candidateEmails: string[] = [];

    if (loginValue.includes("@")) {
      candidateEmails.push(loginValue);
    } else {
      const { data: profileByUsername } = await supabase
        .from("Profili")
        .select("email")
        .ilike("username", loginRaw)
        .maybeSingle();

      const resolvedEmail = String(profileByUsername?.email || "").trim().toLowerCase();
      if (resolvedEmail) {
        candidateEmails.push(resolvedEmail);
      }

      // Backward compatibility for legacy accounts created as username@loziodelrum.it.
      candidateEmails.push(`${loginRaw}@loziodelrum.it`);
      candidateEmails.push(`${loginValue}@loziodelrum.it`);
    }

    const uniqueCandidateEmails = [...new Set(candidateEmails.map((value) => value.trim().toLowerCase()).filter(Boolean))];

    let data: any = null;
    let error: any = null;
    for (const email of uniqueCandidateEmails) {
      console.log("Tentando login con email:", email);
      const attempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!attempt.error && attempt.data?.user) {
        console.log("Login riuscito con email:", email);
        data = attempt.data;
        error = null;
        break;
      }

      console.error("Tentativo fallito con email:", email, "Errore:", attempt.error?.message);
      error = attempt.error;
    }

    if (error) {
      const rawError = String(error?.message || "");
      const lowerError = rawError.toLowerCase();
      console.error("Login error details:", { rawError, lowerError, error });
      if (lowerError.includes("email not confirmed")) {
        setMsg("Email non confermata. Apri il link ricevuto via email e riprova.");
      } else if (lowerError.includes("invalid login credentials")) {
        setMsg("Credenziali errate. Prova con email completa oppure username.");
      } else {
        setMsg(rawError || "Errore login");
      }
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMsg("Errore login");
      setLoading(false);
      return;
    }

    const { data: profilo, error: profiloError } = await supabase
      .from("Profili")
      .select("ruolo")
      .eq("id", user.id)
      .maybeSingle();

    const profiloErrorMessage = String(profiloError?.message || "").toLowerCase();
    const profiloErrorCode = String((profiloError as any)?.code || "");
    const profileReadBlocked =
      profiloErrorCode === "42501" ||
      profiloErrorMessage.includes("permission") ||
      profiloErrorMessage.includes("row-level") ||
      profiloErrorMessage.includes("violates row-level security");
    const profileMissing = profiloErrorCode === "PGRST116";

    if (profiloError && !profileReadBlocked && !profileMissing) {
      setMsg("Errore verifica profilo");
      setLoading(false);
      return;
    }

    let effectiveProfile = profilo;

    if (!effectiveProfile) {
      const metadata = (user.user_metadata || {}) as Record<string, any>;
      const fallbackRuolo = String(metadata.ruolo || "utente");
      const fallbackProfile = {
        id: user.id,
        nome: String(metadata.nome || "").trim() || null,
        cognome: String(metadata.cognome || "").trim() || null,
        username: String(metadata.username || loginRaw || user.email?.split("@")[0] || "").trim() || null,
        email: String(user.email || "").trim().toLowerCase() || null,
        telefono: String(metadata.telefono || "").trim() || null,
        ruolo: fallbackRuolo,
      };

      const { data: recoveredProfile, error: recoverError } = await supabase
        .from("Profili")
        .upsert([fallbackProfile], { onConflict: "id" })
        .select("ruolo")
        .maybeSingle();

      if (recoverError) {
        const recoverMessage = String(recoverError?.message || "").toLowerCase();
        const recoverCode = String((recoverError as any)?.code || "");
        const recoverBlocked =
          recoverCode === "42501" ||
          recoverMessage.includes("permission") ||
          recoverMessage.includes("row-level") ||
          recoverMessage.includes("violates row-level security");
        if (!recoverBlocked) {
          setMsg("Errore verifica profilo");
          setLoading(false);
          return;
        }
      }

      effectiveProfile = recoveredProfile || fallbackProfile;
    }

    navigate("/");
    window.location.reload();
  }

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const email = `${username}@loziodelrum.it`;

    let user: any = null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        const login = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (login.error) {
          setMsg("Utente già registrato, password errata");
          setLoading(false);
          return;
        }

        user = login.data.user;
      } else {
        setMsg(error.message);
        setLoading(false);
        return;
      }
    } else {
      user = data.user;
    }

    if (!user) {
      setMsg("Errore registrazione");
      setLoading(false);
      return;
    }

    const ruoloFinale =
      username === "maurizio" ? "admin" : "utente";

    const { data: existingProfile } = await supabase
      .from("Profili")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("Profili").insert([
        {
          id: user.id,
          nome,
          cognome,
          username,
          email,
          ruolo: ruoloFinale,
          approvato: false,
          avatar_url: null,
          bio_breve: null,
          telefono: null,
          city: null,
          level: 1,
          points: 0,
          badges: [],
          esperienze_principali: null,
          specialita: null,
          citta_operativa: null,
          social_links: null,
          nome_locale: null,
          indirizzo: null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        setMsg(insertError.message);
        setLoading(false);
        return;
      }
    }

    setStep("ruolo");
    setLoading(false);
  }

  async function handleRuoloSelect(selectedRuolo: string) {
    setLoading(true);
    setMsg("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      setMsg("Errore recupero utente");
      setLoading(false);
      return;
    }

    let updateData: any = {
      ruolo: selectedRuolo,
    };

    if (selectedRuolo === "bartender") {
      updateData = {
        ...updateData,
        esperienze_principali: esperienze,
        specialita,
        citta_operativa: citta,
        social_links: social,
      };
    }

    if (selectedRuolo === "proprietario") {
      updateData = {
        ...updateData,
        nome_locale: nomeLocale,
        indirizzo,
        telefono,
      };
    }

    const { error } = await supabase
      .from("Profili")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setMsg("Registrazione completata");

    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1000);
  }

  return (
    <div className="form-page fade-in">
      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        className="form-card"
      >
        <h2>{isRegister ? "Registrati" : "Accedi"}</h2>

        {!isRegister && (
          <>
            <input
              placeholder="Email o Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        {isRegister && step === "auth" && (
          <>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        )}

        {isRegister && step === "ruolo" && (
          <>
            <h3>Scegli il tuo ruolo</h3>

            <button type="button" onClick={() => setRuolo("utente")}>Utente</button>
            <button type="button" onClick={() => setRuolo("bartender")}>Bartender</button>
            <button type="button" onClick={() => setRuolo("proprietario")}>Proprietario</button>

            {ruolo === "bartender" && (
              <>
                <input placeholder="Esperienze" value={esperienze} onChange={(e) => setEsperienze(e.target.value)} />
                <input placeholder="Specialità" value={specialita} onChange={(e) => setSpecialita(e.target.value)} />
                <input placeholder="Città" value={citta} onChange={(e) => setCitta(e.target.value)} />
                <input placeholder="Social" value={social} onChange={(e) => setSocial(e.target.value)} />
              </>
            )}

            {ruolo === "proprietario" && (
              <>
                <input placeholder="Nome locale" value={nomeLocale} onChange={(e) => setNomeLocale(e.target.value)} />
                <input placeholder="Indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} />
                <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </>
            )}

            <button type="button" onClick={() => handleRuoloSelect(ruolo)}>
              Completa registrazione
            </button>
          </>
        )}

        {step === "auth" && (
          <button>
            {loading ? "..." : isRegister ? "Registrati" : "Accedi"}
          </button>
        )}

        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setStep("auth");
          }}
          style={{ marginTop: 10, cursor: "pointer" }}
        >
          {isRegister ? "Hai già un account? Accedi" : "Registrati"}
        </p>

        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}