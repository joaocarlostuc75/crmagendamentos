import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Scissors,
  MoreVertical,
  Check,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function Schedule() {
  const { data: appointments, loading, insert, update, remove } = useSupabaseData<any>('appointments');
  const { data: clients } = useSupabaseData<any>('clients');
  const { data: services } = useSupabaseData<any>('services');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    service_id: '',
    date: selectedDate.toISOString().split('T')[0],
    time: '09:00',
    status: 'pending'
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await insert(newAppointment);
      setIsModalOpen(false);
      setNewAppointment({
        client_id: '',
        service_id: '',
        date: selectedDate.toISOString().split('T')[0],
        time: '09:00',
        status: 'pending'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const hours = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm">Gerencie seus horários e atendimentos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> NOVO AGENDAMENTO
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Sidebar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Calendário</h3>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-100 rounded-md text-gray-400"><ChevronLeft size={18} /></button>
              <button className="p-1 hover:bg-gray-100 rounded-md text-gray-400"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-widest">Hoje</p>
              <p className="text-3xl font-display font-bold text-gray-900 mt-1">
                {selectedDate.getDate()}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resumo do Dia</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">{appointments?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Confirmados</span>
                  <span className="font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pendentes</span>
                  <span className="font-bold text-orange-600">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <CalendarIcon size={20} className="text-primary" />
                <span>Agenda de Hoje</span>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {hours.map((hour) => {
                const hourAppointments = appointments?.filter((a: any) => a.time === hour) || [];
                
                return (
                  <div key={hour} className="flex min-h-[80px] group">
                    <div className="w-20 p-4 border-r border-gray-50 flex flex-col items-center justify-start">
                      <span className="text-sm font-bold text-gray-900">{hour}</span>
                    </div>
                    <div className="flex-1 p-2 flex flex-col gap-2 bg-gray-50/30 group-hover:bg-white transition-colors">
                      {hourAppointments.length > 0 ? (
                        hourAppointments.map((app: any) => (
                          <div key={app.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group/item">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {clients?.find((c: any) => c.id === app.client_id)?.name || 'Cliente'}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Scissors size={12} />
                                  {services?.find((s: any) => s.id === app.service_id)?.name || 'Serviço'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-700">
                                {app.status}
                              </span>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setNewAppointment({...newAppointment, time: hour});
                              setIsModalOpen(true);
                            }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus size={14} /> AGENDAR ÀS {hour}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newAppointment.client_id}
                  onChange={(e) => setNewAppointment({...newAppointment, client_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newAppointment.service_id}
                  onChange={(e) => setNewAppointment({...newAppointment, service_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input 
                    type="time"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:scale-[1.02]"
                >
                  CONFIRMAR AGENDAMENTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
