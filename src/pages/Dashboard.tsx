import React from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default function Dashboard() {
  const { data: appointments } = useSupabaseData<any>('appointments');
  const { data: clients } = useSupabaseData<any>('clients');
  const { data: services } = useSupabaseData<any>('services');
  const { data: financial } = useSupabaseData<any>('financial_transactions');
  const { data: orders } = useSupabaseData<any>('orders');

  const { data: collaborators } = useSupabaseData<any>('collaborators');

  const totalIncome = financial?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  const totalExpense = financial?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  const balance = totalIncome - totalExpense;

  const ticketMedio = appointments?.length ? (totalIncome / appointments.length).toFixed(2) : '0.00';

  const totalCommissions = appointments?.reduce((acc: number, app: any) => {
    if (app.status !== 'confirmed' || !app.collaborator_id) return acc;
    const service = services?.find((s: any) => s.id === app.service_id);
    const collaborator = collaborators?.find((c: any) => c.id === app.collaborator_id);
    if (!service || !collaborator) return acc;
    return acc + (service.price * (collaborator.commission / 100));
  }, 0) || 0;

  // Calculate appointments per day for the current week
  const getAppointmentsPerDay = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    appointments?.forEach((app: any) => {
      const date = new Date(app.date);
      const dayIndex = date.getDay();
      counts[dayIndex]++;
    });

    return days.map((day, index) => ({ name: day, valor: counts[index] }));
  };

  const chartData = getAppointmentsPerDay();

  // Calculate revenue per month for the current year
  const getRevenuePerMonth = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const revenues = new Array(12).fill(0);

    financial?.filter((t: any) => t.type === 'income').forEach((t: any) => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth();
      revenues[monthIndex] += t.amount;
    });

    return months.map((month, index) => ({ name: month, revenue: revenues[index] }));
  };

  const revenueData = getRevenuePerMonth();

  const recentAppointments = appointments?.slice(0, 5).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  const recentActivity = [...(appointments || []), ...(orders || [])]
    .sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Bem-vinda de volta ao seu centro de controle.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total de Clientes" 
          value={clients?.length || 0} 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Agendamentos" 
          value={appointments?.length || 0} 
          icon={Calendar} 
          trend="up" 
          trendValue="8%" 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Pedidos" 
          value={orders?.length || 0} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="5%" 
          color="bg-pink-500" 
        />
        <StatCard 
          title="Faturamento" 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          trend="up" 
          trendValue="15%" 
          color="bg-green-500" 
        />
        <StatCard 
          title="Comissões" 
          value={`R$ ${totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={Users} 
          trend="up" 
          trendValue="5%" 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${parseFloat(ticketMedio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          trend="down" 
          trendValue="3%" 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Faturamento Mensal</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A84B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C6A84B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C6A84B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Agendamentos por Dia</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="valor" fill="#C6A84B" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Próximos Agendamentos</h3>
            <button className="text-sm font-medium text-primary hover:underline">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Serviço</th>
                  <th className="px-6 py-3 font-medium">Horário</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAppointments.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum agendamento recente.</td></tr>
                ) : (
                  recentAppointments.map((app: any) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500">
                            <Users size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {clients?.find((c: any) => c.id === app.client_id)?.name || 'Cliente'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {services?.find((s: any) => s.id === app.service_id)?.name || 'Serviço'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Atividade Recente</h3>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma atividade recente.</p>
            ) : (
              recentActivity.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {item.customer_name ? <ShoppingBag size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.customer_name ? `Novo pedido de ${item.customer_name}` : `Novo agendamento`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(item.created_at || item.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
