import React, { useRef, useState } from 'react';
import { Search, Plus, Phone, Instagram, Mail, Edit2, Trash2, Check, X, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';
import { useSupabaseData } from '../hooks/useSupabase';

export default function Clients() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: clients, loading, insert, update, remove } = useSupabaseData<any>('clients');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      await insert({
        name: "Novo Cliente",
        phone: "",
        email: "",
        instagram: "",
        notes: "",
        img_url: imageUrl,
        points: 0
      });
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
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
            <h1 className="font-display text-2xl font-bold gold-gradient-text">Clientes</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Diretório VIP</p>
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
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-4">
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id}
              client={client}
              onUpdate={(updated) => update(client.id, updated)}
              onDelete={() => remove(client.id)}
            />
          ))}
          {filteredClients.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum cliente encontrado.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function ClientCard({ client, onUpdate, onDelete }: { key?: React.Key, client: any, onUpdate: (c: any) => void, onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(client);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm(client);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-primary flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/30 relative">
            <WatermarkedImage src={editForm.img_url || "https://picsum.photos/150/150"} alt={editForm.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              value={editForm.name} 
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 font-semibold text-lg text-gray-800"
              placeholder="Nome do Cliente"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 border-b border-gray-100 py-1">
            <Phone size={14} className="text-primary" />
            <input 
              type="text" 
              value={editForm.phone} 
              onChange={e => setEditForm({...editForm, phone: e.target.value})}
              className="w-full border-none focus:ring-0 p-0 text-sm"
              placeholder="Telefone"
            />
          </div>
          <div className="flex items-center gap-2 border-b border-gray-100 py-1">
            <Instagram size={14} className="text-primary" />
            <input 
              type="text" 
              value={editForm.instagram} 
              onChange={e => setEditForm({...editForm, instagram: e.target.value})}
              className="w-full border-none focus:ring-0 p-0 text-sm"
              placeholder="Instagram"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 py-1">
          <Mail size={14} className="text-primary" />
          <input 
            type="email" 
            value={editForm.email} 
            onChange={e => setEditForm({...editForm, email: e.target.value})}
            className="w-full border-none focus:ring-0 p-0 text-sm"
            placeholder="Email"
          />
        </div>
        <textarea 
          value={editForm.notes}
          onChange={e => setEditForm({...editForm, notes: e.target.value})}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-600 focus:border-primary focus:ring-0 resize-none h-20"
          placeholder="Observações e preferências..."
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
          <WatermarkedImage src={client.img_url || "https://picsum.photos/150/150"} alt={client.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-gray-800">{client.name}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  if (window.confirm('Excluir este cliente?')) onDelete();
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              {client.points} pontos
            </div>
            {client.phone && (
              <div className="text-xs text-gray-400 font-medium">{client.phone}</div>
            )}
          </div>
        </div>
        <div className="text-primary/40">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="pt-4 border-t border-gray-100 mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 gap-3">
            {client.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-primary" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.instagram && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Instagram size={16} className="text-primary" />
                <span>{client.instagram}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-primary" />
                <span>{client.email}</span>
              </div>
            )}
          </div>
          {client.notes && (
            <div className="bg-gray-50 p-3 rounded-2xl text-xs text-gray-500 leading-relaxed italic">
              "{client.notes}"
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${i < client.points ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'bg-gray-200'}`}
                    ></div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPoints = Math.max(0, (client.points || 0) - 1);
                      onUpdate({ ...client, points: newPoints });
                    }}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Remover ponto"
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPoints = Math.min(10, (client.points || 0) + 1);
                      onUpdate({ ...client, points: newPoints });
                    }}
                    className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    title="Adicionar ponto"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {client.points >= 10 ? '🎉 Bônus Disponível!' : `${10 - (client.points || 0)} para o próximo bônus`}
                </span>
                {client.points >= 10 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Confirmar resgate do bônus? Os pontos serão zerados.')) {
                        onUpdate({ ...client, points: 0 });
                      }
                    }}
                    className="text-[10px] bg-primary text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Resgatar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
