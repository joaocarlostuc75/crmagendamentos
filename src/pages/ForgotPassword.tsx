import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-green-100 text-green-600 mb-4 shadow-sm">
            <CheckCircle size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Email Enviado!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Verifique sua caixa de entrada para redefinir sua senha.
          </p>
          <Link 
            to="/login" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 shadow-sm">
            <Mail size={32} />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Recuperar <span className="text-primary italic">Senha</span></h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Digite seu email para continuar</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Enviando...' : (
                <>
                  Enviar Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors block">
              Voltar para Login
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-8">
          © 2024 Studio VIP Gold • Sistema de Gestão
        </p>
      </div>
    </div>
  );
}
