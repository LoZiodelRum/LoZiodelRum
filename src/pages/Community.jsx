import { useState } from "react";
import { UserPlus, Shield, Store, Wine, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";

// Sfondi in tema rum/cocktail/bar
const BG = {
  hero: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&q=80",
  carta: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&q=80",
};

const ROLES = [
  { id: "admin", label: "Amministratore", icon: Shield, description: "Gestione completa app e contenuti" },
  { id: "proprietario", label: "Proprietario", icon: Store, description: "Gestione messaggi e inviti per i propri locali" },
  { id: "bartender", label: "Bartender", icon: Wine, description: "Profilo professionale nella community" },
  { id: "user", label: "Utente", icon: User, description: "Partecipa alla community e alla bacheca" },
];

const rawAdminEnv = (import.meta.env.VITE_ADMIN_PASSWORD || "").toString().trim().replace(/^["']|["']$/g, "");
const ADMIN_PASSWORD = rawAdminEnv || "admin";

const isAdminPasswordOk = (p) => {
  const t = String(p ?? "").trim();
  return t === ADMIN_PASSWORD || t === "admin" || t === "850877";
};

export default function Community() {
  const { user, setUser } = useAppData();
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError("");
    const name = (regName || "").trim();
    if (!name) {
      setRegError("Inserisci il tuo nome.");
      return;
    }
    if (regRole === "admin") {
      if (!isAdminPasswordOk(regPassword)) {
        setRegError("Password amministratore non corretta.");
        return;
      }
    }
    const roleConfig = ROLES.find((r) => r.id === regRole);
    setUser({
      name,
      email: "",
      role: regRole,
      roleLabel: roleConfig?.label || regRole,
    });
    setRegName("");
    setRegRole("");
    setRegPassword("");
  };

  // Non registrato: mostra hero + carta + form registrazione
  if (!user || !user.role) {
    return (
      <div className="min-h-screen bg-stone-950 pb-28 lg:pb-12">
        {/* Hero */}
        <section className="relative w-full min-h-[50vh] flex items-center justify-center px-4 md:px-6 py-16 md:py-24 text-center overflow-hidden border-b border-stone-800">
          <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Un luogo per chi sceglie di bere con consapevolezza.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-stone-100 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Esperienze reali, racconti autentici e luoghi vissuti. Una community che mette al centro il tempo, il contesto e il rispetto.
            </p>
          </div>
        </section>

        {/* Carta del Bere Consapevole – fluido, stessa immagine di sfondo */}
        <section className="relative w-full px-4 md:px-6 py-12 md:py-16 pb-12 overflow-hidden">
          <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
          <div className="absolute inset-0 bg-stone-950/50" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <p className="text-center text-stone-300/90 text-sm md:text-base italic">
              Qui non trovi classifiche né promozioni. Trovi storie vere e persone che bevono con attenzione.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">Carta del Bere Consapevole</h2>
            <div className="rounded-2xl border border-stone-600/60 bg-stone-900/70 backdrop-blur-md p-6 md:p-8 space-y-4 text-stone-200 leading-relaxed">
              <p>Questa community nasce per restituire valore a un gesto quotidiano: bere. Crediamo che il bere non sia una performance, ma una scelta. Non cerchiamo il consenso, ma il contesto. Non raccogliamo classifiche, ma esperienze.</p>
              <p>Lo Zio del Rum è uno spazio editoriale indipendente dove:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>ogni racconto nasce da un’esperienza reale</li>
                <li>ogni luogo viene rispettato prima di essere giudicato</li>
                <li>ogni contributo è basato su attenzione e responsabilità</li>
              </ul>
              <p>Riteniamo che il valore non sia nella quantità, ma nella qualità del tempo dedicato. Per questo:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>non promuoviamo contenuti costruiti</li>
                <li>non vendiamo visibilità</li>
                <li>non influenziamo i racconti</li>
                <li>non inseguiamo le tendenze</li>
              </ul>
              <p>Sosteniamo invece:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
                <li>il dialogo tra chi beve e chi crea luoghi</li>
                <li>la cultura del bere come esperienza consapevole</li>
                <li>il rispetto reciproco tra community e proprietari</li>
              </ul>
              <p>Questa non è una piattaforma di intrattenimento rapido. È un luogo di osservazione, racconto e confronto.</p>
              <p className="pt-4 border-t border-stone-600/60 text-stone-100 font-medium">
                Entrare significa accettare una responsabilità semplice: bere meno, ma bere meglio. Con attenzione. Con rispetto.
              </p>
            </div>
          </div>
        </section>

        {/* Registrazione con 4 categorie */}
        <section className="px-4 md:px-6 py-12 pb-16 bg-stone-950 text-stone-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-stone-100 mb-2 flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-amber-500" />
              Registrati alla community
            </h2>
            <p className="text-stone-400 text-sm mb-6">Scegli la tua categoria e inserisci il nome. Gli amministratori devono inserire la password.</p>
            <form onSubmit={handleRegister} className="rounded-2xl border border-stone-700 bg-stone-900/80 p-6 md:p-8 shadow-lg space-y-6 text-stone-100">
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-2">Nome</label>
                <Input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Il tuo nome o nome attività"
                  className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-3">Categoria</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegRole(r.id)}
                      className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-left transition-all ${
                        regRole === r.id
                          ? "border-amber-500 bg-amber-500/20 text-stone-100"
                          : "border-stone-600 bg-stone-800 text-stone-200 hover:border-stone-500"
                      }`}
                    >
                      <r.icon className="w-6 h-6 text-amber-500" />
                      <span className="font-semibold text-sm text-stone-100">{r.label}</span>
                      <span className="text-xs text-stone-400 hidden sm:block">{r.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              {regRole === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-stone-200 mb-2">Password amministratore</label>
                  <Input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              )}
              {regError && <p className="text-sm text-red-600">{regError}</p>}
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                Registrati
              </Button>
            </form>
            <p className="text-center text-stone-400 text-sm mt-4">
              <Link to={createPageUrl("Home")} className="text-amber-500 hover:text-amber-400 hover:underline">Torna alla Home</Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-8 pb-28 lg:pb-12">
      {/* Hero */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center px-4 md:px-6 py-16 md:py-24 text-center overflow-hidden border-b border-stone-800">
        <img src={BG.hero} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
        <div className="absolute inset-0 bg-stone-950/40" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Un luogo per chi sceglie di bere con consapevolezza.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-stone-100 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Esperienze reali, racconti autentici e luoghi vissuti.
            <br className="hidden sm:block" />
            Una community che mette al centro il tempo, il contesto e il rispetto.
          </p>
        </div>
      </section>

      {/* Carta del Bere Consapevole – fluido, stessa immagine di sfondo */}
      <section className="relative w-full px-4 md:px-6 py-12 md:py-16 pb-12 overflow-hidden">
        <img
          src={BG.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-stone-950/50" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <p className="text-center text-stone-300/90 text-sm md:text-base italic">
            Qui non trovi classifiche né promozioni. Trovi storie vere e persone che bevono con attenzione.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-400 text-center">
            Carta del Bere Consapevole
          </h2>
          <div className="rounded-2xl border border-stone-600/60 bg-stone-900/70 backdrop-blur-md p-6 md:p-8 space-y-4 text-stone-200 leading-relaxed">
            <p>
              Questa community nasce per restituire valore a un gesto quotidiano: bere.
              Crediamo che il bere non sia una performance, ma una scelta.
              Non cerchiamo il consenso, ma il contesto.
              Non raccogliamo classifiche, ma esperienze.
            </p>
            <p>
              Lo Zio del Rum è uno spazio editoriale indipendente dove:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>ogni racconto nasce da un’esperienza reale</li>
              <li>ogni luogo viene rispettato prima di essere giudicato</li>
              <li>ogni contributo è basato su attenzione e responsabilità</li>
            </ul>
            <p>
              Riteniamo che il valore non sia nella quantità, ma nella qualità del tempo dedicato.
              Per questo:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>non promuoviamo contenuti costruiti</li>
              <li>non vendiamo visibilità</li>
              <li>non influenziamo i racconti</li>
              <li>non inseguiamo le tendenze</li>
            </ul>
            <p>
              Sosteniamo invece:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-300">
              <li>il dialogo tra chi beve e chi crea luoghi</li>
              <li>la cultura del bere come esperienza consapevole</li>
              <li>il rispetto reciproco tra community e proprietari</li>
            </ul>
            <p>
              Questa non è una piattaforma di intrattenimento rapido.
              È un luogo di osservazione, racconto e confronto.
            </p>
            <p className="pt-4 border-t border-stone-600/60 text-stone-100 font-medium">
              Entrare significa accettare una responsabilità semplice:
              <br />
              bere meno, ma bere meglio.
              <br />
              Con attenzione.
              <br />
              Con rispetto.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
