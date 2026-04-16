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

    const loginValue = username.trim().toLowerCase();
    const candidateEmails: string[] = [];

    if (loginValue.includes("@")) {
      candidateEmails.push(loginValue);
    } else {
      const { data: profileByUsername } = await supabase
        .from("Profili")
        .select("email")
        .eq("username", loginValue)
        .maybeSingle();

      const resolvedEmail = String(profileByUsername?.email || "").trim().toLowerCase();
      if (resolvedEmail) {
        candidateEmails.push(resolvedEmail);
      }

      // Backward compatibility for legacy accounts created as username@loziodelrum.it.
      candidateEmails.push(`${loginValue}@loziodelrum.it`);
    }

    let data: any = null;
    let error: any = null;
    for (const email of candidateEmails) {
      const attempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!attempt.error && attempt.data?.user) {
        data = attempt.data;
        error = null;
        break;
      }

      error = attempt.error;
    }

    if (error) {
      setMsg("Credenziali errate. Prova con email completa oppure username.");
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
      .select("approvato")
      .eq("id", user.id)
      .single();

    if (profiloError) {
      setMsg("Errore verifica profilo");
      setLoading(false);
      return;
    }

    if (!profilo?.approvato) {
      await supabase.auth.signOut();
      setMsg("Account in attesa di approvazione");
      setLoading(false);
      return;
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