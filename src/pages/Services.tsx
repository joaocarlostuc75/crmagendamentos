import React, { useRef, useState } from 'react';
import { Search, Plus, Clock, Edit2, Trash2, Check, X, MoreVertical } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';
import { useSupabaseData } from '../hooks/useSupabase';

export default function Services() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: services, loading, insert, update, remove } = useSupabaseData<any>('services');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      await insert({
        name: "Novo Serviço",
        price: "R$ 0,00",
        duration: "60 min",
        img_url: imageUrl,
        description: "Descrição do novo serviço."
      });
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div>
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Serviços</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">Gestão de Catálogo</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32 overflow-y-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar serviço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100/50 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id}
              service={service}
              onUpdate={(updated) => update(service.id, updated)}
              onDelete={() => {
                remove(service.id).catch(err => {
                  alert('Não é possível excluir este serviço pois ele está vinculado a agendamentos existentes.');
                });
              }}
            />
          ))}
          {filteredServices.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">Nenhum serviço encontrado.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function ServiceCard({ service, onUpdate, onDelete }: { key?: React.Key, service: any, onUpdate: (s: any) => void, onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(service);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm(service);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-[2rem] shadow-md border border-primary/30 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border border-primary/20 relative">
            <WatermarkedImage src={editForm.img_url || "https://picsum.photos/150/150"} alt={editForm.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 space-y-3">
            <input 
              type="text" 
              value={editForm.name || ''} 
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 font-medium text-lg text-gray-900 outline-none"
              placeholder="Nome do Serviço"
            />
            <div className="flex gap-4">
              <input 
                type="text" 
                value={editForm.price || ''} 
                onChange={e => setEditForm({...editForm, price: e.target.value})}
                className="w-1/2 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-primary font-semibold outline-none"
                placeholder="Preço"
              />
              <input 
                type="text" 
                value={editForm.duration || ''} 
                onChange={e => setEditForm({...editForm, duration: e.target.value})}
                className="w-1/2 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-gray-500 outline-none"
                placeholder="Duração"
              />
            </div>
          </div>
        </div>
        <textarea 
          value={editForm.description || ''}
          onChange={e => setEditForm({...editForm, description: e.target.value})}
          className="w-full border border-gray-200 rounded-[1rem] p-4 text-sm text-gray-600 focus:border-primary focus:ring-0 resize-none h-24 outline-none"
          placeholder="Descrição do serviço"
        />
        <div className="flex justify-between items-center pt-2">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(window.confirm('Excluir este serviço?')) onDelete(); }} className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <Trash2 size={20} />
          </button>
          <div className="flex gap-3">
            <button onClick={handleCancel} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
              <X size={20} />
            </button>
            <button onClick={handleSave} className="w-10 h-10 flex items-center justify-center text-primary hover:text-white rounded-full bg-primary/10 hover:bg-primary transition-colors">
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col gap-4 group cursor-pointer hover:border-primary/30 transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-full overflow-hidden flex-shrink-0 border border-primary/20 relative transition-all duration-300 ${isExpanded ? 'h-20 w-20' : 'h-14 w-14'}`}>
          <WatermarkedImage src={service.img_url || "https://picsum.photos/150/150"} alt={service.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg text-gray-900 truncate">{service.name}</h3>
            {isExpanded && (
              <div className="flex gap-1">
                <button 
                  className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Excluir este serviço?')) onDelete();
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            {!isExpanded && (
              <button className="text-gray-300 hover:text-primary transition-colors p-1">
                <MoreVertical size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-primary font-semibold">{service.price}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40"></span>
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock size={14} /> {service.duration}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="pt-4 border-t border-gray-50 mt-2 transition-all duration-300">
          <p className="text-sm text-gray-600 leading-relaxed bg-[#f5f2ed] p-4 rounded-[1.5rem] border border-gray-100">
            {service.description}
          </p>
        </div>
      )}
    </div>
  );
}
