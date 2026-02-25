import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { 
  Plus, 
  Users, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X,
  Mail,
  Phone,
  Calendar,
  Star
} from 'lucide-react';

export default function Collaborators() {
  const { data: collaborators, loading, insert, update, remove } = useSupabaseData<any>('collaborators');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Cabelo',
    commission: '30',
    image_url: ''
  });

  const handleOpenModal = (collab: any = null) => {
    if (collab) {
      setEditingCollaborator(collab);
      setNewCollaborator({
        name: collab.name,
        email: collab.email || '',
        phone: collab.phone || '',
        specialty: collab.specialty || 'Cabelo',
        commission: (collab.commission || '30').toString(),
        image_url: collab.image_url || ''
      });
    } else {
      setEditingCollaborator(null);
      setNewCollaborator({ name: '', email: '', phone: '', specialty: 'Cabelo', commission: '30', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCollaborator({ ...newCollaborator, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCollaborator,
        commission: parseFloat(newCollaborator.commission)
      };

      if (editingCollaborator) {
        await update(editingCollaborator.id, payload);
      } else {
        await insert(payload);
      }
      setIsModalOpen(false);
      setNewCollaborator({ name: '', email: '', phone: '', specialty: 'Cabelo', commission: '30', image_url: '' });
      setEditingCollaborator(null);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar colaborador: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await remove(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir colaborador.');
      }
    }
  };

  const filteredCollaborators = collaborators?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-500 text-sm">Gerencie sua equipe e comissões.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> NOVO COLABORADOR
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar colaboradores por nome ou especialidade..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Collaborators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Carregando colaboradores...</div>
        ) : filteredCollaborators?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">Nenhum colaborador encontrado.</div>
        ) : (
          filteredCollaborators?.map((collab: any) => (
            <div key={collab.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4 overflow-hidden">
                  {collab.image_url ? (
                    <img src={collab.image_url} alt={collab.name} className="w-full h-full object-cover" />
                  ) : (
                    (collab.name || '?').charAt(0)
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{collab.name}</h3>
                <span className="inline-block px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md mt-1">
                  {collab.specialty}
                </span>
              </div>

              <div className="space-y-3 mb-6 border-t border-gray-50 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-primary" />
                  <span>{collab.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-primary" />
                  <span className="truncate">{collab.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Star size={16} className="text-primary" />
                    <span>Comissão</span>
                  </div>
                  <span className="font-bold text-gray-900">{collab.commission}%</span>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(collab)}
                  className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={14} /> EDITAR
                </button>
                <button 
                  onClick={() => handleDeleteCollaborator(collab.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> EXCLUIR
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingCollaborator ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddCollaborator} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Nome do colaborador"
                  value={newCollaborator.name}
                  onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input 
                    type="email"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="colab@email.com"
                    value={newCollaborator.email}
                    onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="tel"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="(11) 99999-9999"
                    value={newCollaborator.phone}
                    onChange={(e) => setNewCollaborator({...newCollaborator, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newCollaborator.specialty}
                    onChange={(e) => setNewCollaborator({...newCollaborator, specialty: e.target.value})}
                    required
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Unhas">Unhas</option>
                    <option value="Estética">Estética</option>
                    <option value="Maquiagem">Maquiagem</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="30"
                    value={newCollaborator.commission}
                    onChange={(e) => setNewCollaborator({...newCollaborator, commission: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Colaborador</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {newCollaborator.image_url ? (
                      <img src={newCollaborator.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="text-gray-400" size={24} />
                    )}
                  </div>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-[1.02]"
                >
                  {editingCollaborator ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR COLABORADOR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
