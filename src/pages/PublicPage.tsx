import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, Clock, Star, ChevronRight, X, Calendar as CalendarIcon, User } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialProfile = {
  name: "Beauty Agenda Studio",
  owner: "Ana Silva",
  email: "contato@beautyagenda.com",
  phone: "(11) 99999-9999",
  address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
  instagram: "@beautyagenda",
  openingHours: "Seg-Sáb: 09:00 - 19:00",
  logo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
};

const initialServices = [
  {
    id: 1,
    name: "Cílios Fio a Fio",
    price: "R$ 150,00",
    duration: "90 min",
    img: "https://images.unsplash.com/photo-1588513706482-10600a204ca5?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Técnica clássica que aplica um fio sintético sobre cada fio natural, proporcionando um efeito rímel natural e elegante."
  },
  {
    id: 2,
    name: "Lash Egípcio",
    price: "R$ 180,00",
    duration: "105 min",
    img: "https://images.unsplash.com/photo-1512496015851-a1c825b27264?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Técnica inovadora que utiliza fios em formato de Y, oferecendo mais volume que o clássico com a mesma leveza."
  },
  {
    id: 3,
    name: "Volume Brasileiro",
    price: "R$ 210,00",
    duration: "120 min",
    img: "https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Fios em formato de Y que proporcionam um volume texturizado e marcante, ideal para quem busca destaque."
  },
  {
    id: 4,
    name: "Volume Russo",
    price: "R$ 250,00",
    duration: "150 min",
    img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Técnica avançada onde são criados 'fans' (leques) de 3 a 6 fios ultrafinos aplicados em cada fio natural, garantindo volume máximo."
  }
];

export default function PublicPage() {
  const [profile] = useLocalStorage('beauty_agenda_profile', initialProfile);
  const [services] = useLocalStorage('beauty_agenda_services', initialServices);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'datetime' | 'client'>('details');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const openServiceModal = (service: any) => {
    setSelectedService(service);
    setStep('details');
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  const handleConfirm = () => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    const message = `Olá! Gostaria de confirmar meu agendamento.%0A%0A*Detalhes do Cliente:*%0ANome: ${clientName}%0AWhatsApp: ${clientPhone}%0A%0A*Detalhes do Serviço:*%0AServiço: ${selectedService.name}%0AData: ${formattedDate}%0AHorário: ${selectedTime}%0AValor: ${selectedService.price}`;
    window.open(`https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    closeModal();
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-primary/10 overflow-hidden">
        <WatermarkedImage 
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1200&h=600" 
          alt="Studio Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background-light"></div>
        
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-xl">
              <WatermarkedImage 
                src={profile.logo} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <Link to="/login" className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white/60 uppercase tracking-[0.2em] border border-white/30 shadow-xl hover:bg-white hover:text-primary transition-all duration-300 group">
            <Lock size={14} className="group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        <div className="absolute bottom-12 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">Studio VIP Gold</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-gray-900 leading-none tracking-tighter">
            {profile.name.split(' ')[0]} <span className="text-primary italic font-light">{profile.name.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
      </div>

      {/* Studio Info Card */}
      <div className="px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 mb-4 text-primary">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-primary" />)}
                <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-widest">Excelência em cada detalhe</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                Bem-vinda ao seu refúgio de beleza. Especialistas em realçar sua essência através de técnicas exclusivas e atendimento personalizado de alto padrão.
              </p>
            </div>
            
            <div className="space-y-4 border-l border-gray-100 pl-0 md:pl-8">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs font-medium leading-tight">{profile.address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} className="text-primary flex-shrink-0" />
                <span className="text-xs font-medium">{profile.openingHours}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                  <Phone size={14} /> Contato
                </a>
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-gray-100">
                  <Instagram size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="flex-1 bg-white rounded-t-[3rem] px-6 py-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.08)] -mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-1 bg-primary/30 rounded-full mb-4"></div>
            <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight text-center">
              Menu de <span className="text-primary italic">Beleza</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
              Selecione o procedimento desejado para iniciar seu agendamento exclusivo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(service => (
              <div 
                key={service.id} 
                className="group relative bg-white rounded-[2rem] border border-gray-100 luxury-shadow overflow-hidden hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col"
                onClick={() => openServiceModal(service)}
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <WatermarkedImage 
                    src={service.img} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white font-bold text-lg">{service.price}</span>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                      {service.duration}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-primary fill-primary" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Procedimento VIP</span>
                    </div>
                    <button className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Agendar <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduling Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-lg text-gray-900">
                {step === 'details' && 'Detalhes do Serviço'}
                {step === 'datetime' && 'Escolha Data e Horário'}
                {step === 'client' && 'Seus Dados'}
              </h3>
              <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6">
              {step === 'details' && (
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden">
                    <WatermarkedImage src={selectedService.img} alt={selectedService.name} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedService.description}</p>
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Valor</p>
                      <p className="font-bold text-primary text-xl">{selectedService.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Duração</p>
                      <p className="font-bold text-gray-700">{selectedService.duration}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep('datetime')}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors mt-4"
                  >
                    Agendar Horário
                  </button>
                </div>
              )}

              {step === 'datetime' && (
                <div className="space-y-6">
                  {/* Simple Date Selection */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarIcon size={18} className="text-primary" /> Escolha o Dia
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {[...Array(14)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        // Skip Sundays (0)
                        if (date.getDay() === 0) return null;
                        
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                        const dayNum = date.getDate();
                        
                        return (
                          <button 
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${selectedDate === dateStr ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                          >
                            <span className="text-xs uppercase font-medium">{dayName}</span>
                            <span className="text-xl font-bold">{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simple Time Selection */}
                  {selectedDate && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock size={18} className="text-primary" /> Escolha o Horário
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl font-bold text-sm transition-all border ${selectedTime === time ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep('client')}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {step === 'client' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={18} className="text-primary" /> Seu Nome Completo
                    </label>
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={18} className="text-primary" /> Seu WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-6">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Resumo do Agendamento</h4>
                    <p className="text-sm text-gray-600 mb-1"><strong>Serviço:</strong> {selectedService.name}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Data:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {selectedTime}</p>
                    <p className="text-sm text-gray-600"><strong>Valor:</strong> {selectedService.price}</p>
                  </div>

                  <button 
                    disabled={!clientName || !clientPhone}
                    onClick={handleConfirm}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#25D366]/30 hover:bg-[#128C7E] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Confirmar via WhatsApp
                  </button>
                  
                  <button 
                    onClick={() => setStep('datetime')}
                    className="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
