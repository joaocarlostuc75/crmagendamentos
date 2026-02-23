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
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Clientes</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">Diretório VIP</p>
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
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100/50 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id}
              client={client}
              onUpdate={(updated) => update(client.id, updated)}
              onDelete={() => {
                remove(client.id).catch(err => {
                  alert('Não é possível excluir este cliente pois ele está vinculado a agendamentos existentes.');
                });
              }}
            />
          ))}
          {filteredClients.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">Nenhum cliente encontrado.</p>
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
      <div className="bg-white p-5 rounded-[2rem] shadow-md border border-primary/30 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border border-primary/20 relative">
            <WatermarkedImage src={editForm.img_url || "https://picsum.photos/150/150"} alt={editForm.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              value={editForm.name || ''} 
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 font-medium text-lg text-gray-900 outline-none"
              placeholder="Nome do Cliente"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 border-b border-gray-100 py-1">
            <Phone size={14} className="text-primary" />
            <input 
              type="text" 
              value={editForm.phone || ''} 
              onChange={e => setEditForm({...editForm, phone: e.target.value})}
              className="w-full border-none focus:ring-0 p-0 text-sm outline-none"
              placeholder="Telefone"
            />
          </div>
          <div className="flex items-center gap-2 border-b border-gray-100 py-1">
            <Instagram size={14} className="text-primary" />
            <input 
              type="text" 
              value={editForm.instagram || ''} 
              onChange={e => setEditForm({...editForm, instagram: e.target.value})}
              className="w-full border-none focus:ring-0 p-0 text-sm outline-none"
              placeholder="Instagram"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 py-1">
          <Mail size={14} className="text-primary" />
          <input 
            type="email" 
            value={editForm.email || ''} 
            onChange={e => setEditForm({...editForm, email: e.target.value})}
            className="w-full border-none focus:ring-0 p-0 text-sm outline-none"
            placeholder="Email"
          />
        </div>
        <textarea 
          value={editForm.notes || ''}
          onChange={e => setEditForm({...editForm, notes: e.target.value})}
          className="w-full border border-gray-200 rounded-[1rem] p-4 text-sm text-gray-600 focus:border-primary focus:ring-0 resize-none h-24 outline-none"
          placeholder="Observações e preferências..."
        />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={handleCancel} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
          <button onClick={handleSave} className="w-10 h-10 flex items-center justify-center text-primary hover:text-white rounded-full bg-primary/10 hover:bg-primary transition-colors">
            <Check size={20} />
          </button>
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
          <WatermarkedImage src={client.img_url || "https://picsum.photos/150/150"} alt={client.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg text-gray-900 truncate">{client.name}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  if (window.confirm('Excluir este cliente?')) onDelete();
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              {client.points} pontos
            </div>
            {client.phone && (
              <div className="text-xs text-gray-400 font-medium">{client.phone}</div>
            )}
          </div>
        </div>
        <div className="text-gray-300 group-hover:text-primary/50 transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="pt-4 border-t border-gray-50 mt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
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
            <div className="bg-[#f5f2ed] p-4 rounded-[1.5rem] text-xs text-gray-600 leading-relaxed italic border border-gray-100">
              "{client.notes}"
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${i < client.points ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-gray-100'}`}
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
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-100"
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
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    title="Adicionar ponto"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.15em]">
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
                    className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors shadow-sm"
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
