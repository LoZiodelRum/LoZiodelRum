/**
 * Blocca l'accesso alle pagine che richiedono registrazione (AddReview, CommunityFeed).
 * Utenti non registrati: sola lettura. Redirect a Community per registrarsi.
 */
import { Navigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";

export default function RequireRegistration({ children }) {
  const { user } = useAppData();
  const location = useLocation();

  if (!user || !user.role) {
    return <Navigate to={createPageUrl("Community")} state={{ from: location.pathname }} replace />;
  }
  return children;
}
