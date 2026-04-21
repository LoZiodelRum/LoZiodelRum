import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Home",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 5l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.5z"/><path stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/></svg>
    ),
    to: "/"
  },
  {
    label: "Mappa",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6l7.5-2.5M21 6l-7.5-2.5M3 6v13l7.5 2.5M3 6l7.5 2.5M21 6v13l-7.5 2.5M21 6l-7.5 2.5M12 21v-13"/></svg>
    ),
    to: "/mappa"
  },
  {
    label: "Crea",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
    ),
    to: "/crea"
  },
  {
    label: "Community",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/><circle cx="17" cy="11" r="4" stroke="#fff" strokeWidth="2"/></svg>
    ),
    to: "/community"
  },
  {
    label: "Profilo",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2"/><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a7 7 0 0 1 14 0v1"/></svg>
    ),
    to: "/profilo"
  }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-black/40 z-50 flex justify-around items-center h-[70px] px-2" style={{boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.18)'}}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.to)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive ? 'text-yellow-400' : 'text-white/70'}`}
            aria-label={item.label}
          >
            <span className="mb-1">{item.icon}</span>
            <span className={`text-xs font-semibold ${isActive ? 'text-yellow-400' : 'text-white/70'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
