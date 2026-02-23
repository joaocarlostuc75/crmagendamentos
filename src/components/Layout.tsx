import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, ShoppingBag, DollarSign, Settings, Shield, Users as CollaboratorsIcon } from 'lucide-react';

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

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">BeautyAgenda</h1>
        </div>
        <nav className="flex-1 px-4">
          <ul>
            {navItems.map(item => (
              <li key={item.href}>
                <Link 
                  to={item.href} 
                  className={`flex items-center p-3 my-1 rounded-lg transition-colors ${location.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
