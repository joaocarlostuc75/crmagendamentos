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
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="sticky top-0 z-30 bg-background-light/80 glass-effect border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold gold-gradient-text">Serviços</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Gestão de Catálogo</p>
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
            className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={20} />
          <input 
            type="text" 
            placeholder="Buscar serviço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-4">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id}
              service={service}
              onUpdate={(updated) => update(service.id, updated)}
              onDelete={() => remove(service.id)}
            />
          ))}
          {filteredServices.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum serviço encontrado.</p>
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
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/30 relative">
            <WatermarkedImage src={editForm.img_url || "https://picsum.photos/150/150"} alt={editForm.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 space-y-2">
            <input 
              type="text" 
              value={editForm.name} 
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 font-semibold text-lg text-gray-800"
              placeholder="Nome do Serviço"
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                value={editForm.price} 
                onChange={e => setEditForm({...editForm, price: e.target.value})}
                className="w-1/2 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-primary font-bold"
                placeholder="Preço"
              />
              <input 
                type="text" 
                value={editForm.duration} 
                onChange={e => setEditForm({...editForm, duration: e.target.value})}
                className="w-1/2 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-gray-500"
                placeholder="Duração"
              />
            </div>
          </div>
        </div>
        <textarea 
          value={editForm.description}
          onChange={e => setEditForm({...editForm, description: e.target.value})}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-600 focus:border-primary focus:ring-0 resize-none h-24"
          placeholder="Descrição do serviço"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
          <button onClick={handleSave} className="p-2 text-primary hover:text-primary-dark rounded-full hover:bg-primary/10 transition-colors">
            <Check size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-5 rounded-3xl shadow-sm border border-primary/20 flex flex-col gap-4 group cursor-pointer transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/30 relative transition-all duration-300 ${isExpanded ? 'h-24 w-24' : 'h-16 w-16'}`}>
          <WatermarkedImage src={service.img_url || "https://picsum.photos/150/150"} alt={service.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-gray-800">{service.name}</h3>
            {isExpanded && (
              <div className="flex gap-1">
                <button 
                  className="text-gray-400 hover:text-primary transition-colors p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Excluir este serviço?')) onDelete();
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            {!isExpanded && (
              <button className="text-gray-400 hover:text-primary transition-colors">
                <MoreVertical size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-primary font-bold">{service.price}</span>
            <span className="h-1 w-1 rounded-full bg-primary/40"></span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} /> {service.duration}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="pt-2 border-t border-gray-100 mt-2 transition-all duration-300">
          <p className="text-sm text-gray-600 leading-relaxed">
            {service.description}
          </p>
        </div>
      )}
    </div>
  );
}
