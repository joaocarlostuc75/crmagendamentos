import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Instagram, Clock, Camera, Save, LogOut, ExternalLink, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [profile, setProfile] = useState<any>({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    instagram: "",
    opening_hours: "",
    logo_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({ ...profile, id: user.id, updated_at: new Date().toISOString() });

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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
            <h1 className="font-display text-2xl font-bold gold-gradient-text">Ajustes</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Configurações do Perfil</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-32">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Logo Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                <img 
                  src={profile.logo_url || "https://picsum.photos/200/200"} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
                <Camera className="text-white" size={32} />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-4 uppercase tracking-widest font-bold">Logotipo do Studio</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-primary" />
              <h3 className="font-display font-bold text-lg text-gray-900">Informações do Estabelecimento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Studio</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                    placeholder="Ex: Studio VIP Gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Responsável</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text" 
                    value={profile.owner}
                    onChange={e => setProfile({...profile, owner: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                    placeholder="Seu Nome"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text" 
                    value={profile.instagram}
                    onChange={e => setProfile({...profile, instagram: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                    placeholder="@seu_instagram"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input 
                  type="text" 
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                  placeholder="Rua, Número, Bairro, Cidade"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Horário de Funcionamento</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input 
                  type="text" 
                  value={profile.opening_hours}
                  onChange={e => setProfile({...profile, opening_hours: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                  placeholder="Ex: Seg-Sáb: 09:00 - 19:00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <a 
              href="/public" 
              target="_blank"
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-gray-100 hover:bg-primary/5 transition-all"
              title="Ver Página Pública"
            >
              <ExternalLink size={24} />
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
