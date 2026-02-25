import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { Eye, Edit, Trash2, PlusCircle, ToggleLeft, ToggleRight, Shield, BarChart, Settings, Package, Server, Check, X } from 'lucide-react';

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
    {children}
  </button>
);

const EstablishmentsPanel = () => {
  const { data: profiles, loading, error } = useSupabaseData<any>('profiles');

  if (loading) return <div className="text-center p-8 text-gray-500">Carregando estabelecimentos...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Erro ao carregar dados.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4 font-bold">Nome</th>
              <th scope="col" className="px-6 py-4 font-bold">Responsável</th>
              <th scope="col" className="px-6 py-4 font-bold">Plano</th>
              <th scope="col" className="px-6 py-4 font-bold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map(profile => (
              <tr key={profile.id} className="bg-white hover:bg-gray-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                  {profile.name}
                </th>
                <td className="px-6 py-4 whitespace-nowrap">{profile.owner}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">
                    {profile.plan_id || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-800">Ativo</span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Eye size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"><Edit size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PlanModal = ({ plan, onClose, onSave }: { plan: any, onClose: () => void, onSave: (plan: any) => void }) => {
  const [editedPlan, setEditedPlan] = useState(plan);

  useEffect(() => {
    setEditedPlan(plan);
  }, [plan]);

  const handleSave = () => {
    onSave(editedPlan);
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPlan({ ...editedPlan, features: e.target.value.split('\n') });
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{plan.id ? 'Editar Plano' : 'Criar Novo Plano'}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome do Plano</label>
            <input 
              type="text" 
              value={editedPlan.name || ''}
              onChange={e => setEditedPlan({ ...editedPlan, name: e.target.value })}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Preço</label>
            <input 
              type="number" 
              value={editedPlan.price || ''}
              onChange={e => setEditedPlan({ ...editedPlan, price: parseFloat(e.target.value) })}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Features (uma por linha)</label>
            <textarea 
              value={editedPlan.features?.join('\n') || ''}
              onChange={handleFeatureChange}
              className="w-full mt-1 p-2 border rounded-md h-32"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">Salvar</button>
        </div>
      </div>
    </div>
  )
}

const PlansPanel = () => {
  const { data: plans, loading, error, insert, update, remove, refresh } = useSupabaseData<any>('plans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const defaultPlans = [
    { name: 'Básico', price: 49.90, features: ['Até 100 agendamentos/mês', '1 Colaborador', 'Suporte por E-mail'], is_active: true },
    { name: 'Profissional', price: 99.90, features: ['Agendamentos ilimitados', 'Até 5 Colaboradores', 'Suporte WhatsApp', 'Relatórios Básicos'], is_active: true },
    { name: 'Premium', price: 199.90, features: ['Tudo do Profissional', 'Colaboradores ilimitados', 'Relatórios Avançados', 'Marketing Integrado'], is_active: true }
  ];

  const handleCreateDefaults = async () => {
    for (const dp of defaultPlans) {
      if (!plans.find(p => p.name === dp.name)) {
        await insert(dp);
      }
    }
    await refresh();
  };

  if (loading && !plans.length) return <div className="text-center p-4">Carregando planos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro ao carregar dados.</div>;

  const handleOpenModal = (plan: any = {}) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(false);
  };

  const handleSavePlan = async (plan: any) => {
    if (plan.id) {
      await update(plan.id, plan);
    } else {
      await insert(plan);
    }
    handleCloseModal();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {plans.length === 0 && (
          <button 
            onClick={handleCreateDefaults}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-300 transition-colors"
          >
            CRIAR PLANOS PADRÃO
          </button>
        )}
        <button onClick={() => handleOpenModal()} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm ml-auto">
          <PlusCircle size={16} />
          Criar Novo Plano
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200/80 flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-primary">{plan.name}</h3>
              <div className="text-2xl font-bold text-gray-800">R${plan.price}</div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Plano {plan.is_active ? 'Ativo' : 'Inativo'}</p>
            <ul className="text-sm text-gray-600 space-y-2 flex-grow mb-6">
              {plan.features?.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 mt-auto">
              <button onClick={() => handleOpenModal(plan)} className="p-2 text-gray-400 hover:text-yellow-500"><Edit size={16} /></button>
              <button onClick={() => remove(plan.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <PlanModal plan={selectedPlan} onClose={handleCloseModal} onSave={handleSavePlan} />}
    </div>
  );
}

const SettingsPanel = () => {
  const { data: features, loading, error, update, insert, refresh } = useSupabaseData<any>('system_features');
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (features) {
      const newSettings: { [key: string]: string } = {};
      features.forEach(f => {
        if (f.name.startsWith('setting_')) {
          newSettings[f.name] = f.description || '';
        }
      });
      setSettings(newSettings);
    }
  }, [features]);

  if (loading && !features.length) return <div className="text-center p-4">Carregando configurações...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro ao carregar dados.</div>;

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const feature = features.find(f => f.name === key);
      if (feature) {
        await update(feature.id, { description: value });
      } else {
        await insert({ name: key, description: value, is_enabled: true });
        await refresh(); // Refresh to get the new ID
      }
      alert('Configuração salva com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configuração.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações de Contato (Landing Page)</h3>
      
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={settings['setting_phone'] || ''} 
              onChange={(e) => setSettings(prev => ({ ...prev, 'setting_phone': e.target.value }))}
              placeholder="(11) 99999-9999"
              className="flex-1 p-2 border rounded-md"
            />
            <button 
              onClick={() => handleSave('setting_phone', settings['setting_phone'])}
              disabled={savingKey === 'setting_phone'}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {savingKey === 'setting_phone' ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={settings['setting_instagram'] || ''} 
              onChange={(e) => setSettings(prev => ({ ...prev, 'setting_instagram': e.target.value }))}
              placeholder="@seuinstagram"
              className="flex-1 p-2 border rounded-md"
            />
            <button 
              onClick={() => handleSave('setting_instagram', settings['setting_instagram'])}
              disabled={savingKey === 'setting_instagram'}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {savingKey === 'setting_instagram' ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={settings['setting_website'] || ''} 
              onChange={(e) => setSettings(prev => ({ ...prev, 'setting_website': e.target.value }))}
              placeholder="seuwebsite.com"
              className="flex-1 p-2 border rounded-md"
            />
            <button 
              onClick={() => handleSave('setting_website', settings['setting_website'])}
              disabled={savingKey === 'setting_website'}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {savingKey === 'setting_website' ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SystemFeaturesPanel = () => {
  const { data: features, loading, error, update, insert, refresh } = useSupabaseData<any>('system_features');

  const defaultFeatures = [
    { name: 'Agendamento Online', description: 'Permite que clientes agendem pelo link público.' },
    { name: 'Notificações WhatsApp', description: 'Envia lembretes automáticos via WhatsApp.' },
    { name: 'Gestão de Estoque', description: 'Controle de produtos e alertas de estoque baixo.' },
    { name: 'Relatórios Financeiros', description: 'Gráficos e relatórios de faturamento.' },
    { name: 'Multi-Colaboradores', description: 'Suporte para múltiplos profissionais.' }
  ];

  const handleToggle = (feature: any) => {
    update(feature.id, { is_enabled: !feature.is_enabled });
  };

  const handleCreateDefaults = async () => {
    for (const df of defaultFeatures) {
      if (!features.find(f => f.name === df.name)) {
        await insert({ ...df, is_enabled: true });
      }
    }
    await refresh();
  };

  if (loading && !features.length) return <div className="text-center p-4">Carregando features...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro ao carregar dados.</div>;

  // Filter out settings from this view
  const displayFeatures = features.filter(f => !f.name.startsWith('setting_'));

  return (
    <div className="space-y-4">
      {displayFeatures.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma feature do sistema cadastrada.</p>
          <button 
            onClick={handleCreateDefaults}
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold"
          >
            CRIAR FEATURES PADRÃO
          </button>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200/80">
        {displayFeatures.map(feature => (
          <div key={feature.id} className="p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">{feature.name}</h4>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
            <button onClick={() => handleToggle(feature)} className={`transition-colors ${feature.is_enabled ? 'text-green-500' : 'text-gray-400'}`}>
              {feature.is_enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('establishments');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200/80 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Super Admin</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Gerenciamento da Plataforma</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl whitespace-nowrap">
            <TabButton active={activeTab === 'establishments'} onClick={() => setActiveTab('establishments')}>Estabelecimentos</TabButton>
            <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>Planos</TabButton>
            <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')}>System Features</TabButton>
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Configurações</TabButton>
          </div>
        </div>

        <div>
          {activeTab === 'establishments' && <EstablishmentsPanel />}
          {activeTab === 'plans' && <PlansPanel />}
          {activeTab === 'features' && <SystemFeaturesPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}
