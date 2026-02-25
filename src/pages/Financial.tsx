import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabase';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Search,
  MoreVertical,
  X,
  Trash2
} from 'lucide-react';

export default function Financial() {
  const { data: transactions, loading, insert, remove } = useSupabaseData<any>('financial_transactions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income', // income or expense
    category: 'Serviço',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amountStr = newTransaction.amount.replace(',', '.');
      const amount = parseFloat(amountStr);
      
      if (isNaN(amount)) {
        alert('Por favor, insira um valor válido.');
        return;
      }

      await insert({
        ...newTransaction,
        amount: amount
      });
      setIsModalOpen(false);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'income',
        category: 'Serviço',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar transação: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert('Nenhuma transação para exportar.');
      return;
    }

    const headers = ['Descrição', 'Tipo', 'Categoria', 'Data', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t: any) => [
        `"${t.description}"`,
        t.type === 'income' ? 'Entrada' : 'Saída',
        t.category,
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.amount.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = transactions?.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  const totalExpense = transactions?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 text-sm">Controle seu fluxo de caixa e lucratividade.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-gray-100 px-4 py-2.5 rounded-full font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Download size={18} /> EXPORTAR
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> NOVA TRANSAÇÃO
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Entradas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">-5%</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Saídas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] p-6 rounded-3xl shadow-xl shadow-[#C6A84B]/20 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/20">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Saldo Atual</p>
          <p className="text-2xl font-bold mt-1">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Buscar..."
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
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando transações...</td></tr>
              ) : transactions?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhuma transação registrada.</td></tr>
              ) : (
                transactions?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => remove(t.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Nova Transação</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex p-1 bg-gray-100 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >
                  ENTRADA
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                >
                  SAÍDA
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ex: Venda de Shampoo"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="0,00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  required
                >
                  <option value="Serviço">Serviço</option>
                  <option value="Produto">Produto</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Suprimentos">Suprimentos</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] ${newTransaction.type === 'income' ? 'bg-green-600 shadow-green-600/20 hover:bg-green-700' : 'bg-red-600 shadow-red-600/20 hover:bg-red-700'}`}
                >
                  REGISTRAR TRANSAÇÃO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
