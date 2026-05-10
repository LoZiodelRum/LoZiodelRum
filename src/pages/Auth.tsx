import "../App.css";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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

  useEffect(() => {
    autoLogin();
  }, []);

  async function autoLogin() {
    const remembered = localStorage.getItem("rememberedDevice");
    const deviceToken = localStorage.getItem("deviceToken");

    if (!remembered || !deviceToken) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { data: profilo } = await supabase
      .from("Profili")
      .select("device_token")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profilo) return;

    if (profilo.device_token === deviceToken) {
      navigate("/");
    }
  }

  async function handleLogin(e: any) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      let deviceToken = localStorage.getItem("deviceToken");

      if (!deviceToken) {
        deviceToken = uuidv4();
        localStorage.setItem("deviceToken", deviceToken);
      }

      const cleanUsername = username.trim().toLowerCase();

      const { data: profilo, error: profiloError } = await supabase
        .from("Profili")
        .select("*")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (profiloError) {
        console.error("Errore profilo:", profiloError);
        setMsg("Errore recupero utente");
        setLoading(false);
        return;
      }

      if (!profilo) {
        setMsg("Utente non trovato");
        setLoading(false);
        return;
      }

      if (!profilo.email) {
        setMsg("Email utente mancante");
        setLoading(false);
        return;
      }

      if (!profilo.approvato) {
        setMsg("Account in attesa di approvazione");
        setLoading(false);
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: profilo.email,
        password,
      });

      if (loginError) {
        console.error("Errore login:", loginError);
        setMsg("Credenziali errate");
        setLoading(false);
        return;
      }

      if (profilo.device_token !== deviceToken) {
        await supabase
          .from("Profili")
          .update({
            device_token: deviceToken,
          })
          .eq("id", profilo.id);
      }

      localStorage.setItem("rememberedDevice", "true");

      navigate("/");

    } catch (err) {
      console.error(err);
      setMsg("Errore login");
    }

    setLoading(false);
  }

  async function handleRegister(e: any) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    const cleanUsername = username.trim().toLowerCase();
    const email = `${cleanUsername}@loziodelrum.it`;

    let user: any = null;

    let deviceToken = localStorage.getItem("deviceToken");

    if (!deviceToken) {
      deviceToken = uuidv4();
      localStorage.setItem("deviceToken", deviceToken);
    }

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
      cleanUsername === "maurizio" || cleanUsername === "lozio"
        ? "admin"
        : "utente";

    const { data: existingProfile } = await supabase
      .from("Profili")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from("Profili")
        .insert([
          {
            id: user.id,
            nome,
            cognome,
            username: cleanUsername,
            email,
            ruolo: ruoloFinale,
            approvato: true,
            device_token: deviceToken,
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
        console.error(insertError);
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
              placeholder="Username"
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
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <input
              placeholder="Cognome"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
            />

            <input
              placeholder="Username"
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

        {isRegister && step === "ruolo" && (
          <>
            <h3>Scegli il tuo ruolo</h3>

            <button
              type="button"
              onClick={() => setRuolo("utente")}
            >
              Utente
            </button>

            <button
              type="button"
              onClick={() => setRuolo("bartender")}
            >
              Bartender
            </button>

            <button
              type="button"
              onClick={() => setRuolo("proprietario")}
            >
              Proprietario
            </button>

            {ruolo === "bartender" && (
              <>
                <input
                  placeholder="Esperienze"
                  value={esperienze}
                  onChange={(e) => setEsperienze(e.target.value)}
                />

                <input
                  placeholder="Specialità"
                  value={specialita}
                  onChange={(e) => setSpecialita(e.target.value)}
                />

                <input
                  placeholder="Città"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                />

                <input
                  placeholder="Social"
                  value={social}
                  onChange={(e) => setSocial(e.target.value)}
                />
              </>
            )}

            {ruolo === "proprietario" && (
              <>
                <input
                  placeholder="Nome locale"
                  value={nomeLocale}
                  onChange={(e) => setNomeLocale(e.target.value)}
                />

                <input
                  placeholder="Indirizzo"
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                />

                <input
                  placeholder="Telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </>
            )}

            <button
              type="button"
              onClick={() => handleRuoloSelect(ruolo)}
            >
              Completa registrazione
            </button>
          </>
        )}

        {step === "auth" && (
          <button>
            {loading
              ? "..."
              : isRegister
              ? "Registrati"
              : "Accedi"}
          </button>
        )}

        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setStep("auth");
            setMsg("");
          }}
          style={{
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          {isRegister
            ? "Hai già un account? Accedi"
            : "Registrati"}
        </p>

        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}