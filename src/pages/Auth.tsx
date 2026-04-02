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

    const email = `${username}@loziodelrum.it`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("Credenziali errate");
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
      .from("profili")
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
      .from("profili")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profili").insert([
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
      .from("profili")
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
    <div className="page fade-in" style={container}>
      <form
        onSubmit={isRegister ? handleRegister : handleLogin}
        style={card}
      >
        <h2>{isRegister ? "Registrati" : "Accedi"}</h2>

        {!isRegister && (
          <>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={input}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={input}
            />
          </>
        )}

        {isRegister && step === "auth" && (
          <>
            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required style={input} />
            <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} required style={input} />
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={input} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={input} />
          </>
        )}

        {isRegister && step === "ruolo" && (
          <>
            <h3>Scegli il tuo ruolo</h3>

            <button type="button" style={btn} onClick={() => setRuolo("utente")}>
              Utente
            </button>

            <button type="button" style={btn} onClick={() => setRuolo("bartender")}>
              Bartender
            </button>

            <button type="button" style={btn} onClick={() => setRuolo("proprietario")}>
              Proprietario
            </button>

            {ruolo === "bartender" && (
              <>
                <input placeholder="Esperienze" value={esperienze} onChange={(e) => setEsperienze(e.target.value)} style={input} />
                <input placeholder="Specialità" value={specialita} onChange={(e) => setSpecialita(e.target.value)} style={input} />
                <input placeholder="Città" value={citta} onChange={(e) => setCitta(e.target.value)} style={input} />
                <input placeholder="Social" value={social} onChange={(e) => setSocial(e.target.value)} style={input} />
              </>
            )}

            {ruolo === "proprietario" && (
              <>
                <input placeholder="Nome locale" value={nomeLocale} onChange={(e) => setNomeLocale(e.target.value)} style={input} />
                <input placeholder="Indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} style={input} />
                <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={input} />
              </>
            )}

            <button
              type="button"
              style={submit}
              onClick={() => handleRuoloSelect(ruolo)}
            >
              Completa registrazione
            </button>
          </>
        )}

        {step === "auth" && (
          <button style={submit}>
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

// STILI invariati
const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0b0b0b",
};

const card = {
  width: "min(100%, 380px)",
  background: "#111",
  padding: 30,
  borderRadius: 12,
  color: "#fff",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  background: "#000",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: 6,
};

const btn = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const submit = {
  width: "100%",
  padding: 12,
  marginTop: 15,
  background: "#f5a623",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
};