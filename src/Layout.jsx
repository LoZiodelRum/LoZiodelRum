import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
        Home, 
        MapPin, 
        Search, 
        PlusCircle, 
        User, 
        Wine,
        Menu,
        X,
        BookOpen
      } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "@/lib/AppDataContext";
import { PenLine } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const { user } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Mappa", icon: MapPin, page: "Map" },
    { name: "Drink", icon: Wine, page: "Drinks" },
    { name: "Magazine", icon: BookOpen, page: "Magazine" },
    { name: "Community", icon: User, page: "Community" },
  ];

  const adminNavItems = user?.role === 'admin' 
    ? [
        { name: "Dashboard", icon: User, page: "Dashboard" },
        { name: "Scrivi articolo", icon: PenLine, page: "AddArticle" },
      ]
    : [];

  const mobileNavItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Drink", icon: Wine, page: "Drinks" },
    { name: "Magazine", icon: BookOpen, page: "Magazine" },
    { name: "Community", icon: User, page: "Community" },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <style>{`
        :root {
          --color-primary: #f59e0b;
          --color-primary-dark: #d97706;
        }
        
        body {
          background: #0c0a09;
        }
        
        .glass-card {
          background: rgba(28, 25, 23, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(68, 64, 60, 0.3);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          [role="option"] {
            color: #e7e5e4 !important;
          }

          [role="option"]:hover,
          [role="option"][data-highlighted] {
            background-color: #2d2d2d !important;
            color: #fbbf24 !important;
          }
        `}</style>

      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 glass-card border-b border-stone-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Lo Zio del Rum" 
                className="h-14 w-auto brightness-110 saturate-110"
              />
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive(item.page)
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              {adminNavItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive(item.page)
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to={createPageUrl("AddReview")}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Recensione
              </Link>
              <Link
                to={createPageUrl("Profile")}
                className={`p-2 rounded-xl transition-all ${
                  isActive("Profile")
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
                }`}
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-stone-800/50 safe-top safe-left safe-right">
        <div className="flex items-center justify-between px-4 min-[480px]:px-6 h-14 min-h-[56px]">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Lo Zio del Rum" 
              className="h-10 w-auto brightness-110 saturate-110"
            />
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-400"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-stone-800/50"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.page)
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-stone-400 hover:bg-stone-800/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                {adminNavItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.page)
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-stone-400 hover:bg-stone-800/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <Link
                  to={createPageUrl("AddReview")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-amber-500 text-stone-950 font-semibold rounded-xl"
                >
                  <PlusCircle className="w-5 h-5" />
                  Scrivi Recensione
                </Link>
                <Link
                  to={createPageUrl("Profile")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-stone-800/50 rounded-xl"
                >
                  <User className="w-5 h-5" />
                  Profilo
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-14 lg:pt-16 pb-28 lg:pb-12 min-h-screen safe-top safe-left safe-right safe-bottom">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-stone-800/50 safe-bottom safe-left safe-right">
        <div className="flex items-center h-16 min-h-[64px] px-2">
          <div className="flex items-center justify-around flex-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                  isActive(item.page)
                    ? "text-amber-400"
                    : "text-stone-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            ))}
            <Link
              to={createPageUrl("Profile")}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${
                isActive("Profile") ? "text-amber-400" : "text-stone-500"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profilo</span>
            </Link>
          </div>
          <Link
            to={createPageUrl("AddReview")}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center -mt-4 shadow-lg shadow-amber-500/30">
              <PlusCircle className="w-6 h-6 text-stone-950" />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}