import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Privacy() {
  return (
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to={createPageUrl("Home")}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Torna alla Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy e Cookie</h1>

        <div className="space-y-8 text-stone-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">1. Informativa sulla Privacy (GDPR)</h2>
            <p className="mb-4">
              Il presente sito web rispetta la privacy degli utenti e si impegna a proteggere i dati personali in conformità con il Regolamento (UE) 2016/679 (GDPR).
            </p>
            <h3 className="text-xl font-semibold text-stone-200 mb-3">Dati raccolti</h3>
            <p className="mb-4">
              Durante la registrazione e l'utilizzo del sito, possiamo raccogliere i seguenti dati:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Nome e cognome</li>
              <li>Indirizzo email</li>
              <li>Recensioni e contenuti pubblicati</li>
              <li>Dati di navigazione (cookie tecnici)</li>
            </ul>
            <h3 className="text-xl font-semibold text-stone-200 mb-3">Finalità del trattamento</h3>
            <p className="mb-4">
              I dati personali sono trattati per le seguenti finalità:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Gestione dell'account utente</li>
              <li>Pubblicazione di recensioni e contenuti</li>
              <li>Comunicazioni relative al servizio</li>
              <li>Miglioramento dell'esperienza utente</li>
            </ul>
            <h3 className="text-xl font-semibold text-stone-200 mb-3">Diritti dell'utente</h3>
            <p className="mb-4">
              L'utente ha diritto di:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Accedere ai propri dati personali</li>
              <li>Richiedere la rettifica o la cancellazione</li>
              <li>Limitare o opporsi al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">2. Cookie Policy</h2>
            <p className="mb-4">
              Questo sito utilizza cookie tecnici necessari al funzionamento e alla sicurezza del servizio.
            </p>
            <h3 className="text-xl font-semibold text-stone-200 mb-3">Tipologie di cookie utilizzati</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Cookie tecnici:</strong> Necessari per il funzionamento del sito e per la gestione della sessione utente</li>
              <li><strong>Cookie di preferenze:</strong> Memorizzano le preferenze dell'utente per migliorare l'esperienza di navigazione</li>
            </ul>
            <h3 className="text-xl font-semibold text-stone-200 mb-3">Gestione dei cookie</h3>
            <p>
              L'utente può gestire o disabilitare i cookie attraverso le impostazioni del proprio browser. 
              La disabilitazione dei cookie tecnici potrebbe limitare alcune funzionalità del sito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">3. Sicurezza dei dati</h2>
            <p>
              Il sito adotta misure di sicurezza tecniche e organizzative appropriate per proteggere i dati personali 
              da accessi non autorizzati, perdita, distruzione o alterazione.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">4. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di modificare questa informativa in qualsiasi momento. 
              Le modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">5. Contatti</h2>
            <p>
              Per esercitare i propri diritti o per qualsiasi domanda relativa al trattamento dei dati personali, 
              è possibile contattarci tramite l'indirizzo email fornito sul sito.
            </p>
          </section>

          <div className="border-t border-stone-800 pt-6 mt-8 text-sm text-stone-500">
            <p>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}