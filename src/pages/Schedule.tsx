import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, X, Check, User, Scissors, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Schedule() {
  const { data: appointments, loading: loadingAppointments, insert, update, remove } = useSupabaseData<any>('appointments');
  const { data: clients } = useSupabaseData<any>('clients');
  const { data: services } = useSupabaseData<any>('services');
  const [products] = useLocalStorage<any[]>('products', []);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    service_id: '',
    appointment_date: selectedDate,
    appointment_time: '09:00',
    status: 'pending'
  });

  // Checkout State
  const [checkoutApp, setCheckoutApp] = useState<any>(null);
  const [extraItems, setExtraItems] = useState<{name: string, price: number}[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await insert(newAppointment);
    setIsAdding(false);
    setNewAppointment({
      client_id: '',
      service_id: '',
      appointment_date: selectedDate,
      appointment_time: '09:00',
      status: 'pending'
    });
  };

  const handleSendReminder = (app: any, type: '48h' | '24h' | '3h') => {
    const client = clients.find((c: any) => c.id === app.client_id);
    const service = services.find((s: any) => s.id === app.service_id);
    
    if (!client || !client.phone) {
      alert('Cliente não possui telefone cadastrado.');
      return;
    }

    const dateObj = new Date(app.appointment_date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    
    let timeText = '';
    if (type === '48h') timeText = 'em 2 dias';
    if (type === '24h') timeText = 'amanhã';
    if (type === '3h') timeText = 'hoje em algumas horas';

    const message = `Olá ${client.name}! Passando para lembrar do seu agendamento de ${service?.name} ${timeText} (${formattedDate} às ${app.appointment_time}). Por favor, confirme sua presença ou nos avise caso precise reagendar.`;
    
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOpenCheckout = (app: any) => {
    setCheckoutApp(app);
    setExtraItems([]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleAddExtraItem = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setExtraItems([...extraItems, { name: product.name, price: parseFloat(product.price) || 0 }]);
        setSelectedProductId('');
      }
    } else if (newItemName && newItemPrice) {
      const price = parseFloat(newItemPrice.replace(',', '.'));
      if (!isNaN(price)) {
        setExtraItems([...extraItems, { name: newItemName, price }]);
        setNewItemName('');
        setNewItemPrice('');
      }
    }
  };

  const handleCompleteCheckout = async () => {
    if (!checkoutApp) return;

    const service = services.find((s: any) => s.id === checkoutApp.service_id);
    const basePrice = parseFloat((service?.price || '0').replace(/\D/g, '')) / 100 || 0;
    const extrasTotal = extraItems.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = basePrice + extrasTotal;

    let notesAppend = `\n\n--- Checkout ---\nServiço Base: R$ ${basePrice.toFixed(2)}`;
    if (extraItems.length > 0) {
      notesAppend += `\nExtras:\n` + extraItems.map(item => `- ${item.name}: R$ ${item.price.toFixed(2)}`).join('\n');
    }
    notesAppend += `\nTotal Final: R$ ${finalTotal.toFixed(2)}`;

    const newNotes = (checkoutApp.notes || '') + notesAppend;

    await update(checkoutApp.id, { 
      status: 'completed',
      notes: newNotes
    });

    setCheckoutApp(null);
  };

  const filteredAppointments = appointments.filter((a: any) => a.appointment_date === selectedDate);

  if (loadingAppointments) {
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
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Agenda</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">Gestão de Horários</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32 overflow-y-auto">
        {/* Date Selector */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100/50 flex items-center justify-between">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full text-primary transition-colors border border-transparent hover:border-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
            <span className="text-lg font-display font-medium text-gray-900 mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </span>
          </div>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full text-primary transition-colors border border-transparent hover:border-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.sort((a: any, b: any) => a.appointment_time.localeCompare(b.appointment_time)).map((app: any) => (
              <div key={app.id} className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all ${app.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100/50 hover:border-primary/30'} flex flex-col gap-4 group`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
                    <span className="text-sm font-display font-medium text-primary">{app.appointment_time.substring(0, 5)}</span>
                    <Clock size={12} className="text-gray-300 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{clients.find((c: any) => c.id === app.client_id)?.name || 'Cliente'}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{services.find((s: any) => s.id === app.service_id)?.name || 'Serviço'}</p>
                  </div>
                  <div className="flex gap-2">
                    {app.status !== 'completed' && (
                      <button 
                        onClick={() => handleOpenCheckout(app)}
                        className="w-8 h-8 flex items-center justify-center text-green-500 bg-green-50 hover:bg-green-100 rounded-full transition-colors"
                        title="Finalizar e Cobrar"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => remove(app.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {app.status !== 'completed' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-50 overflow-x-auto no-scrollbar">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center mr-1">Lembretes:</span>
                    <button onClick={() => handleSendReminder(app, '48h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2.5 py-1 rounded-full font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 48h
                    </button>
                    <button onClick={() => handleSendReminder(app, '24h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2.5 py-1 rounded-full font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 24h
                    </button>
                    <button onClick={() => handleSendReminder(app, '3h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2.5 py-1 rounded-full font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 3h
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">Nenhum agendamento para hoje.</p>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {checkoutApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-display text-xl font-medium text-gray-900 tracking-tight">Finalizar <span className="text-primary italic">Atendimento</span></h3>
              <button onClick={() => setCheckoutApp(null)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Service Info */}
              <div className="bg-[#f5f2ed] p-5 rounded-[1.5rem] border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold mb-2">Serviço Realizado</p>
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">{services.find((s: any) => s.id === checkoutApp.service_id)?.name}</p>
                  <p className="font-medium text-primary">{services.find((s: any) => s.id === checkoutApp.service_id)?.price}</p>
                </div>
              </div>

              {/* Extra Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" /> Adicionar Produtos/Extras
                </h4>
                
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex gap-2">
                    <select 
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-[1rem] border border-gray-200 text-sm focus:border-primary outline-none bg-gray-50/50 focus:bg-white transition-all"
                    >
                      <option value="">Selecione um produto cadastrado...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - R$ {parseFloat(p.price).toFixed(2)}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAddExtraItem}
                      disabled={!selectedProductId}
                      className="bg-primary text-white w-12 h-12 flex items-center justify-center rounded-[1rem] hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 my-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">ou item avulso</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: Taxa extra..." 
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-[1rem] border border-gray-200 text-sm focus:border-primary outline-none bg-gray-50/50 focus:bg-white transition-all"
                    />
                    <input 
                      type="number" 
                      placeholder="R$ 0,00" 
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(e.target.value)}
                      className="w-24 px-4 py-3 rounded-[1rem] border border-gray-200 text-sm focus:border-primary outline-none bg-gray-50/50 focus:bg-white transition-all"
                    />
                    <button 
                      onClick={handleAddExtraItem}
                      disabled={!newItemName || !newItemPrice}
                      className="bg-primary text-white w-12 h-12 flex items-center justify-center rounded-[1rem] hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {extraItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {extraItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-3 border-b border-gray-50">
                        <span className="text-gray-600">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-gray-900">R$ {item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => setExtraItems(extraItems.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/20">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Subtotal Serviço:</span>
                  <span className="font-medium">{services.find((s: any) => s.id === checkoutApp.service_id)?.price}</span>
                </div>
                {extraItems.length > 0 && (
                  <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                    <span>Subtotal Extras:</span>
                    <span className="font-medium">R$ {extraItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-primary/10 mt-3">
                  <span className="font-medium text-gray-900">Total a Cobrar:</span>
                  <span className="font-display font-medium text-2xl text-primary">
                    R$ {((parseFloat((services.find((s: any) => s.id === checkoutApp.service_id)?.price || '0').replace(/\D/g, '')) / 100 || 0) + extraItems.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCompleteCheckout}
                className="w-full bg-primary text-white py-4 rounded-[1.5rem] font-medium text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Check size={20} /> Confirmar e Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-display text-xl font-medium text-gray-900 tracking-tight">Novo <span className="text-primary italic">Agendamento</span></h3>
              <button onClick={() => setIsAdding(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <select 
                    required
                    value={newAppointment.client_id}
                    onChange={e => setNewAppointment({...newAppointment, client_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1rem] border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all appearance-none text-sm"
                  >
                    <option value="">Selecionar Cliente</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">Serviço</label>
                <div className="relative">
                  <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <select 
                    required
                    value={newAppointment.service_id}
                    onChange={e => setNewAppointment({...newAppointment, service_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-[1rem] border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all appearance-none text-sm"
                  >
                    <option value="">Selecionar Serviço</option>
                    {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.price}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">Data</label>
                  <input 
                    type="date" 
                    required
                    value={newAppointment.appointment_date}
                    onChange={e => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-[1rem] border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">Horário</label>
                  <input 
                    type="time" 
                    required
                    value={newAppointment.appointment_time}
                    onChange={e => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-[1rem] border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-[1.5rem] font-medium text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all mt-6"
              >
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
