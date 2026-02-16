import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AppDataProvider } from '@/lib/AppDataContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// IMPORTANTE: Importiamo le pagine di dettaglio
import DrinkDetail from "./pages/DrinkDetail";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import CommunityEventDetail from "./pages/CommunityEventDetail";
import EditVenue from "./pages/EditVenue";
import AdminDashboard from "./pages/AdminDashboard";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Se l'URL è in minuscolo (es. /magazine) redirect alla versione corretta (es. /Magazine)
function PageNotFoundOrRedirect() {
  const location = useLocation();
  const segment = (location.pathname.match(/^\/([^/]+)/) || [])[1] || '';
  const exactKey = Object.keys(Pages).find(p => p.toLowerCase() === segment.toLowerCase());
  if (exactKey && segment !== exactKey) {
    const rest = location.pathname.slice(1 + segment.length); // tutto dopo il primo segmento
    return <Navigate to={`/${exactKey}${rest ? '/' + rest : ''}${location.search}`} replace />;
  }
  return <PageNotFound />;
}

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Admin – PRIMA per evitare 404 */}
      <Route path="/admin" element={<LayoutWrapper currentPageName="AdminDashboard"><AdminDashboard /></LayoutWrapper>} />

      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />

      {/* EditVenue: SENZA Layout - bypass completo per sbloccare la modifica */}
      <Route 
        path="/EditVenue" 
        element={
          <div className="min-h-screen bg-stone-950 text-stone-100 edit-venue-page">
            <EditVenue />
          </div>
        } 
      />

      {/* Rotte generate automaticamente dal config (EditVenue ha route dedicata sopra) */}
      {Object.entries(Pages)
        .filter(([path]) => path !== "EditVenue")
        .map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}

      {/* Rotta dinamica: drink per id */}
      <Route 
        path="/drink/:id" 
        element={
          <LayoutWrapper currentPageName="DrinkDetail">
            <DrinkDetail />
          </LayoutWrapper>
        } 
      />

      {/* CommunityFeed – bacheca community */}
      <Route 
        path="/CommunityFeed" 
        element={
          <LayoutWrapper currentPageName="CommunityFeed">
            {Pages.CommunityFeed && <Pages.CommunityFeed />}
          </LayoutWrapper>
        } 
      />

      {/* CommunityFeed – dettaglio post (owner/user) */}
      <Route 
        path="/CommunityFeed/post/:type/:id" 
        element={
          <LayoutWrapper currentPageName="CommunityPostDetail">
            <CommunityPostDetail />
          </LayoutWrapper>
        } 
      />

      {/* CommunityFeed – dettaglio evento */}
      <Route 
        path="/CommunityFeed/event/:id" 
        element={
          <LayoutWrapper currentPageName="CommunityEventDetail">
            <CommunityEventDetail />
          </LayoutWrapper>
        } 
      />

      {/* 404 o redirect URL in minuscolo (es. /magazine -> /Magazine) */}
      <Route path="*" element={<PageNotFoundOrRedirect />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppDataProvider>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
        </AppDataProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App