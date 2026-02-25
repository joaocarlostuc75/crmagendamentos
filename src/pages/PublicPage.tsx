import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Phone,
  MapPin,
  Instagram,
  ShoppingBag
} from 'lucide-react';

export default function PublicPage() {
  const { slug } = useParams();
  const [establishment, setEstablishment] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [extraSettings, setExtraSettings] = useState<any>(() => {
    const saved = localStorage.getItem('beauty_agenda_extra_settings');
    return saved ? JSON.parse(saved) : { intervals: [] };
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we'd fetch by slug. For now, let's just fetch the first profile as a demo.
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        setEstablishment(profile);
        
        if (profile?.extra_settings) {
          setExtraSettings(profile.extra_settings);
        }

        if (profile) {
          const [svcsRes, prodsRes] = await Promise.all([
            supabase.from('services').select('*').eq('user_id', profile.id),
            supabase.from('products').select('*').eq('user_id', profile.id)
          ]);
          
          setServices(svcsRes.data || []);
          setProducts(prodsRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    try {
      const { error } = await supabase.from('appointments').insert([{
        user_id: establishment.id,
        service_id: selectedService.id,
        client_name: clientInfo.name,
        client_phone: clientInfo.phone,
        date: selectedDate,
        time: selectedTime,
        status: 'pending'
      }]);

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A84B]"></div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 border border-[#f3eee2]">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Agendamento Realizado!</h2>
        <p className="text-gray-600">
          Seu horário para <strong>{selectedService.name}</strong> em <strong>{new Date(selectedDate).toLocaleDateString('pt-BR')}</strong> às <strong>{selectedTime}</strong> foi solicitado com sucesso.
        </p>
        <p className="text-sm text-gray-500">
          Aguarde a confirmação do estabelecimento.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-[#C6A84B] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#C6A84B]/20 hover:bg-[#b59639] transition-all"
        >
          VOLTAR AO INÍCIO
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#f3eee2] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {establishment?.logo_url ? (
              <img 
                src={establishment.logo_url} 
                alt={establishment.name} 
                className="w-12 h-12 rounded-full object-cover border border-[#f3eee2]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#C6A84B]/10 flex items-center justify-center text-[#C6A84B] font-bold text-xl">
                {establishment?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-gray-900 leading-tight">{establishment?.name}</h1>
              <p className="text-[10px] text-[#C6A84B] font-bold uppercase tracking-widest">Agendamento Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            {establishment?.instagram && (
              <a 
                href={`https://instagram.com/${establishment.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-[#C6A84B]"
              >
                <Instagram size={20} />
              </a>
            )}
            {establishment?.phone && (
              <a 
                href={`tel:${establishment.phone}`}
                className="p-2 text-gray-400 hover:text-[#C6A84B]"
              >
                <Phone size={20} />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="flex mb-8 gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C6A84B]' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-3xl font-display font-bold text-gray-900">O que você procura hoje?</h2>
              
              <div className="flex bg-white p-1 rounded-2xl border border-[#f3eee2] shadow-sm self-start">
                <button 
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-[#C6A84B] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Serviços
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-[#C6A84B] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Produtos
                </button>
              </div>
            </div>

            {activeTab === 'services' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((service) => (
                  <button 
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className="bg-white group rounded-[2rem] border border-[#f3eee2] shadow-sm hover:shadow-xl hover:border-[#C6A84B]/30 transition-all text-left overflow-hidden flex flex-col"
                  >
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#C6A84B]/20">
                          <Scissors size={64} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#C6A84B] uppercase tracking-widest shadow-sm">
                        {service.duration} min
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {service.description || 'Um serviço exclusivo pensado para realçar sua beleza natural.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-2xl font-display font-bold text-gray-900">R$ {service.price}</span>
                        <div className="w-10 h-10 rounded-full bg-[#C6A84B] text-white flex items-center justify-center shadow-lg shadow-[#C6A84B]/20 group-hover:translate-x-1 transition-transform">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-400 font-medium">
                    Nenhum produto disponível no momento.
                  </div>
                ) : (
                  products.map((product) => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-[2rem] border border-[#f3eee2] shadow-sm overflow-hidden flex flex-col"
                    >
                      <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#C6A84B]/20">
                            <ShoppingBag size={64} />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {product.description || 'Produto de alta qualidade para seus cuidados diários.'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <span className="text-2xl font-display font-bold text-[#C6A84B]">R$ {product.price}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {product.stock > 0 ? 'Em estoque' : 'Esgotado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-[#C6A84B] hover:underline">
              <ArrowLeft size={16} /> VOLTAR
            </button>
            <h2 className="text-2xl font-display font-bold text-gray-900">Escolha Data e Horário</h2>
            
            <div className="bg-white p-6 rounded-3xl border border-[#f3eee2] shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Data</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-[#faf9f6] border border-[#e8e1d1] rounded-2xl outline-none focus:ring-2 focus:ring-[#C6A84B]/20"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Horário</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].filter(time => {
                    if (!extraSettings.intervals) return true;
                    return !extraSettings.intervals.some((interval: any) => {
                      return time >= interval.start && time < interval.end;
                    });
                  }).map((time) => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all ${selectedTime === time ? 'bg-[#C6A84B] text-white shadow-lg shadow-[#C6A84B]/20' : 'bg-[#faf9f6] text-gray-600 hover:bg-gray-100'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="w-full bg-[#C6A84B] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#C6A84B]/20 hover:bg-[#b59639] transition-all disabled:opacity-50"
              >
                CONTINUAR
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm font-bold text-[#C6A84B] hover:underline">
              <ArrowLeft size={16} /> VOLTAR
            </button>
            <h2 className="text-2xl font-display font-bold text-gray-900">Finalizar Agendamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#f3eee2] shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Resumo</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Serviço</span>
                      <span className="font-bold text-gray-900">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Data</span>
                      <span className="font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Horário</span>
                      <span className="font-bold text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-4 border-t border-gray-50">
                      <span className="font-display font-bold text-gray-900">Total</span>
                      <span className="font-display font-bold text-[#C6A84B]">R$ {selectedService.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBooking} className="bg-white p-6 rounded-3xl border border-[#f3eee2] shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Seus Dados</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-[#faf9f6] border border-[#e8e1d1] rounded-2xl outline-none focus:ring-2 focus:ring-[#C6A84B]/20"
                    placeholder="Como podemos te chamar?"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full p-4 bg-[#faf9f6] border border-[#e8e1d1] rounded-2xl outline-none focus:ring-2 focus:ring-[#C6A84B]/20"
                    placeholder="(00) 00000-0000"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={booking}
                  className="w-full bg-[#C6A84B] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#C6A84B]/20 hover:bg-[#b59639] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {booking ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#f3eee2] mt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Onde estamos</h3>
                <div className="space-y-4">
                  {establishment?.address && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#fdfbf7] border border-[#f3eee2]">
                      <div className="w-10 h-10 rounded-full bg-[#C6A84B]/10 flex items-center justify-center text-[#C6A84B] flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Endereço</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {establishment.address}
                          {extraSettings?.cep && <><br />CEP: {extraSettings.cep}</>}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {establishment?.phone && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#fdfbf7] border border-[#f3eee2]">
                      <div className="w-10 h-10 rounded-full bg-[#C6A84B]/10 flex items-center justify-center text-[#C6A84B] flex-shrink-0">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Contato</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{establishment.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                  © {new Date().getFullYear()} {establishment?.name} • Powered by BeautyAgenda
                </p>
              </div>
            </div>

            {establishment?.address && (
              <div className="space-y-4">
                <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative group bg-gray-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${establishment.address}${extraSettings?.cep ? ` ${extraSettings.cep}` : ''}`)}&hl=pt-BR&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                    title="Mapa de localização"
                  ></iframe>
                  <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[2rem] z-20"></div>
                </div>
                <div className="text-center">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${establishment.address}${extraSettings?.cep ? ` ${extraSettings.cep}` : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#C6A84B] hover:text-[#b59639] transition-colors"
                  >
                    <MapPin size={16} />
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
