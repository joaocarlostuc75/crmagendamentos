import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X,
  Filter,
  MessageCircle
} from 'lucide-react';

export default function Clients() {
  const { data: clients, loading, insert, update, remove } = useSupabaseData<any>('clients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleOpenModal = (client: any = null) => {
    if (client) {
      setEditingClient(client);
      setNewClient({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setNewClient({ name: '', email: '', phone: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await update(editingClient.id, newClient);
      } else {
        await insert(newClient);
      }
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', phone: '', notes: '' });
      setEditingClient(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await remove(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const filteredClients = clients?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm">Gerencie sua base de clientes e histórico.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> NOVO CLIENTE
        </button>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={20} /> Filtros
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Carregando clientes...</div>
        ) : filteredClients?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">Nenhum cliente encontrado.</div>
        ) : (
          filteredClients?.map((client: any) => (
            <div key={client.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={() => handleOpenModal(client)}
                  className="p-2 text-gray-400 hover:text-primary"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Cliente VIP</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-primary" />
                  <span>{client.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-primary" />
                  <span className="truncate">{client.email || 'Não informado'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(client)}
                  className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={14} /> EDITAR
                </button>
                <a 
                  href={`https://wa.me/55${client.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-primary/10 text-primary py-2 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} /> WHATSAPP
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Nome do cliente"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="cliente@email.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="tel"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="(11) 99999-9999"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24"
                  placeholder="Alergias, preferências, etc."
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-[1.02]"
                >
                  {editingClient ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR CLIENTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
