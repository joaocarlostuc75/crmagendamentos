import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, CalendarHeart, Sparkles, LineChart, Settings, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  return (
    <div className="min-h-screen pb-24 flex flex-col bg-[#f5f2ed]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
        <nav className="bg-white/80 backdrop-blur-2xl border border-white/40 px-2 py-3 flex justify-between items-center rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)]">
          <div className="flex justify-between items-center w-full px-1 sm:px-2 gap-1">
            <NavItem to="/app" icon={<Home size={20} />} label="Início" />
            <NavItem to="/app/schedule" icon={<CalendarHeart size={20} />} label="Agenda" />
            <NavItem to="/app/clients" icon={<Users size={20} />} label="Clientes" />
            <NavItem to="/app/services" icon={<Sparkles size={20} />} label="Serviços" />
            <NavItem to="/app/products" icon={<ShoppingBag size={20} />} label="Loja" />
            <NavItem to="/app/financial" icon={<LineChart size={20} />} label="Relatos" />
            <NavItem to="/app/settings" icon={<Settings size={20} />} label="Ajustes" />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => clsx(
        "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all relative group",
        isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-primary hover:bg-primary/5"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={clsx(
            "transition-transform duration-300", 
            isActive ? "scale-110" : "group-hover:scale-110"
          )}>
            {icon}
          </div>
          
          {/* Tooltip for non-active state on hover (desktop) or active state (mobile) */}
          <span className={clsx(
            "absolute -top-10 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all duration-300 pointer-events-none whitespace-nowrap",
            "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
            isActive ? "hidden" : "block"
          )}>
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </span>
        </>
      )}
    </NavLink>
  );
}
