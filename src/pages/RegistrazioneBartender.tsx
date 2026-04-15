import "../App.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegistrazioneBartender() {
  // DATI ANAGRAFICI
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [citta, setCitta] = useState("");

  // PROFILO PROFESSIONALE
  const [bio, setBio] = useState("");

  // PERCORSO FORMATIVO
  const [scuoleCorsi, setScuoleCorsi] = useState("");
  const [certificazioni, setCertificazioni] = useState("");
  const [masterclass, setMasterclass] = useState("");
  const [autodidatta, setAutodidatta] = useState(false);

  // ESPERIENZE LAVORATIVE
  const [localiLavorati, setLocaliLavorati] = useState("");
  const [ruoliRicoperti, setRuoliRicoperti] = useState("");
  const [anniEsperienza, setAnniEsperienza] = useState("");

  // ATTUALE COLLABORAZIONE
  const [nomeLocaleAttuale, setNomeLocaleAttuale] = useState("");
  const [ruoloAttuale, setRuoloAttuale] = useState("");
  const [cittaAttuale, setCittaAttuale] = useState("");

  // SIGNATURE
  const [nomeSignature, setNomeSignature] = useState("");
  const [descrizioneSignature, setDescrizioneSignature] = useState("");
  const [filosofiaDrink, setFilosofiaDrink] = useState("");

  // PREFERENZE PROFESSIONALI
  const [spiritiPreferiti, setSpiritiPreferiti] = useState("");
  const [stileMiscelazione, setStileMiscelazione] = useState("");

  // DESCRIZIONE PERSONALE
  const [descrizionePersonale, setDescrizionePersonale] = useState("");

  // CONSENSI
  const [termini, setTermini] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [maggiorenne, setMaggiorenne] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();

    if (!termini || !privacy || !maggiorenne) {
      alert("Accetta tutti i consensi");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    await supabase.from("Profili").insert([
      {
        id: user?.id,
        nome,
        cognome,
        username,
        email,
        data_nascita: dataNascita,
        citta,
        bio,
        ruolo: "bartender",
        status: "in_attesa",
      },
    ]);

    await supabase.from("Bartender").insert([
      {
        id: user?.id,
        scuole_corsi: scuoleCorsi,
        certificazioni,
        masterclass,
        autodidatta,
        locali_lavorati: localiLavorati,
        ruoli_ricoperti: ruoliRicoperti,
        anni_esperienza: anniEsperienza,
        nome_locale_attuale: nomeLocaleAttuale,
        ruolo_attuale: ruoloAttuale,
        citta_attuale: cittaAttuale,
        nome_signature: nomeSignature,
        descrizione_signature: descrizioneSignature,
        filosofia_drink: filosofiaDrink,
        spiriti_preferiti: spiritiPreferiti,
        stile_miscelazione: stileMiscelazione,
        descrizione_personale: descrizionePersonale,
      },
    ]);

    alert("Registrazione inviata");
  }

  return (
    <div className="page fade-in registration-form-page">
      <form className="registration-form-shell" onSubmit={handleRegister} style={{ width: "min(100%, 760px)", margin: "0 auto", padding: "clamp(16px, 3vw, 40px)", background: "#111", borderRadius: 20, color: "#fff" }}>
        <h1 style={title}>Registrazione Bartender</h1>

        <Section title="Dati anagrafici">
          <Input placeholder="Nome *" onChange={(e: any) => setNome(e.target.value)} />
          <Input placeholder="Cognome *" onChange={(e: any) => setCognome(e.target.value)} />
          <Input placeholder="Username *" onChange={(e: any) => setUsername(e.target.value)} />
          <Input placeholder="Email *" onChange={(e: any) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password *" onChange={(e: any) => setPassword(e.target.value)} />
          <Input type="date" onChange={(e: any) => setDataNascita(e.target.value)} />
          <Input placeholder="Città" onChange={(e: any) => setCitta(e.target.value)} />
        </Section>

        <Section title="Profilo professionale">
          <Textarea placeholder="Bio breve" onChange={(e: any) => setBio(e.target.value)} />
        </Section>

        <Section title="Percorso formativo">
          <Textarea placeholder="Scuole / corsi frequentati" onChange={(e: any) => setScuoleCorsi(e.target.value)} />
          <Textarea placeholder="Certificazioni" onChange={(e: any) => setCertificazioni(e.target.value)} />
          <Textarea placeholder="Masterclass / specializzazioni" onChange={(e: any) => setMasterclass(e.target.value)} />
          <CheckboxRow>
            <input
              type="checkbox"
              checked={autodidatta}
              onChange={(e: any) => setAutodidatta(e.target.checked)}
            />
            <span>Autodidatta con esperienza</span>
          </CheckboxRow>
        </Section>

        <Section title="Esperienze lavorative">
          <Textarea placeholder="Locali in cui hai lavorato" onChange={(e: any) => setLocaliLavorati(e.target.value)} />
          <Textarea placeholder="Ruoli ricoperti" onChange={(e: any) => setRuoliRicoperti(e.target.value)} />
          <Input placeholder="Anni di esperienza" onChange={(e: any) => setAnniEsperienza(e.target.value)} />
        </Section>

        <Section title="Attuale collaborazione">
          <Input placeholder="Nome locale attuale" onChange={(e: any) => setNomeLocaleAttuale(e.target.value)} />
          <Input placeholder="Ruolo" onChange={(e: any) => setRuoloAttuale(e.target.value)} />
          <Input placeholder="Città" onChange={(e: any) => setCittaAttuale(e.target.value)} />
        </Section>

        <Section title="Signature">
          <Input placeholder="Nome signature cocktail" onChange={(e: any) => setNomeSignature(e.target.value)} />
          <Textarea placeholder="Descrizione breve" onChange={(e: any) => setDescrizioneSignature(e.target.value)} />
          <Textarea placeholder="Filosofia del drink" onChange={(e: any) => setFilosofiaDrink(e.target.value)} />
        </Section>

        <Section title="Preferenze professionali">
          <Input placeholder="Spiriti preferiti" onChange={(e: any) => setSpiritiPreferiti(e.target.value)} />

          <div style={choiceGroup}>
            <div style={choiceLabel}>Stile di miscelazione</div>

            <label style={choiceItem}>
              <input
                type="radio"
                name="stileMiscelazione"
                value="Classico"
                checked={stileMiscelazione === "Classico"}
                onChange={(e: any) => setStileMiscelazione(e.target.value)}
              />
              <span>Classico</span>
            </label>

            <label style={choiceItem}>
              <input
                type="radio"
                name="stileMiscelazione"
                value="Moderno"
                checked={stileMiscelazione === "Moderno"}
                onChange={(e: any) => setStileMiscelazione(e.target.value)}
              />
              <span>Moderno</span>
            </label>

            <label style={choiceItem}>
              <input
                type="radio"
                name="stileMiscelazione"
                value="Sperimentale"
                checked={stileMiscelazione === "Sperimentale"}
                onChange={(e: any) => setStileMiscelazione(e.target.value)}
              />
              <span>Sperimentale</span>
            </label>
          </div>
        </Section>

        <Section title="Breve descrizione di te">
          <Textarea
            placeholder="Chi sei dietro il bancone — stile, visione, approccio"
            onChange={(e: any) => setDescrizionePersonale(e.target.value)}
          />
        </Section>

        <Section title="Consensi">
          <CheckboxRow>
            <input
              type="checkbox"
              checked={termini}
              onChange={(e: any) => setTermini(e.target.checked)}
            />
            <span>Accettazione termini e condizioni</span>
          </CheckboxRow>

          <CheckboxRow>
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e: any) => setPrivacy(e.target.checked)}
            />
            <span>Privacy policy</span>
          </CheckboxRow>

          <CheckboxRow>
            <input
              type="checkbox"
              checked={maggiorenne}
              onChange={(e: any) => setMaggiorenne(e.target.checked)}
            />
            <span>Dichiarazione di essere maggiorenne</span>
          </CheckboxRow>
        </Section>

        <button style={submit}>Completa registrazione</button>
      </form>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="registration-form-section" style={section}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Input(props: any) {
  return <input {...props} style={input} />;
}

