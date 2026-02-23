import { useState } from 'react';
import { Bell, TrendingUp, Eye, Sparkles, Brush, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import WatermarkedImage from '../components/WatermarkedImage';

export default function Financial() {
  const [period, setPeriod] = useState<'semanal' | 'mensal' | 'anual'>('semanal');

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-50 px-6 pt-12 pb-4 bg-background-light/80 glass-effect">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-dark font-semibold mb-1">CRM Dashboard</p>
            <h1 className="text-3xl font-display font-bold italic text-gray-900">Desempenho Financeiro</h1>
          </div>
          <div className="p-2 rounded-full border border-primary/40">
            <Bell size={24} className="text-primary-dark" />
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8 pb-32">
        <div className="flex p-1 bg-primary/10 rounded-xl">
          <button 
            onClick={() => setPeriod('semanal')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${period === 'semanal' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500 hover:text-primary-dark'}`}
          >
            Semanal
          </button>
          <button 
            onClick={() => setPeriod('mensal')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${period === 'mensal' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500 hover:text-primary-dark'}`}
          >
            Mensal
          </button>
          <button 
            onClick={() => setPeriod('anual')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${period === 'anual' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500 hover:text-primary-dark'}`}
          >
            Anual
          </button>
        </div>

        <div className="relative overflow-hidden bg-white rounded-xl p-6 luxury-shadow border border-primary/10">
          <p className="text-sm text-gray-500 mb-1">Faturamento Total ({period})</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-display font-bold text-gray-900">
              {period === 'semanal' ? 'R$ 3.450,00' : period === 'mensal' ? 'R$ 14.850,00' : 'R$ 178.200,00'}
            </span>
            <span className="text-emerald-500 text-sm font-semibold flex items-center">
              <TrendingUp size={14} className="mr-1" /> {period === 'semanal' ? '8%' : period === 'mensal' ? '12%' : '24%'}
            </span>
          </div>

          <div className="flex items-end justify-between h-32 gap-2 mt-4">
            <div className="w-full bg-primary/20 rounded-t-sm h-[40%] hover:bg-primary transition-colors cursor-pointer"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[65%] hover:bg-primary transition-colors cursor-pointer"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[50%] hover:bg-primary transition-colors cursor-pointer"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[85%] hover:bg-primary transition-colors cursor-pointer"></div>
            <div className="w-full bg-primary rounded-t-sm h-[100%]"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[60%] hover:bg-primary transition-colors cursor-pointer"></div>
            <div className="w-full bg-primary/20 rounded-t-sm h-[75%] hover:bg-primary transition-colors cursor-pointer"></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            {period === 'semanal' ? (
              <><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span></>
            ) : period === 'mensal' ? (
              <><span>S1</span><span>S2</span><span>S3</span><span>S4</span></>
            ) : (
              <><span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span></>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border-l-4 border-primary shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-primary-dark font-bold mb-2">Ticket Médio</p>
            <p className="text-xl font-display font-bold">R$ 215,00</p>
            <p className="text-[10px] text-gray-400 mt-1">+R$ 15,00 vs ant.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border-l-4 border-primary shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-primary-dark font-bold mb-2">Novo Clientes</p>
            <p className="text-xl font-display font-bold">{period === 'semanal' ? '12' : period === 'mensal' ? '42' : '450'}</p>
            <p className="text-[10px] text-emerald-500 mt-1">Meta atingida!</p>
          </div>
        </div>

        <div className="relative p-[1px] rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-light to-primary-dark"></div>
          <div className="relative bg-white rounded-[11px] p-6 text-center">
            <p className="text-xs font-semibold text-primary-dark tracking-[0.3em] uppercase mb-4">Serviço de Destaque</p>
            <div className="flex flex-col items-center">
              <WatermarkedImage 
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Highlight" 
                className="w-16 h-16 rounded-full border-2 border-primary/40 object-cover mb-3 shadow-lg" 
              />
              <h3 className="text-2xl font-display italic text-gray-900 mb-1">Volume Russo</h3>
              <p className="text-sm text-gray-500">45% do faturamento total</p>
            </div>
          </div>
        </div>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900">Receita por Serviço</h2>
            <Link to="/services" className="text-xs font-semibold text-primary-dark uppercase tracking-wider">Ver todos</Link>
          </div>
          <div className="space-y-4">
            <ServiceRevenueCard 
              name="Volume Russo" 
              count="62 Procedimentos" 
              revenue="R$ 6.680" 
              percentage={45} 
              icon={<Eye size={20} className="text-primary-dark" />} 
            />
            <ServiceRevenueCard 
              name="Lash Egípcio" 
              count="48 Procedimentos" 
              revenue="R$ 4.200" 
              percentage={28} 
              icon={<Sparkles size={20} className="text-primary-dark" />} 
            />
            <ServiceRevenueCard 
              name="Cílios Fio a Fio" 
              count="35 Procedimentos" 
              revenue="R$ 3.970" 
              percentage={27} 
              icon={<Brush size={20} className="text-primary-dark" />} 
            />
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900">Receita por Produto</h2>
            <Link to="/products" className="text-xs font-semibold text-primary-dark uppercase tracking-wider">Ver todos</Link>
          </div>
          <div className="space-y-4">
            <ServiceRevenueCard 
              name="Perfume Capilar" 
              count="24 Unidades" 
              revenue="R$ 1.200" 
              percentage={60} 
              icon={<ShoppingBag size={20} className="text-primary-dark" />} 
            />
            <ServiceRevenueCard 
              name="Sérum Crescimento" 
              count="15 Unidades" 
              revenue="R$ 800" 
              percentage={40} 
              icon={<ShoppingBag size={20} className="text-primary-dark" />} 
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function ServiceRevenueCard({ name, count, revenue, percentage, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-[10px] text-gray-400">{count}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm">{revenue}</p>
        <div className="w-24 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div className="bg-primary h-full" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
