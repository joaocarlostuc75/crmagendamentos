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
  Instagram
} from 'lucide-react';

export default function PublicPage() {
  const { slug } = useParams();
  const [establishment, setEstablishment] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we'd fetch by slug. For now, let's just fetch the first profile as a demo.
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        setEstablishment(profile);

        if (profile) {
          const { data: svcs } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', profile.id);
          setServices(svcs || []);
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
            <div className="w-10 h-10 rounded-full bg-[#C6A84B]/10 flex items-center justify-center text-[#C6A84B] font-bold">
              {establishment?.name?.charAt(0)}
            </div>
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold text-gray-900">Selecione o Serviço</h2>
            <div className="grid gap-4">
              {services.map((service) => (
                <button 
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className="bg-white p-5 rounded-2xl border border-[#f3eee2] shadow-sm hover:shadow-md hover:border-[#C6A84B]/30 transition-all text-left flex justify-between items-center group"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C6A84B]/5 flex items-center justify-center text-[#C6A84B]">
                      <Scissors size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration} min</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Disponível</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">R$ {service.price}</span>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#C6A84B] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
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
                  {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
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
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-[#f3eee2] mt-12 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6">
          {establishment?.address && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <MapPin size={14} className="text-[#C6A84B]" />
              <span>{establishment.address}</span>
            </div>
          )}
          {establishment?.phone && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Phone size={14} className="text-[#C6A84B]" />
              <span>{establishment.phone}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          Powered by BeautyAgenda
        </p>
      </footer>
    </div>
  );
}
