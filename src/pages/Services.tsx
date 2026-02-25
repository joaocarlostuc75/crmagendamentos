import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Scissors, 
  Clock, 
  DollarSign, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X,
  Search,
  Tag
} from 'lucide-react';

export default function Services() {
  const { data: services, loading, insert, update, remove } = useSupabaseData<any>('services');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '60',
    category: 'Cabelo',
    image_url: ''
  });

  const handleOpenModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setNewService({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration.toString(),
        category: service.category || 'Cabelo',
        image_url: service.image_url || ''
      });
    } else {
      setEditingService(null);
      setNewService({ name: '', description: '', price: '', duration: '60', category: 'Cabelo', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      setNewService({ ...newService, image_url: data.publicUrl });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem. Certifique-se de que o Bucket "images" está configurado no Supabase.');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newService,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration)
      };

      if (editingService) {
        await update(editingService.id, payload);
      } else {
        await insert(payload);
      }
      setIsModalOpen(false);
      setNewService({ name: '', description: '', price: '', duration: '60', category: 'Cabelo', image_url: '' });
      setEditingService(null);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar serviço: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await remove(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir serviço.');
      }
    }
  };

  const filteredServices = services?.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 text-sm">Gerencie seu catálogo de serviços e preços.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> NOVO SERVIÇO
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar serviços por nome ou categoria..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Carregando serviços...</div>
        ) : filteredServices?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">Nenhum serviço encontrado.</div>
        ) : (
          filteredServices?.map((service: any) => (
            <div key={service.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <Scissors size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{service.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md mt-1">
                    {service.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">
                {service.description || 'Nenhuma descrição fornecida.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preço</span>
                  <span className="text-xl font-bold text-gray-900">R$ {service.price}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Duração</span>
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Clock size={14} className="text-primary" /> {service.duration} min
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(service)}
                  className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={14} /> EDITAR
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id)}
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
              <h3 className="text-xl font-bold text-gray-900">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddService} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ex: Corte Feminino"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    required
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Unhas">Unhas</option>
                    <option value="Estética">Estética</option>
                    <option value="Maquiagem">Maquiagem</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="0,00"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="60"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24"
                  placeholder="Descreva o que está incluso no serviço..."
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Serviço</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {newService.image_url ? (
                      <img src={newService.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Scissors className="text-gray-400" size={24} />
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
                  {editingService ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR SERVIÇO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
