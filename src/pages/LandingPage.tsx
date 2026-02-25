import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Calendar, ShoppingBag, BarChart3, Users, MessageCircle, Smartphone, Globe, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';

const plans = [
  {
    name: 'Básico',
    price: '59',
    cents: ',99',
    period: '/mês',
    description: 'Ideal para profissionais autônomos que estão começando.',
    features: [
      'Agenda Online Completa',
      'Cadastro de Clientes',
      'Cadastro de Serviços',
      'Lembretes de Agendamento',
    ],
    cta: 'CRIAR CONTA AGORA',
    featured: false,
  },
  {
    name: 'Avançado',
    price: '79',
    cents: ',99',
    period: '/mês',
    description: 'Perfeito para quem quer crescer e organizar o financeiro.',
    features: [
      'Todos os recursos do Básico',
      'Controle Financeiro',
      'Gestão de Produtos',
      'Integração com WhatsApp (wa.me)',
      'Relatórios e Análises',
    ],
    cta: 'CRIAR CONTA AGORA',
    featured: true,
  },
  {
    name: 'Master',
    price: '99',
    cents: ',99',
    period: '/mês',
    description: 'A solução completa para escalar seu negócio com gestão de equipe.',
    features: [
      'Todos os recursos do Avançado',
      'Gestão de Colaboradores',
      'Programa de Fidelidade',
      'Notificações Personalizadas',
    ],
    cta: 'CRIAR CONTA AGORA',
    featured: false,
  },
];

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Agendamentos online 24h por dia, sem precisar responder mensagens o tempo todo.',
  },
  {
    icon: ShoppingBag,
    title: 'Loja Integrada',
    description: 'Venda seus produtos online e receba pedidos diretamente no seu WhatsApp.',
  },
  {
    icon: BarChart3,
    title: 'Financeiro Real',
    description: 'Saiba exatamente quanto está ganhando por serviço e por venda de produto.',
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    description: 'Histórico completo, preferências e controle de gastos de cada cliente.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Marketing',
    description: 'Lembretes automáticos e confirmações de pedidos via WhatsApp.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Acesse e gerencie tudo do seu celular, de onde estiver, com interface fluida.',
  },
  {
    icon: Globe,
    title: 'Página Pública',
    description: 'Um link exclusivo para sua bio do Instagram com todos os seus serviços e produtos.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança Total',
    description: 'Seus dados protegidos com tecnologia de ponta e backups automáticos.',
  },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '(11) 99999-9999',
    instagram: '@beautyagenda',
    website: 'beautyagenda.com'
  });

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single();
        if (profile) {
          setContactInfo({
            phone: profile.phone || '(11) 99999-9999',
            instagram: profile.instagram || '@beautyagenda',
            website: profile.website || 'beautyagenda.com'
          });
        }
      } catch (err) {
        console.error('Error fetching profile for landing page:', err);
      }
    };
    fetchProfileInfo();
  }, []);

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-body text-[#1A1A1A]">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#C6A84B] text-white p-1.5 rounded-lg">
            <Calendar size={20} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display font-bold text-lg text-[#1A1A1A]">Beauty</h1>
            <p className="text-[10px] tracking-widest uppercase text-[#C6A84B] font-bold">AGENDA</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-[#C6A84B] transition-colors">Funcionalidades</a>
          <a href="#plans" className="hover:text-[#C6A84B] transition-colors">Planos</a>
          <Link to="/login" className="hover:text-[#C6A84B] transition-colors">Entrar</Link>
          <Link to="/register" className="bg-[#C6A84B] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#B8962E] transition-colors shadow-lg shadow-[#C6A84B]/20">
            CRIAR CONTA AGORA
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-[#C6A84B] transition-colors"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 md:hidden flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-top duration-300">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-600"
            >
              <X size={32} />
            </button>
            <a 
              href="#features" 
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-display font-bold text-gray-900 hover:text-[#C6A84B] transition-colors"
            >
              Funcionalidades
            </a>
            <a 
              href="#plans" 
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-display font-bold text-gray-900 hover:text-[#C6A84B] transition-colors"
            >
              Planos
            </a>
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-display font-bold text-gray-900 hover:text-[#C6A84B] transition-colors"
            >
              Entrar
            </Link>
            <Link 
              to="/register" 
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#C6A84B] text-white px-10 py-4 rounded-full font-bold text-sm shadow-xl shadow-[#C6A84B]/20"
            >
              CRIAR CONTA AGORA
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#FDFBF7] border border-[#C6A84B]/30 px-4 py-1.5 rounded-full">
            <span className="text-[#C6A84B] text-xs font-bold uppercase tracking-wider">⚡ 7 DIAS DE ACESSO GRÁTIS</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold leading-[1.1] text-[#1A1A1A]">
            A Gestão <span className="font-display italic text-[#C6A84B]">Luxuosa</span><br />
            que seu Studio<br />
            merece.
          </h2>
          
          <p className="text-gray-600 text-lg max-w-md leading-relaxed">
            Agenda inteligente, controle de estoque, relatórios financeiros e uma loja online completa. Tudo em um só lugar para você focar no que realmente importa: sua arte.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register" className="bg-[#C6A84B] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#B8962E] transition-colors shadow-xl shadow-[#C6A84B]/30 text-center">
              CRIAR CONTA AGORA <ArrowRight className="inline ml-2 w-4 h-4" />
            </Link>
            <a href="#plans" className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors text-center">
              Ver Planos
            </a>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i} 
                  src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover" 
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-[#1A1A1A]">+500 profissionais</span> já transformaram seus negócios.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-[#C6A84B]/5 rounded-[3rem] transform rotate-3"></div>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Luxury Salon" 
              className="w-full h-[600px] object-cover"
            />
            
            {/* Floating Card */}
            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 max-w-xs animate-bounce-slow">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Check size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">NOVO AGENDAMENTO</p>
                <p className="text-gray-900 font-bold">R$ 150,00 Confirmado</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-4xl font-display font-bold text-[#1A1A1A]">
              Tudo o que você precisa para <span className="italic text-[#C6A84B]">brilhar</span>.
            </h3>
            <p className="text-gray-600 mt-4">
              Desenvolvemos cada funcionalidade pensando na rotina real dos profissionais da beleza. Menos burocracia, mais resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-[2rem] bg-[#FDFBF7] hover:bg-white hover:shadow-xl hover:shadow-[#C6A84B]/10 transition-all duration-300 border border-transparent hover:border-[#C6A84B]/20 group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#C6A84B] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h4 className="font-display font-bold text-lg mb-3 text-[#1A1A1A]">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-4 bg-[#C6A84B]/10 rounded-[3rem] transform -rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Salon Interior" 
              className="relative rounded-[2.5rem] shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
          
          <div className="order-1 md:order-2 space-y-8">
            <h3 className="text-4xl font-display font-bold text-[#1A1A1A]">
              Feito para quem transforma <span className="italic text-[#C6A84B]">autoestima</span>.
            </h3>
            
            <ul className="space-y-4">
              {[
                'Cabeleireiros e Coloristas',
                'Manicures e Pedicures',
                'Esteticistas e Biomédicos',
                'Maquiadores Profissionais',
                'Designers de Sobrancelhas e Cílios',
                'Barbeiros e Studios de Tatuagem'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-[#C6A84B]/20 flex items-center justify-center text-[#C6A84B]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
              <div className="flex gap-1 text-[#C6A84B] mb-3">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-600 italic text-sm mb-4">
                "Minha agenda vivia bagunçada e eu perdia muito tempo no WhatsApp. Com o Beauty Agenda, minhas clientes agendam sozinhas e eu ainda vendo meus produtos de skin care online!"
              </p>
              <p className="font-bold text-sm text-[#1A1A1A]">— Juliana Costa, Studio Beauty Pro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-4xl font-display font-bold text-[#1A1A1A]">
              Escolha o plano que <span className="italic text-[#C6A84B]">combina</span> com você.
            </h3>
            <p className="text-gray-600 mt-4">
              Sem taxas de adesão, sem fidelidade. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative bg-white rounded-[2.5rem] p-8 flex flex-col transition-all duration-300 ${
                  plan.featured 
                    ? 'border-2 border-[#C6A84B] shadow-2xl shadow-[#C6A84B]/10 scale-105 z-10' 
                    : 'border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#C6A84B] text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    MAIS POPULAR
                  </div>
                )}
                
                <h4 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">{plan.name}</h4>
                <p className="text-xs text-gray-500 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-sm text-gray-500 font-medium mr-1">R$</span>
                  <span className="text-5xl font-display font-bold text-[#1A1A1A]">{plan.price}</span>
                  <span className="text-xl font-display font-bold text-[#1A1A1A]">{plan.cents}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#C6A84B]/10 flex items-center justify-center text-[#C6A84B] flex-shrink-0 mt-0.5">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/register" 
                  className={`w-full block text-center py-4 rounded-full font-bold text-xs tracking-widest uppercase transition-all ${
                    plan.featured 
                      ? 'bg-[#C6A84B] text-white hover:bg-[#B8962E] shadow-lg shadow-[#C6A84B]/20' 
                      : 'bg-white border border-[#C6A84B]/30 text-[#C6A84B] hover:bg-[#C6A84B]/5'
                  }`}
                >
                  {plan.cta}
                </Link>
                
                <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-wider">7 DIAS GRÁTIS</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-[#C6A84B]/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
                Pronta para elevar o nível do seu negócio?
              </h2>
              <p className="text-white/90 text-lg max-w-xl mx-auto">
                Junte-se a centenas de profissionais que já automatizaram sua gestão e aumentaram seu faturamento.
              </p>
              <div className="pt-4">
                <Link to="/register" className="bg-white text-[#C6A84B] px-10 py-5 rounded-full font-bold text-sm hover:bg-gray-50 transition-transform transform hover:scale-105 inline-flex items-center gap-2 shadow-xl">
                  CRIAR MINHA CONTA AGORA <ArrowRight size={20} />
                </Link>
              </div>
              <p className="text-white/70 text-xs uppercase tracking-widest font-medium">Teste grátis por 7 dias • Sem cartão de crédito necessário</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-[#C6A84B] text-white p-1.5 rounded-lg">
                <Calendar size={20} />
              </div>
              <div className="leading-tight">
                <h1 className="font-display font-bold text-lg text-[#1A1A1A]">Beauty</h1>
                <p className="text-[10px] tracking-widest uppercase text-[#C6A84B] font-bold">AGENDA</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              A plataforma de gestão definitiva para profissionais da beleza. Transformamos sua rotina em uma experiência de luxo e eficiência.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#C6A84B] transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-[#C6A84B] transition-colors">Planos e Preços</a></li>
              <li><a href="#" className="hover:text-[#C6A84B] transition-colors">Acessar Sistema</a></li>
              <li><a href="#" className="hover:text-[#C6A84B] transition-colors">Criar Conta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/terms" className="hover:text-[#C6A84B] transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-[#C6A84B] transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/lgpd" className="hover:text-[#C6A84B] transition-colors">LGPD</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#C6A84B]" />
                {contactInfo.phone}
              </li>
              <li className="flex items-center gap-2">
                <Users size={16} className="text-[#C6A84B]" />
                {contactInfo.instagram}
              </li>
              <li className="flex items-center gap-2">
                <Globe size={16} className="text-[#C6A84B]" />
                {contactInfo.website}
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} Beauty Agenda. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/terms">Termos de Uso</Link>
            <Link to="/privacy">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
