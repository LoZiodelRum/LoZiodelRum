import { Link } from "react-router-dom";

type SignupInviteBoxProps = {
  title?: string;
  description?: string;
};

export default function SignupInviteBox({
  title = "Non sei ancora iscritto?",
  description = "Registrati o accedi per partecipare alla community.",
}: SignupInviteBoxProps) {
  return (
    <section className="guest-register-box" aria-label="Invito iscrizione">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="guest-register-actions">
        <Link className="guest-register-btn guest-register-btn-primary" to="/registrati">
          Registrati
        </Link>
        <Link className="guest-register-btn guest-register-btn-secondary" to="/auth">
          Accedi
        </Link>
      </div>
    </section>
  );
}