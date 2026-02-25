import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { useLocalStorage } from '../hooks/useLocalStorage';
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
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns,
  CalendarDays,
  CalendarOff,
  Printer
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  eachDayOfInterval,
  startOfDay,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Schedule() {
  const { data: appointments, loading, insert, update, remove } = useSupabaseData<any>('appointments');
  const { data: clients } = useSupabaseData<any>('clients');
  const { data: services } = useSupabaseData<any>('services');
  const { data: products } = useSupabaseData<any>('products');
  const { data: collaborators } = useSupabaseData<any>('collaborators');
  const [extraSettings] = useLocalStorage('beauty_agenda_extra_settings', { 
    description: '', 
    businessHours: { start: '08:00', end: '20:00' },
    blockedPeriods: [] as {start: string, end: string, reason: string}[],
    intervals: [] as {start: string, end: string, label: string}[]
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    service_id: '',
    collaborator_id: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: extraSettings.businessHours?.start || '08:00',
    status: 'pending',
    additional_items: [] as Array<{ product_id: string, quantity: number }>
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

  const handlePrintReceipt = (app: any) => {
    const client = clients?.find((c: any) => c.id === app.client_id);
    const service = services?.find((s: any) => s.id === app.service_id);
    
    let itemsHtml = `
      <tr>
        <td style="padding: 4px 0;">${service?.name || 'Serviço'}</td>
        <td style="text-align: right;">R$ ${service?.price?.toFixed(2) || '0.00'}</td>
      </tr>
    `;
    
    let total = service?.price || 0;

    if (app.additional_items && app.additional_items.length > 0) {
      app.additional_items.forEach((item: any) => {
        const product = products?.find((p: any) => p.id === item.product_id);
        if (product) {
          const itemTotal = product.price * item.quantity;
          total += itemTotal;
          itemsHtml += `
            <tr>
              <td style="padding: 4px 0;">${item.quantity}x ${product.name}</td>
              <td style="text-align: right;">R$ ${itemTotal.toFixed(2)}</td>
            </tr>
          `;
        }
      });
    }

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; width: 260px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .info { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .total { font-size: 14px; font-weight: bold; text-align: right; border-top: 1px dashed #000; padding-top: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BEAUTY AGENDA</div>
            <div>Recibo Não Fiscal</div>
            <div>Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          
          <div class="info">
            <div><strong>Cliente:</strong> ${client?.name || 'Não informado'}</div>
            <div><strong>Data Agendamento:</strong> ${new Date(app.date).toLocaleDateString('pt-BR')} às ${app.time}</div>
          </div>

          <table class="items">
            ${itemsHtml}
          </table>

          <div class="total">
            TOTAL: R$ ${total.toFixed(2)}
          </div>

          <div class="footer">
            Obrigado pela preferência!<br>
            Volte sempre.
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isDateBlocked = (date: Date) => {
    return extraSettings.blockedPeriods?.some(block => {
      const start = parseISO(block.start);
      const end = parseISO(block.end);
      return isWithinInterval(startOfDay(date), { start: startOfDay(start), end: startOfDay(end) });
    });
  };

  const getBlockedReason = (date: Date) => {
    return extraSettings.blockedPeriods?.find(block => {
      const start = parseISO(block.start);
      const end = parseISO(block.end);
      return isWithinInterval(startOfDay(date), { start: startOfDay(start), end: startOfDay(end) });
    })?.reason;
  };

  const isTimeInInterval = (time: string) => {
    return extraSettings.intervals?.some(interval => {
      return time >= interval.start && time < interval.end;
    });
  };

  const getIntervalLabel = (time: string) => {
    return extraSettings.intervals?.find(interval => {
      return time >= interval.start && time < interval.end;
    })?.label;
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDateBlocked(parseISO(newAppointment.date))) {
      alert(`Este dia está bloqueado: ${getBlockedReason(parseISO(newAppointment.date))}`);
      return;
    }

    if (isTimeInInterval(newAppointment.time)) {
      alert(`Este horário está em um intervalo: ${getIntervalLabel(newAppointment.time)}`);
      return;
    }

    try {
      await insert({
        ...newAppointment,
        additional_items: newAppointment.additional_items
      });
      setIsModalOpen(false);
      setNewAppointment({
        client_id: '',
        service_id: '',
        collaborator_id: '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: extraSettings.businessHours?.start || '08:00',
        status: 'pending',
        additional_items: []
      });
      setSelectedProduct('');
      setSelectedProductQuantity(1);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar agendamento: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const generateHours = () => {
    const startHour = parseInt(extraSettings.businessHours?.start?.split(':')[0] || '8');
    const endHour = parseInt(extraSettings.businessHours?.end?.split(':')[0] || '20');
    const length = endHour - startHour + 1;
    return Array.from({ length: length > 0 ? length : 13 }, (_, i) => `${(i + startHour).toString().padStart(2, '0')}:00`);
  };

  const hours = generateHours();

  const renderHeader = () => (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500 text-sm">Gerencie seus horários e atendimentos.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-white border border-gray-100 rounded-full p-1 shadow-sm">
          <button 
            onClick={() => setView('day')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${view === 'day' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Columns size={14} /> DIA
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${view === 'week' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid size={14} /> SEMANA
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${view === 'month' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <CalendarDays size={14} /> MÊS
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isDateBlocked(selectedDate)}
          className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> NOVO AGENDAMENTO
        </button>
      </div>
    </header>
  );

  const renderDayView = () => {
    const blockedReason = getBlockedReason(selectedDate);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <CalendarIcon size={20} className="text-primary" />
            <span>Agenda de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
            {blockedReason && (
              <span className="ml-2 px-2 py-1 bg-red-50 text-red-600 text-[10px] uppercase tracking-wider rounded-md flex items-center gap-1">
                <CalendarOff size={12} /> {blockedReason}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 rounded-full">HOJE</button>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {hours.map((hour) => {
            const hourAppointments = appointments?.filter((a: any) => 
              isSameDay(parseISO(a.date), selectedDate) && a.time === hour
            ) || [];
            
            const intervalLabel = getIntervalLabel(hour);
            const isBlocked = !!blockedReason;

            return (
              <div key={hour} className={`flex min-h-[80px] group ${isBlocked || intervalLabel ? 'bg-gray-50/50' : ''}`}>
                <div className="w-20 p-4 border-r border-gray-50 flex flex-col items-center justify-start">
                  <span className="text-sm font-bold text-gray-900">{hour}</span>
                </div>
                <div className="flex-1 p-2 flex flex-col gap-2 transition-colors relative">
                  {isBlocked ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                      Dia Bloqueado ({blockedReason})
                    </div>
                  ) : intervalLabel ? (
                    <div className="h-full flex items-center justify-center text-orange-400 text-xs font-medium uppercase tracking-widest bg-orange-50/30 rounded-xl border border-dashed border-orange-100">
                      {intervalLabel}
                    </div>
                  ) : (
                    <>
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
                                {app.additional_items && app.additional_items.length > 0 && (
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    + {app.additional_items.length} produto(s)
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                              </span>
                              <button onClick={() => handlePrintReceipt(app)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Imprimir Recibo">
                                <Printer size={16} />
                              </button>
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
                              setNewAppointment({...newAppointment, time: hour, date: format(selectedDate, 'yyyy-MM-dd')});
                              setIsModalOpen(true);
                            }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus size={14} /> AGENDAR ÀS {hour}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <CalendarIcon size={20} className="text-primary" />
            <span>Semana de {format(start, "dd 'de' MMM", { locale: ptBR })} - {format(weekDays[6], "dd 'de' MMM", { locale: ptBR })}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 rounded-full">ESTA SEMANA</button>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-8 divide-x divide-gray-50">
          <div className="col-span-1">
            <div className="h-16 border-b border-gray-50"></div>
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-50 p-2 text-center">
                <span className="text-[10px] font-bold text-gray-400">{hour}</span>
              </div>
            ))}
          </div>
          {weekDays.map(day => {
            const blockedReason = getBlockedReason(day);
            return (
              <div key={day.toString()} className="col-span-1">
                <div className={`h-16 border-b border-gray-50 p-2 flex flex-col items-center justify-center ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                  <span className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-900'}`}>{format(day, 'dd')}</span>
                </div>
                {hours.map(hour => {
                  const dayAppointments = appointments?.filter((a: any) => 
                    isSameDay(parseISO(a.date), day) && a.time === hour
                  ) || [];
                  
                  const intervalLabel = getIntervalLabel(hour);
                  const isBlocked = !!blockedReason;

                  return (
                    <div key={hour} className={`h-20 border-b border-gray-50 p-1 relative group ${isBlocked ? 'bg-red-50/20' : intervalLabel ? 'bg-orange-50/20' : ''}`}>
                      {isBlocked ? (
                        <div className="h-full flex items-center justify-center" title={blockedReason}>
                          <CalendarOff size={12} className="text-red-300" />
                        </div>
                      ) : intervalLabel ? (
                        <div className="h-full flex items-center justify-center" title={intervalLabel}>
                          <Clock size={12} className="text-orange-300" />
                        </div>
                      ) : (
                        <>
                          {dayAppointments.map((app: any) => (
                            <div key={app.id} className="bg-primary/10 border-l-2 border-primary p-1 rounded-md h-full overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors">
                              <p className="text-[9px] font-bold text-primary truncate">{clients?.find((c: any) => c.id === app.client_id)?.name}</p>
                              <p className="text-[8px] text-primary/70 truncate">{services?.find((s: any) => s.id === app.service_id)?.name}</p>
                            </div>
                          ))}
                          {!dayAppointments.length && (
                            <button 
                              onClick={() => {
                                setNewAppointment({...newAppointment, time: hour, date: format(day, 'yyyy-MM-dd')});
                                setIsModalOpen(true);
                              }}
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 flex items-center justify-center"
                            >
                              <Plus size={14} className="text-primary" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <CalendarIcon size={20} className="text-primary" />
            <span className="capitalize">{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 rounded-full">ESTE MÊS</button>
            <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
          {calendarDays.map((day, i) => {
            const dayAppointments = appointments?.filter((a: any) => isSameDay(parseISO(a.date), day)) || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const blockedReason = getBlockedReason(day);

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[120px] p-2 transition-colors hover:bg-gray-50/50 cursor-pointer group ${!isCurrentMonth ? 'bg-gray-50/30' : ''} ${blockedReason ? 'bg-red-50/10' : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  setView('day');
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isToday ? 'bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full' : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                      {format(day, 'd')}
                    </span>
                    {blockedReason && (
                      <span className="text-[8px] text-red-500 font-bold uppercase mt-1">{blockedReason}</span>
                    )}
                  </div>
                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="text-[9px] font-medium text-gray-600 bg-white border border-gray-100 rounded px-1 py-0.5 truncate shadow-sm">
                      {app.time} - {clients?.find((c: any) => c.id === app.client_id)?.name}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-[8px] text-gray-400 font-bold text-center">+{dayAppointments.length - 3} mais</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      {renderHeader()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Sidebar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Calendário</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-1 hover:bg-gray-100 rounded-md text-gray-400"><ChevronLeft size={18} /></button>
              <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-1 hover:bg-gray-100 rounded-md text-gray-400"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-widest">Selecionado</p>
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
                  <span className="font-bold text-gray-900">
                    {appointments?.filter((a: any) => isSameDay(parseISO(a.date), selectedDate)).length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Confirmados</span>
                  <span className="font-bold text-green-600">
                    {appointments?.filter((a: any) => isSameDay(parseISO(a.date), selectedDate) && a.status === 'confirmed').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pendentes</span>
                  <span className="font-bold text-orange-600">
                    {appointments?.filter((a: any) => isSameDay(parseISO(a.date), selectedDate) && a.status === 'pending').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main View */}
        <div className="lg:col-span-3">
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador (Opcional)</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newAppointment.collaborator_id || ''}
                  onChange={(e) => setNewAppointment({...newAppointment, collaborator_id: e.target.value})}
                >
                  <option value="">Selecione um colaborador</option>
                  {collaborators?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Produtos (Opcional)</label>
                <div className="flex gap-2 mb-4">
                  <select 
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Selecione um produto</option>
                    {products?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    min="1"
                    className="w-20 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={selectedProductQuantity}
                    onChange={(e) => setSelectedProductQuantity(parseInt(e.target.value) || 1)}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedProduct) {
                        const product = products?.find((p: any) => p.id === selectedProduct);
                        if (product) {
                          setNewAppointment(prev => {
                            const existing = prev.additional_items.find(item => item.product_id === selectedProduct);
                            if (existing) {
                              return {
                                ...prev,
                                additional_items: prev.additional_items.map(item => 
                                  item.product_id === selectedProduct 
                                    ? { ...item, quantity: item.quantity + selectedProductQuantity }
                                    : item
                                )
                              };
                            }
                            return {
                              ...prev,
                              additional_items: [...prev.additional_items, { product_id: selectedProduct, quantity: selectedProductQuantity }]
                            };
                          });
                          setSelectedProduct('');
                          setSelectedProductQuantity(1);
                        }
                      }
                    }}
                    className="bg-primary/10 text-primary px-4 rounded-xl font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {newAppointment.additional_items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {newAppointment.additional_items.map((item, index) => {
                      const product = products?.find((p: any) => p.id === item.product_id);
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                          <span className="font-medium text-gray-700">{item.quantity}x {product?.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">R$ {(product?.price * item.quantity).toFixed(2)}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                setNewAppointment(prev => ({
                                  ...prev,
                                  additional_items: prev.additional_items.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
