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

  if (loading) return <div className="text-center p-4">Carregando estabelecimentos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro ao carregar dados.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">Nome</th>
            <th scope="col" className="px-6 py-3">Responsável</th>
            <th scope="col" className="px-6 py-3">Plano</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {profiles.map(profile => (
            <tr key={profile.id} className="bg-white border-b hover:bg-gray-50">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {profile.name}
              </th>
              <td className="px-6 py-4">{profile.owner}</td>
              <td className="px-6 py-4">{profile.plan_id || 'N/A'}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Ativo</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-400 hover:text-primary"><Eye size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-yellow-500"><Edit size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const { data: plans, loading, error, insert, update, remove } = useSupabaseData<any>('plans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  if (loading) return <div className="text-center p-4">Carregando planos...</div>;
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
      <div className="text-right mb-4">
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

const SystemFeaturesPanel = () => {
  const { data: features, loading, error, update } = useSupabaseData<any>('system_features');

  if (loading) return <div className="text-center p-4">Carregando features...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro ao carregar dados.</div>;

  const handleToggle = (feature: any) => {
    update(feature.id, { is_enabled: !feature.is_enabled });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200/80">
      {features.map(feature => (
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

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <TabButton active={activeTab === 'establishments'} onClick={() => setActiveTab('establishments')}>Estabelecimentos</TabButton>
            <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>Planos</TabButton>
            <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')}>System Features</TabButton>
          </div>
        </div>

        <div>
          {activeTab === 'establishments' && <EstablishmentsPanel />}
          {activeTab === 'plans' && <PlansPanel />}
          {activeTab === 'features' && <SystemFeaturesPanel />}
        </div>
      </main>
    </div>
  );
}
