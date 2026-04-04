import "../App.css";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";

export default function Crea() {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
        <SignupInviteBox description="Registrati o accedi per creare contenuti e usare gli strumenti della sezione Crea." />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ padding: 40 }}>
      <h1>Crea</h1>
    </div>
  );
}