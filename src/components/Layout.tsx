import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, CalendarHeart, Sparkles, LineChart, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  return (
    <div className="min-h-screen pb-24 flex flex-col bg-background-light">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-primary/20 px-4 py-4 flex justify-between items-center z-50 rounded-t-3xl luxury-shadow">
        <NavItem to="/" icon={<Home size={22} />} label="Início" />
        <NavItem to="/clients" icon={<Users size={22} />} label="Clientes" />
        <NavItem to="/schedule" icon={<CalendarHeart size={22} />} label="Agenda" />
        <NavItem to="/services" icon={<Sparkles size={22} />} label="Serviços" />
        <NavItem to="/financial" icon={<LineChart size={22} />} label="Relatórios" />
        <NavItem to="/settings" icon={<Settings size={22} />} label="Ajustes" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => clsx(
        "flex flex-col items-center gap-1 transition-colors px-1",
        isActive ? "text-primary" : "text-gray-400 hover:text-primary-light"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={clsx(isActive && "font-bold", "transition-transform", isActive && "scale-110")}>{icon}</div>
          <span className={clsx("text-[9px] uppercase tracking-wider", isActive ? "font-bold" : "font-medium")}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
