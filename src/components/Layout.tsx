import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, ShoppingBag, DollarSign, Settings, Shield, Users as CollaboratorsIcon, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/schedule', icon: Calendar, label: 'Agenda' },
  { href: '/app/clients', icon: Users, label: 'Clientes' },
  { href: '/app/services', icon: ShoppingBag, label: 'Serviços' },
  { href: '/app/products', icon: ShoppingBag, label: 'Produtos' },
  { href: '/app/financial', icon: DollarSign, label: 'Financeiro' },
  { href: '/app/collaborators', icon: CollaboratorsIcon, label: 'Colaboradores' },
  { href: '/app/settings', icon: Settings, label: 'Ajustes' },
  { href: '/app/admin', icon: Shield, label: 'Admin' },
];

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">BeautyAgenda</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-md flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-primary">BeautyAgenda</h1>
        </div>
        
        {/* Mobile Menu Header inside Sidebar */}
        <div className="p-4 md:hidden flex justify-between items-center border-b">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 md:py-0 overflow-y-auto">
          <ul>
            {navItems.map(item => (
              <li key={item.href}>
                <Link 
                  to={item.href} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center p-3 my-1 rounded-lg transition-colors ${location.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
