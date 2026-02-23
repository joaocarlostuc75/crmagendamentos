import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is required, Supabase won't sign in immediately.
      // But if it's disabled, the user is signed in.
      // We'll show a success message regardless.
      setSuccess(true);
      
      // Optional: Insert into profiles table if not handled by trigger
      if (data.user) {
         const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              name: name,
              email: email
            }
          ]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't block registration success on profile creation error, but maybe warn
          }
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-green-100 text-green-600 mb-4 shadow-sm">
            <Sparkles size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Conta Criada!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sua conta foi criada com sucesso. Verifique seu email para confirmar o cadastro antes de fazer login.
          </p>
          <Link 
            to="/login" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            Ir para Login
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
            <User size={32} />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Criar <span className="text-primary italic">Conta</span></h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Junte-se ao Studio VIP Gold</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 luxury-shadow border border-gray-50">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Estabelecimento</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Nome do seu negócio"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : (
                <>
                  Criar Conta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors block">
              Já tem uma conta? <span className="font-bold text-primary">Faça Login</span>
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
