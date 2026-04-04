import "../App.css";
import { useUser } from "../context/UserContext";
import Auth from "./Auth";

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
    return <Auth />;
  }

  return (
    <div className="page fade-in" style={{ padding: 40 }}>
      <h1>Community</h1>
    </div>
  );
}