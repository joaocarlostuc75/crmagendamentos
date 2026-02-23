import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Scissors, TrendingUp, Bell, Search, Star, ChevronRight, Activity } from 'lucide-react';
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
      <div className="flex items-center justify-center h-full bg-[#f5f2ed]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f2ed]">
      <header className="sticky top-0 z-30 bg-[#f5f2ed]/90 backdrop-blur-xl border-b border-primary/10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/settings" className="relative group">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-primary/20 shadow-sm transition-transform group-active:scale-95">
                <img 
                  src={profile?.logo_url || "https://picsum.photos/100/100"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#f5f2ed]"></div>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">
                Olá, <span className="italic text-primary">{profile?.owner?.split(' ')[0] || 'Admin'}</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">{profile?.name || 'Studio VIP Gold'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30 transition-all relative shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-32 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Users size={18} />} label="Clientes" value={stats.clients.toString()} />
          <StatCard icon={<Calendar size={18} />} label="Agendamentos" value={stats.appointments.toString()} />
          <StatCard icon={<Scissors size={18} />} label="Serviços" value={stats.services.toString()} />
          <StatCard icon={<TrendingUp size={18} />} label="Receita" value={stats.revenue} highlight />
        </div>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-medium text-gray-900">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <QuickAction icon={<Calendar size={22} />} label="Agenda" to="/schedule" />
            <QuickAction icon={<Users size={22} />} label="Clientes" to="/clients" />
            <QuickAction icon={<Scissors size={22} />} label="Serviços" to="/services" />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-medium text-gray-900">Atividade Recente</h2>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
              Ver Tudo <ChevronRight size={12} />
            </button>
          </div>
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100/50 space-y-5">
            <ActivityItem 
              title="Novo Agendamento" 
              desc="Mariana Oliveira - Cílios Fio a Fio" 
              time="Há 10 min" 
              icon={<Calendar size={16} />}
              color="bg-primary/10 text-primary"
            />
            <div className="h-[1px] w-full bg-gray-50"></div>
            <ActivityItem 
              title="Pagamento Recebido" 
              desc="Beatriz Santos - R$ 180,00" 
              time="Há 45 min" 
              icon={<TrendingUp size={16} />}
              color="bg-green-50 text-green-600"
            />
            <div className="h-[1px] w-full bg-gray-50"></div>
            <ActivityItem 
              title="Novo Cliente" 
              desc="Fernanda Lima cadastrada" 
              time="Há 2 horas" 
              icon={<Users size={16} />}
              color="bg-blue-50 text-blue-600"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-[2rem] border transition-all ${highlight ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-900 border-gray-100/50 shadow-sm'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${highlight ? 'bg-white/20 text-white' : 'bg-gray-50 text-primary border border-gray-100'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] uppercase tracking-[0.15em] font-semibold mb-1 ${highlight ? 'text-white/80' : 'text-gray-400'}`}>{label}</p>
        <p className="text-2xl font-display font-medium tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <Link to={to} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function ActivityItem({ title, desc, time, icon, color }: { title: string, desc: string, time: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate mt-0.5">{desc}</p>
      </div>
      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap uppercase tracking-wider">{time}</span>
    </div>
  );
}
