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
  const { data: financial } = useSupabaseData<any>('financial_transactions');
  const { data: orders } = useSupabaseData<any>('orders');

  // Mock data for charts if real data is empty
  const chartData = [
    { name: 'Seg', valor: 400 },
    { name: 'Ter', valor: 300 },
    { name: 'Qua', valor: 600 },
    { name: 'Qui', valor: 800 },
    { name: 'Sex', valor: 500 },
    { name: 'Sáb', valor: 900 },
    { name: 'Dom', valor: 200 },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Fev', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Abr', revenue: 4500 },
    { name: 'Mai', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];

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
          value="R$ 12.450" 
          icon={DollarSign} 
          trend="up" 
          trendValue="15%" 
          color="bg-green-500" 
        />
        <StatCard 
          title="Ticket Médio" 
          value="R$ 185" 
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
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">Cliente {i}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Corte & Escova</td>
                    <td className="px-6 py-4 text-sm text-gray-600">14:30</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700">
                        Confirmado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Atividade Recente</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Novo agendamento realizado</p>
                  <p className="text-xs text-gray-500 mt-0.5">Há 5 minutos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
