import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, X, Check, User, Scissors, Trash2 } from 'lucide-react';
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

  const filteredAppointments = appointments.filter(a => a.appointment_date === selectedDate);

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
            filteredAppointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map(app => (
              <div key={app.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group">
                <div className="w-16 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
                  <span className="text-sm font-bold text-primary">{app.appointment_time.substring(0, 5)}</span>
                  <Clock size={14} className="text-gray-300 mt-1" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{clients.find(c => c.id === app.client_id)?.name || 'Cliente'}</h3>
                  <p className="text-xs text-gray-500">{services.find(s => s.id === app.service_id)?.name || 'Serviço'}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => update(app.id, { status: 'completed' })}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => remove(app.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
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
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price}</option>)}
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
