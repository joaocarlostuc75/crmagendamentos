import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Instagram, Clock, Star, ChevronRight, X, Calendar as CalendarIcon, User, Lock, Info, Share2, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';
import { useSupabaseData } from '../hooks/useSupabase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PublicPage() {
  const { data: profiles, loading: loadingProfile } = useSupabaseData<any>('profiles');
  const { data: servicesData, loading: loadingServices } = useSupabaseData<any>('services');
  const { data: productsData, loading: loadingProducts } = useSupabaseData<any>('products');
  const { data: appointments } = useSupabaseData<any>('appointments');
  const [extraSettings] = useLocalStorage('beauty_agenda_extra_settings', { description: '', blockedPeriods: [] as {start: string, end: string}[] });
  const [deliveryFee] = useLocalStorage('delivery_fee', 15.00);
  
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'pix'
  });

  const [selectedService, setSelectedService] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'datetime' | 'client'>('details');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const profile = profiles?.[0] || {
    name: "Beauty Agenda Studio",
    owner: "Ana Silva",
    email: "contato@beautyagenda.com",
    phone: "(11) 99999-9999",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
    instagram: "@beautyagenda",
    opening_hours: "Seg-Sáb: 09:00 - 19:00",
    logo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
  };

  const services = servicesData?.length > 0 ? servicesData : [];
  const products = productsData?.length > 0 ? productsData : [];

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const finalTotal = cartTotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.product.id === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      setCart(cart.filter(item => item.product.id !== productId));
    }
  };

  const handleProductCheckout = () => {
    if (cart.length === 0) return;
    
    if (checkoutStep === 'cart') {
      setCheckoutStep('details');
      return;
    }
    
    if (checkoutStep === 'details') {
      if (!customerDetails.name || !customerDetails.phone || (deliveryMethod === 'delivery' && !customerDetails.address)) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      setCheckoutStep('payment');
      return;
    }

    // Generate WhatsApp Message
    let message = `*Novo Pedido de Produtos* 🛍️%0A%0A`;
    message += `*Cliente:* ${customerDetails.name}%0A`;
    message += `*Contato:* ${customerDetails.phone}%0A`;
    message += `*Entrega:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Retirada'}%0A`;
    if (deliveryMethod === 'delivery') {
      message += `*Endereço:* ${customerDetails.address}%0A`;
    }
    message += `*Pagamento:* ${customerDetails.paymentMethod.toUpperCase()}%0A%0A`;
    message += `*Itens:*%0A`;
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2)})%0A`;
    });
    message += `%0A*Subtotal:* R$ ${cartTotal.toFixed(2)}%0A`;
    if (deliveryMethod === 'delivery') {
      message += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}%0A`;
    }
    message += `*Total:* R$ ${finalTotal.toFixed(2)}`;

    window.open(`https://wa.me/${(profile.phone || '').replace(/\D/g, '')}?text=${message}`, '_blank');

    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('cart');
  };

  const handleShare = (title: string, text: string, url: string) => {
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copiado para a área de transferência!');
    }
  };

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
    let message = `Olá! Gostaria de confirmar meu agendamento.%0A%0A*Detalhes do Cliente:*%0ANome: ${clientName}%0AWhatsApp: ${clientPhone}%0A%0A*Detalhes do Serviço:*%0AServiço: ${selectedService.name}%0AData: ${formattedDate}%0AHorário: ${selectedTime}%0AValor: ${selectedService.price}`;
    
    if (referralCode) {
      message += `%0A%0A*Indicação:* ${referralCode}`;
    }

    window.open(`https://wa.me/${(profile.phone || '').replace(/\D/g, '')}?text=${message}`, '_blank');
    closeModal();
  };

  const isDateBlocked = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    for (const period of extraSettings.blockedPeriods) {
      const start = new Date(period.start + 'T00:00:00');
      const end = new Date(period.end + 'T00:00:00');
      if (date >= start && date <= end) {
        return true;
      }
    }
    return false;
  };

  const isTimeBooked = (dateStr: string, timeStr: string) => {
    if (!appointments) return false;
    return appointments.some((app: any) => app.appointment_date === dateStr && app.appointment_time.startsWith(timeStr));
  };

  if (loadingProfile || loadingServices) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                src={profile.logo_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"} 
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
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">{profile.name}</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-gray-900 leading-none tracking-tighter">
            {(profile.name || 'Studio').split(' ')[0]} <span className="text-primary italic font-light">{(profile.name || '').split(' ').slice(1).join(' ')}</span>
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
                {extraSettings.description || 'Bem-vinda ao seu refúgio de beleza. Especialistas em realçar sua essência através de técnicas exclusivas e atendimento personalizado de alto padrão.'}
              </p>
            </div>
            
            <div className="space-y-4 border-l border-gray-100 pl-0 md:pl-8">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs font-medium leading-tight">{profile.address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} className="text-primary flex-shrink-0" />
                <span className="text-xs font-medium">{profile.opening_hours}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={`https://wa.me/${(profile.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                  <Phone size={14} /> Contato
                </a>
                <button 
                  onClick={() => setIsManageModalOpen(true)}
                  className="flex-1 bg-white text-primary border border-primary/20 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-primary/5 transition-all"
                >
                  <CalendarIcon size={14} /> Meus Agendamentos
                </button>
                <a href={`https://instagram.com/${(profile.instagram || '').replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-gray-100">
                  <Instagram size={18} />
                </a>
                <button 
                  onClick={() => handleShare(profile.name, `Conheça o ${profile.name}! Agende seu horário ou compre nossos produtos online.`, window.location.href)}
                  className="w-11 h-11 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-gray-100"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Floating Button */}
      {cartItemsCount > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-[50] bg-primary text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center animate-bounce hover:scale-110 transition-transform"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
            {cartItemsCount}
          </span>
        </button>
      )}

      {/* Services/Products Tabs */}
      <div className="flex-1 bg-white rounded-t-[3rem] px-6 py-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.08)] -mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-sm">
              <button 
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'services' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                <Clock size={16} /> Serviços
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                <ShoppingBag size={16} /> Loja
              </button>
            </div>
          </div>

          {activeTab === 'services' ? (
            <>
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
                {services.map((service: any) => (
                  <div 
                    key={service.id} 
                    className="group relative bg-white rounded-[2rem] border border-gray-100 luxury-shadow overflow-hidden hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col"
                    onClick={() => openServiceModal(service)}
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <WatermarkedImage 
                        src={service.img_url || "https://picsum.photos/400/300"} 
                        alt={service.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 right-4 z-20">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(service.name, `Confira este serviço: ${service.name} no ${profile.name}!`, window.location.href);
                          }}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-white font-bold text-lg">{service.price}</span>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                          {service.duration} min
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
                        {service.description || 'Procedimento estético de alta qualidade.'}
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
                {services.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Nenhum serviço cadastrado no momento.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-10">
                <div className="w-12 h-1 bg-primary/30 rounded-full mb-4"></div>
                <h2 className="font-display text-3xl font-bold text-gray-900 tracking-tight text-center">
                  Nossa <span className="text-primary italic">Loja</span>
                </h2>
                <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
                  Produtos exclusivos para manter sua beleza em dia em qualquer lugar.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <div 
                    key={product.id} 
                    className="group relative bg-white rounded-3xl border border-gray-100 luxury-shadow overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <WatermarkedImage 
                        src={product.img_url || "https://picsum.photos/300/300"} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <button 
                          onClick={() => handleShare(product.name, `Olha esse produto: ${product.name} no ${profile.name}!`, window.location.href)}
                          className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Esgotado</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-primary font-bold text-sm mb-3">R$ {parseFloat(product.price).toFixed(2)}</p>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="w-full bg-primary/10 text-primary py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Nenhum produto disponível no momento.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-lg text-gray-900">
                {checkoutStep === 'cart' ? 'Seu Carrinho' : checkoutStep === 'details' ? 'Dados para Entrega' : 'Pagamento'}
              </h3>
              <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <WatermarkedImage src={item.product.img_url || "https://picsum.photos/100/100"} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-primary font-bold text-sm">R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-primary transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.product)} className="text-gray-400 hover:text-primary transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                    <button 
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'delivery' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                      Entrega
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'pickup' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                      Retirada
                    </button>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Seu Nome Completo" 
                    value={customerDetails.name}
                    onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  <input 
                    type="tel" 
                    placeholder="Seu WhatsApp" 
                    value={customerDetails.phone}
                    onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  {deliveryMethod === 'delivery' && (
                    <textarea 
                      placeholder="Endereço Completo para Entrega" 
                      value={customerDetails.address}
                      onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm h-24 resize-none"
                    />
                  )}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-2">Forma de Pagamento</h3>
                  <div className="space-y-2">
                    {['pix', 'cartao_credito', 'cartao_debito', 'dinheiro'].map(method => (
                      <label key={method} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${customerDetails.paymentMethod === method ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method}
                          checked={customerDetails.paymentMethod === method}
                          onChange={e => setCustomerDetails({...customerDetails, paymentMethod: e.target.value})}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-3 text-sm font-bold text-gray-700 capitalize">
                          {method.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              {checkoutStep !== 'cart' && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Taxa de Entrega</span>
                      <span>R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Total</span>
                <span className="text-2xl font-display font-bold text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                {checkoutStep !== 'cart' && (
                  <button 
                    onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')}
                    className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                )}
                <button 
                  onClick={handleProductCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/30 disabled:shadow-none"
                >
                  {checkoutStep === 'payment' ? 'Finalizar no WhatsApp' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
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
                    <WatermarkedImage src={selectedService.img_url || "https://picsum.photos/400/300"} alt={selectedService.name} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedService.description || 'Procedimento estético de alta qualidade.'}</p>
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Valor</p>
                      <p className="font-bold text-primary text-xl">{selectedService.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Duração</p>
                      <p className="font-bold text-gray-700">{selectedService.duration} min</p>
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
                      {[...Array(30)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        // Skip Sundays (0)
                        if (date.getDay() === 0) return null;
                        
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                        const dayNum = date.getDate();
                        const blocked = isDateBlocked(dateStr);
                        
                        return (
                          <button 
                            key={dateStr}
                            disabled={blocked}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${blocked ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50' : selectedDate === dateStr ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
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
                        {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => {
                          const booked = isTimeBooked(selectedDate, time);
                          return (
                            <button
                              key={time}
                              disabled={booked}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-xl font-bold text-sm transition-all border ${booked ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through' : selectedTime === time ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                            >
                              {time}
                            </button>
                          );
                        })}
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
      {/* Manage Appointments Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-lg text-gray-900">Gerenciar Agendamento</h3>
              <button onClick={() => setIsManageModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm text-center mb-6">
                Como deseja prosseguir com o seu agendamento? Você será redirecionado para o nosso WhatsApp.
              </p>
              <a 
                href={`https://wa.me/${(profile.phone || '').replace(/\D/g, '')}?text=Olá! Gostaria de remarcar meu agendamento.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsManageModalOpen(false)}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <CalendarIcon size={20} /> Remarcar Horário
              </a>
              <a 
                href={`https://wa.me/${(profile.phone || '').replace(/\D/g, '')}?text=Olá! Gostaria de cancelar meu agendamento.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsManageModalOpen(false)}
                className="w-full bg-white text-red-500 border border-red-200 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} /> Cancelar Agendamento
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
