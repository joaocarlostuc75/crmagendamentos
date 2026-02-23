import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, X, Check, User, Scissors, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabase';

export default function Schedule() {
  const { data: appointments, loading: loadingAppointments, insert, update, remove } = useSupabaseData<any>('appointments');
  const { data: clients } = useSupabaseData<any>('clients');
  const { data: services } = useSupabaseData<any>('services');
  
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
    if (newItemName && newItemPrice) {
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
            <h1 className="font-display text-2xl font-bold gold-gradient-text">Agenda</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Gestão de Horários</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32">
        {/* Date Selector */}
        <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
            <span className="text-lg font-bold text-gray-800">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </span>
          </div>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.sort((a: any, b: any) => a.appointment_time.localeCompare(b.appointment_time)).map((app: any) => (
              <div key={app.id} className={`bg-white p-4 rounded-3xl shadow-sm border ${app.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} flex flex-col gap-3 group`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
                    <span className="text-sm font-bold text-primary">{app.appointment_time.substring(0, 5)}</span>
                    <Clock size={14} className="text-gray-300 mt-1" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{clients.find((c: any) => c.id === app.client_id)?.name || 'Cliente'}</h3>
                    <p className="text-xs text-gray-500">{services.find((s: any) => s.id === app.service_id)?.name || 'Serviço'}</p>
                  </div>
                  <div className="flex gap-1">
                    {app.status !== 'completed' && (
                      <button 
                        onClick={() => handleOpenCheckout(app)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                        title="Finalizar e Cobrar"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => remove(app.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {app.status !== 'completed' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mr-2">Lembretes:</span>
                    <button onClick={() => handleSendReminder(app, '48h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded-md font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 48h
                    </button>
                    <button onClick={() => handleSendReminder(app, '24h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded-md font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 24h
                    </button>
                    <button onClick={() => handleSendReminder(app, '3h')} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded-md font-bold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle size={12} /> 3h
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <CalendarIcon size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Nenhum agendamento para hoje.</p>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {checkoutApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-xl text-gray-900 tracking-tight">Finalizar <span className="text-primary italic">Atendimento</span></h3>
              <button onClick={() => setCheckoutApp(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Service Info */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Serviço Realizado</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-800">{services.find((s: any) => s.id === checkoutApp.service_id)?.name}</p>
                  <p className="font-bold text-primary">{services.find((s: any) => s.id === checkoutApp.service_id)?.price}</p>
                </div>
              </div>

              {/* Extra Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" /> Adicionar Produtos/Extras
                </h4>
                
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Ex: Perfume, Botox..." 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="R$ 0,00" 
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
                  />
                  <button 
                    onClick={handleAddExtraItem}
                    className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {extraItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {extraItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-600">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">R$ {item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => setExtraItems(extraItems.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600"
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
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Subtotal Serviço:</span>
                  <span>{services.find((s: any) => s.id === checkoutApp.service_id)?.price}</span>
                </div>
                {extraItems.length > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <span>Subtotal Extras:</span>
                    <span>R$ {extraItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-primary/10 mt-2">
                  <span className="font-bold text-gray-800">Total a Cobrar:</span>
                  <span className="font-bold text-xl text-primary">
                    R$ {((parseFloat((services.find((s: any) => s.id === checkoutApp.service_id)?.price || '0').replace(/\D/g, '')) / 100 || 0) + extraItems.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCompleteCheckout}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Check size={20} /> Confirmar e Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-display font-bold text-xl text-gray-900 tracking-tight">Novo <span className="text-primary italic">Agendamento</span></h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <select 
                    required
                    value={newAppointment.client_id}
                    onChange={e => setNewAppointment({...newAppointment, client_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Selecionar Cliente</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Serviço</label>
                <div className="relative">
                  <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <select 
                    required
                    value={newAppointment.service_id}
                    onChange={e => setNewAppointment({...newAppointment, service_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Selecionar Serviço</option>
                    {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.price}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                  <input 
                    type="date" 
                    required
                    value={newAppointment.appointment_date}
                    onChange={e => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Horário</label>
                  <input 
                    type="time" 
                    required
                    value={newAppointment.appointment_time}
                    onChange={e => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all mt-4"
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
