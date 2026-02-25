import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { ShoppingBag, CheckCircle2, Clock, MapPin, Search, Filter, MoreVertical, X, Trash2 } from 'lucide-react';

export default function Orders() {
  const { data: orders, loading, update, remove } = useSupabaseData<any>('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await update(id, { status });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status do pedido.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await remove(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir pedido.');
      }
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Em Processamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm">Gerencie as vendas de produtos da sua loja.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Todos os Pedidos</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar pedido..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">ID / Data</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Itens</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando pedidos...</td></tr>
              ) : orders?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>
              ) : (
                orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">#{order.id.substring(0, 8)}</span>
                        <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
                        <span className="text-xs text-gray-500">{order.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {order.items?.length || 0} item(ns)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      R$ {order.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full outline-none cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Em Processamento</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="p-2 text-gray-400 hover:text-primary"
                        >
                          <ShoppingBag size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)} 
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Pedido</h3>
                <p className="text-sm text-gray-500">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Dados do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Nome:</span> <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span></p>
                    <p><span className="text-gray-500">Telefone:</span> <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Entrega</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Método:</span> 
                      <span className="font-medium text-gray-900 ml-2">
                        {selectedOrder.delivery_method === 'pickup' ? 'Retirada no Local' : 'Entrega'}
                      </span>
                    </p>
                    {selectedOrder.delivery_method === 'delivery' && (
                      <p><span className="text-gray-500">Endereço:</span> <span className="font-medium text-gray-900">{selectedOrder.delivery_address}</span></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Itens do Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity}x R$ {item.price?.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-900">R$ {(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-500">Total do Pedido</span>
                  <span className="text-2xl font-display font-bold text-primary">R$ {selectedOrder.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
