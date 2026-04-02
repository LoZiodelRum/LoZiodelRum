import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegistrazioneProprietario() {
  // ANAGRAFICA
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [citta, setCitta] = useState("");

  // PROFILO
  const [bio, setBio] = useState("");

  // LOCALE
  const [nomeLocale, setNomeLocale] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [cittaLocale, setCittaLocale] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailBusiness, setEmailBusiness] = useState("");

  // IDENTITÀ
  const [descrizione, setDescrizione] = useState("");
  const [tipologia, setTipologia] = useState("");
  const [fasciaPrezzo, setFasciaPrezzo] = useState("");

  // TARGET
  const [target, setTarget] = useState("");

  // MOTIVAZIONE
  const [motivazione, setMotivazione] = useState("");

  // ONLINE
  const [instagram, setInstagram] = useState("");
  const [sito, setSito] = useState("");

  // PROFILAZIONE
  const [preferenzeDrink, setPreferenzeDrink] = useState("");
  const [visione, setVisione] = useState("");

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

    // PROFILO
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
        ruolo: "proprietario",
        status: "in_attesa",
      },
    ]);

    // LOCALE
    await supabase.from("Locali").insert([
      {
        id: user?.id,
        nome_locale: nomeLocale,
        indirizzo,
        citta: cittaLocale,
        telefono,
        email_business: emailBusiness,
        descrizione,
        tipologia,
        fascia_prezzo: fasciaPrezzo,
        target,
        motivazione,
        instagram,
        sito,
        preferenze_drink: preferenzeDrink,
        visione,
      },
    ]);

    alert("Registrazione inviata");
  }

  return (
    <div style={container}>
      <form onSubmit={handleRegister} style={card}>
        <h1 style={title}>Registrazione Proprietario</h1>

        <Section title="Dati anagrafici">
          <Input placeholder="Nome *" onChange={(e: any) => setNome(e.target.value)} />
          <Input placeholder="Cognome *" onChange={(e: any) => setCognome(e.target.value)} />
          <Input placeholder="Username *" onChange={(e: any) => setUsername(e.target.value)} />
          <Input placeholder="Email *" onChange={(e: any) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password *" onChange={(e: any) => setPassword(e.target.value)} />
          <Input type="date" onChange={(e: any) => setDataNascita(e.target.value)} />
          <Input placeholder="Città" onChange={(e: any) => setCitta(e.target.value)} />
        </Section>

        <Section title="Profilo">
          <Textarea placeholder="Bio breve" onChange={(e: any) => setBio(e.target.value)} />
        </Section>

        <Section title="Dati del locale">
          <Input placeholder="Nome locale *" onChange={(e: any) => setNomeLocale(e.target.value)} />
          <Input placeholder="Indirizzo completo *" onChange={(e: any) => setIndirizzo(e.target.value)} />
          <Input placeholder="Città *" onChange={(e: any) => setCittaLocale(e.target.value)} />
          <Input placeholder="Telefono" onChange={(e: any) => setTelefono(e.target.value)} />
          <Input placeholder="Email business" onChange={(e: any) => setEmailBusiness(e.target.value)} />
        </Section>

        <Section title="Identità del locale">
          <Textarea placeholder="Descrizione locale" onChange={(e: any) => setDescrizione(e.target.value)} />
          <Input placeholder="Tipologia (Cocktail bar, Rum bar...)" onChange={(e: any) => setTipologia(e.target.value)} />
          <Input placeholder="Fascia prezzo (€ - €€€)" onChange={(e: any) => setFasciaPrezzo(e.target.value)} />
        </Section>

        <Section title="Target clientela">
          <Textarea placeholder="Descrivi il target" onChange={(e: any) => setTarget(e.target.value)} />
        </Section>

        <Section title="Motivazione">
          <Textarea placeholder="Perché hai aperto il locale" onChange={(e: any) => setMotivazione(e.target.value)} />
        </Section>

        <Section title="Presenza online">
          <Input placeholder="Instagram" onChange={(e: any) => setInstagram(e.target.value)} />
          <Input placeholder="Sito web" onChange={(e: any) => setSito(e.target.value)} />
        </Section>

        <Section title="Profilazione">
          <Input placeholder="Preferenze drink" onChange={(e: any) => setPreferenzeDrink(e.target.value)} />
          <Textarea placeholder="Visione del bere" onChange={(e: any) => setVisione(e.target.value)} />
        </Section>

        {/* CONSENSI MIGLIORATI */}
        <Section title="Consensi">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={consenso}>
              <input type="checkbox" onChange={(e: any) => setTermini(e.target.checked)} />
              Accetto termini e condizioni
            </label>

            <label style={consenso}>
              <input type="checkbox" onChange={(e: any) => setPrivacy(e.target.checked)} />
              Accetto privacy policy
            </label>

            <label style={consenso}>
              <input type="checkbox" onChange={(e: any) => setMaggiorenne(e.target.checked)} />
              Dichiaro di essere maggiorenne
            </label>
          </div>
        </Section>

        <button style={submit}>Completa registrazione</button>
      </form>
    </div>
  );
}

/* COMPONENTI UI */

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
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

/* STYLE */

const container = {
  minHeight: "100vh",
  background: "#000",
  display: "flex",
  justifyContent: "center",
  padding: 40,
};

const card = {
  width: 750,
  padding: 40,
  background: "#111",
  borderRadius: 20,
  color: "#fff",
};

const title = {
  fontSize: 34,
  marginBottom: 25,
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
};

const textarea = {
  ...input,
  minHeight: 90,
};

const consenso = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  fontSize: 15,
};

const submit = {
  width: "100%",
  padding: 16,
  background: "#f5a623",
  border: "none",
  borderRadius: 10,
  marginTop: 25,
  fontWeight: "bold",
};