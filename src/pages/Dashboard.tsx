import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Scissors, TrendingUp, Bell, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    appointments: 0,
    services: 0,
    revenue: 'R$ 0,00'
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [clientsRes, appRes, servicesRes, profileRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      setStats({
        clients: clientsRes.count || 0,
        appointments: appRes.count || 0,
        services: servicesRes.count || 0,
        revenue: 'R$ 12.450,00' // Mock for now
      });
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-30 bg-background-light/80 glass-effect border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/settings" className="relative group">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-sm transition-transform group-active:scale-95">
                <img 
                  src={profile?.logo_url || "https://picsum.photos/100/100"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                <Star size={10} className="text-white fill-white" />
              </div>
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold gold-gradient-text leading-tight">Olá, {profile?.owner?.split(' ')[0] || 'Admin'}</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{profile?.name || 'Studio VIP Gold'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-32">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Users size={20} />} label="Clientes" value={stats.clients.toString()} color="bg-blue-500" />
          <StatCard icon={<Calendar size={20} />} label="Agenda" value={stats.appointments.toString()} color="bg-emerald-500" />
          <StatCard icon={<Scissors size={20} />} label="Serviços" value={stats.services.toString()} color="bg-amber-500" />
          <StatCard icon={<TrendingUp size={20} />} label="Receita" value={stats.revenue} color="bg-primary" />
        </div>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-800 tracking-tight">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <QuickAction icon={<Calendar size={24} />} label="Agenda" to="/schedule" />
            <QuickAction icon={<Users size={24} />} label="Clientes" to="/clients" />
            <QuickAction icon={<Scissors size={24} />} label="Serviços" to="/services" />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-800 tracking-tight">Atividade Recente</h2>
            <button className="text-xs font-bold text-primary uppercase tracking-widest">Ver Tudo</button>
          </div>
          <div className="bg-white rounded-3xl p-4 luxury-shadow border border-gray-50 space-y-4">
            <ActivityItem 
              title="Novo Agendamento" 
              desc="Mariana Oliveira - Cílios Fio a Fio" 
              time="Há 10 min" 
              icon={<Calendar size={16} />}
              color="bg-emerald-100 text-emerald-600"
            />
            <ActivityItem 
              title="Pagamento Recebido" 
              desc="Beatriz Santos - R$ 180,00" 
              time="Há 45 min" 
              icon={<TrendingUp size={16} />}
              color="bg-primary/20 text-primary"
            />
            <ActivityItem 
              title="Novo Cliente" 
              desc="Fernanda Lima cadastrada" 
              time="Há 2 horas" 
              icon={<Users size={16} />}
              color="bg-blue-100 text-blue-600"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] luxury-shadow border border-gray-50 flex flex-col gap-3">
      <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <Link to={to} className="bg-white p-4 rounded-3xl luxury-shadow border border-gray-50 flex flex-col items-center gap-2 hover:bg-primary/5 transition-colors group">
      <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function ActivityItem({ title, desc, time, icon, color }: { title: string, desc: string, time: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-800 truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