function Textarea(props: any) {
  return <textarea {...props} style={textarea} />;
}

function CheckboxRow({ children }: any) {
  return <label style={checkboxRow}>{children}</label>;
}

const container = {
  minHeight: "100%",
  background: "#000",
  display: "flex",
  justifyContent: "center",
  padding: 16,
};

const card = {
  width: "min(100%, 760px)",
  padding: "clamp(16px, 3vw, 40px)",
  background: "#111",
  borderRadius: 20,
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const title = {
  fontSize: "clamp(1.75rem, 4.5vw, 2.125rem)",
  marginBottom: 30,
  fontWeight: 800,
};

const section = {
  marginBottom: 30,
  padding: 22,
  borderRadius: 16,
  background: "#151515",
  border: "1px solid #222",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 20,
  fontWeight: 700,
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
  fontSize: 15,
  boxSizing: "border-box" as const,
};

const textarea = {
  ...input,
  minHeight: 95,
  resize: "vertical" as const,
};

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
  fontSize: 15,
};

const choiceGroup = {
  marginTop: 8,
  padding: 14,
  borderRadius: 12,
  background: "#0d0d0d",
  border: "1px solid #2a2a2a",
};

const choiceLabel = {
  marginBottom: 12,
  fontWeight: 700,
  fontSize: 15,
};

const choiceItem = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  fontSize: 15,
};

const submit = {
  width: "100%",
  padding: 16,
  background: "#f5a623",
  border: "none",
  borderRadius: 12,
  marginTop: 10,
  fontWeight: "bold",
  fontSize: 17,
  cursor: "pointer",
};