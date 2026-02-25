import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Instagram, Clock, Camera, Save, LogOut, ExternalLink, Shield, AlignLeft, CalendarOff, Plus, Trash2, Truck, Copy, UserPlus, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Settings() {
  const [profile, setProfile] = useState<any>({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    instagram: "",
    opening_hours: "",
    logo_url: "",
    slug: ""
  });
  
  const [localLogo, setLocalLogo] = useLocalStorage('beauty_agenda_local_logo', '');

  const [extraSettings, setExtraSettings] = useLocalStorage('beauty_agenda_extra_settings', { 
    description: '', 
    blockedPeriods: [] as {start: string, end: string, reason: string}[],
    intervals: [] as {start: string, end: string, label: string}[]
  });

  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Férias');
  
  const [newIntervalStart, setNewIntervalStart] = useState('12:00');
  const [newIntervalEnd, setNewIntervalEnd] = useState('13:00');
  const [newIntervalLabel, setNewIntervalLabel] = useState('Almoço');

  const [deliveryFee, setDeliveryFee] = useLocalStorage('delivery_fee', 15.00);

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
      if (data) {
        setProfile({
          ...data,
          logo_url: data.logo_url || localLogo
        });
      }
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
      if (!user) {
        alert('Usuário não autenticado.');
        return;
      }

      // Remove fields that might cause issues if they don't exist in the DB
      const { created_at, updated_at, slug, ...profileToSave } = profile;

      const attemptSave = async (payload: any): Promise<void> => {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            ...payload, 
            id: user.id, 
            updated_at: new Date().toISOString() 
          });

        if (error) {
          if (error.code === '42703') {
            const match = error.message.match(/column "([^"]+)"/);
            const missingColumn = match ? match[1] : null;
            if (missingColumn && payload[missingColumn] !== undefined) {
              console.warn(`Removing missing column "${missingColumn}" from profile save`);
              const { [missingColumn]: _, ...newPayload } = payload;
              return attemptSave(newPayload);
            }
          }
          throw error;
        }
      };

      await attemptSave(profileToSave);
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert(`Erro ao salvar perfil: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = () => {
    if (newBlockStart && newBlockEnd) {
      setExtraSettings({
        ...extraSettings,
        blockedPeriods: [...(extraSettings.blockedPeriods || []), { start: newBlockStart, end: newBlockEnd, reason: newBlockReason }]
      });
      setNewBlockStart('');
      setNewBlockEnd('');
      setNewBlockReason('Férias');
    }
  };

  const handleRemoveBlock = (index: number) => {
    const newBlocks = [...extraSettings.blockedPeriods];
    newBlocks.splice(index, 1);
    setExtraSettings({
      ...extraSettings,
      blockedPeriods: newBlocks
    });
  };

  const handleAddInterval = () => {
    if (newIntervalStart && newIntervalEnd) {
      setExtraSettings({
        ...extraSettings,
        intervals: [...(extraSettings.intervals || []), { start: newIntervalStart, end: newIntervalEnd, label: newIntervalLabel }]
      });
    }
  };

  const handleRemoveInterval = (index: number) => {
    const newIntervals = [...extraSettings.intervals];
    newIntervals.splice(index, 1);
    setExtraSettings({
      ...extraSettings,
      intervals: newIntervals
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/p/${profile.slug}`;
    navigator.clipboard.writeText(link);
    alert('Link da página pública copiado!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfile({ ...profile, logo_url: base64 });
        setLocalLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

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
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Ajustes</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">Configurações do Perfil</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-32 overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border border-primary/20 shadow-md bg-white">
                <img 
                  src={profile.logo_url || "https://picsum.photos/200/200"} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Camera className="text-white" size={28} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-[0.15em] font-semibold">Logotipo do Studio</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={20} />
              </div>
              <h3 className="font-display font-medium text-lg text-gray-900">Informações do Estabelecimento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Nome do Studio</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.name || ''}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                    placeholder="Ex: Beauty Agenda"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Responsável</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.owner || ''}
                    onChange={e => setProfile({...profile, owner: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                    placeholder="Seu Nome"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">WhatsApp Oficial (Notificações)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.phone || ''}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={profile.instagram || ''}
                    onChange={e => setProfile({...profile, instagram: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                    placeholder="@seu_instagram"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={profile.address || ''}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                  placeholder="Rua, Número, Bairro, Cidade"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Horário de Funcionamento</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={profile.opening_hours || ''}
                  onChange={e => setProfile({...profile, opening_hours: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                  placeholder="Ex: Seg-Sáb: 09:00 - 19:00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Descrição do Estabelecimento</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea 
                  value={extraSettings.description || ''}
                  onChange={e => setExtraSettings({...extraSettings, description: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100 bg-[#f5f2ed]/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all min-h-[120px] text-sm text-gray-700 resize-none"
                  placeholder="Conte um pouco sobre o seu studio..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarOff size={20} />
              </div>
              <h3 className="font-display font-medium text-lg text-gray-900">Bloqueios de Agenda</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#f5f2ed]/50 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Início</label>
                  <input 
                    type="date" 
                    value={newBlockStart}
                    onChange={e => setNewBlockStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Fim</label>
                  <input 
                    type="date" 
                    value={newBlockEnd}
                    onChange={e => setNewBlockEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Motivo</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newBlockReason}
                      onChange={e => setNewBlockReason(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                      placeholder="Ex: Férias"
                    />
                    <button 
                      type="button"
                      onClick={handleAddBlock}
                      className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {extraSettings.blockedPeriods?.map((block: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <CalendarOff size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{block.reason}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(block.start).toLocaleDateString('pt-BR')} até {new Date(block.end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveBlock(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <h3 className="font-display font-medium text-lg text-gray-900">Intervalos Diários</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#f5f2ed]/50 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Início</label>
                  <input 
                    type="time" 
                    value={newIntervalStart}
                    onChange={e => setNewIntervalStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Fim</label>
                  <input 
                    type="time" 
                    value={newIntervalEnd}
                    onChange={e => setNewIntervalEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Identificação</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newIntervalLabel}
                      onChange={e => setNewIntervalLabel(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-primary outline-none transition-all text-sm"
                      placeholder="Ex: Almoço"
                    />
                    <button 
                      type="button"
                      onClick={handleAddInterval}
                      className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {extraSettings.intervals?.map((interval: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{interval.label}</p>
                        <p className="text-xs text-gray-500">
                          Todos os dias: {interval.start} às {interval.end}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveInterval(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus size={20} />
              </div>
              <h3 className="font-display font-medium text-lg text-gray-900">Gestão de Equipe</h3>
            </div>
            <Link to="/app/collaborators" className="flex items-center justify-between p-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary-dark transition-colors">
              <span className="font-medium text-sm">Gerenciar Colaboradores</span>
              <ExternalLink size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LinkIcon size={20} />
              </div>
              <h3 className="font-display font-medium text-lg text-gray-900">URL Pública</h3>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Seu Link Personalizado</label>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 bg-gray-100 px-4 py-3.5 rounded-l-[1.5rem] border-y border-l border-gray-200">beautyagenda.com/p/</span>
                <input 
                  type="text" 
                  value={profile.slug || ''}
                  onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  className="w-full pl-4 pr-4 py-3.5 rounded-r-[1.5rem] border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm text-gray-700"
                  placeholder="seu-studio"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-4 rounded-[1.5rem] font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
              <a 
                href={profile.slug ? `/p/${profile.slug}` : '#'}
                target="_blank"
                className={`w-[56px] h-[56px] bg-white rounded-[1.5rem] flex items-center justify-center text-primary shadow-sm border border-gray-100 hover:border-primary/30 transition-all active:scale-[0.98] ${!profile.slug && 'opacity-50 cursor-not-allowed'}`}
                title="Ver Página Pública"
              >
              <ExternalLink size={20} />
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
