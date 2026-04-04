import "../App.css";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";

export default function Community() {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Community</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Community</h1>
        <SignupInviteBox description="Registrati o accedi per pubblicare contenuti, commentare e partecipare alla community." />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ padding: 40 }}>
      <h1>Community</h1>
    </div>
  );
}