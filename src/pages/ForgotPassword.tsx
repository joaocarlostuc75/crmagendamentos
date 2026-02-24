import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.'
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Ocorreu um erro ao tentar enviar o e-mail.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <h1 className="text-3xl font-display font-bold text-[#C6A84B] tracking-tight">BeautyAgenda</h1>
        </Link>
        <h2 className="text-center text-3xl font-display font-bold text-gray-900">
          Recuperar Senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enviaremos um link para você redefinir sua senha.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-3xl sm:px-10 border border-[#f3eee2]">
          {message?.type === 'success' ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <p className="text-gray-900 font-medium">{message.text}</p>
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-bold text-[#C6A84B] hover:underline gap-2"
              >
                <ArrowLeft size={16} /> Voltar para o Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {message?.type === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                  {message.text}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#e8e1d1] rounded-2xl leading-5 bg-[#faf9f6] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6A84B]/20 focus:border-[#C6A84B] sm:text-sm transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-[#C6A84B]/20 text-sm font-bold text-white bg-[#C6A84B] hover:bg-[#b59639] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C6A84B] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
                </button>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-bold text-[#C6A84B] hover:underline gap-2"
                >
                  <ArrowLeft size={16} /> Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
