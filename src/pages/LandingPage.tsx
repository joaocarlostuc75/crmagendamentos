import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap,
  MessageCircle,
  Smartphone,
  Globe,
  Instagram
} from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';

export default function LandingPage() {
  const plans = [
    {
      name: "Básico",
      price: "29,99",
      description: "Ideal para profissionais autônomos que estão começando.",
      features: [
        "Agenda Online Inteligente",
        "Gestão de Clientes",
        "Relatórios Básicos",
        "Lembretes via Sistema",
        "Página de Agendamento Pública"
      ],
      cta: "CRIAR CONTA AGORA",
      highlight: false
    },
    {
      name: "Avançado",
      price: "49,99",
      description: "Perfeito para studios em crescimento que vendem produtos.",
      features: [
        "Tudo do Plano Básico",
        "Gestão de Produtos (E-commerce)",
        "Controle de Estoque Automático",
        "WhatsApp Integrado",
        "Registro de Vendas Diretas"
      ],
      cta: "CRIAR CONTA AGORA",
      highlight: true
    },
    {
      name: "Master",
      price: "69,99",
      description: "A solução completa para gestão total do seu negócio.",
      features: [
        "Tudo do Plano Avançado",
        "Relatórios Financeiros Completos",
        "Landing Page Própria",
        "Suporte Prioritário 24/7",
        "Multi-usuário / Colaboradores"
      ],
      cta: "CRIAR CONTA AGORA",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-primary/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Calendar size={24} />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-gray-900 leading-none block">Beauty</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Agenda</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#plans" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Planos</a>
            <Link to="/login" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Entrar</Link>
            <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
              CRIAR CONTA AGORA
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} /> 7 Dias de Acesso Grátis
            </div>
            <h1 className="font-display text-6xl md:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tighter mb-6">
              A Gestão <span className="text-primary italic">Luxuosa</span> que seu Studio merece.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
              Agenda inteligente, controle de estoque, relatórios financeiros e uma loja online completa. Tudo em um só lugar para você focar no que realmente importa: sua arte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group">
                CRIAR CONTA AGORA <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#plans" className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-primary/30 transition-all flex items-center justify-center">
                Ver Planos
              </a>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">+500 profissionais</span> já transformaram seus negócios.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-4 transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <WatermarkedImage 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800&h=1000" 
                alt="Dashboard Preview" 
                className="rounded-[2.5rem] w-full shadow-inner"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Novo Agendamento</p>
                    <p className="font-bold text-gray-900">R$ 150,00 Confirmado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tudo o que você precisa para <span className="text-primary italic">brilhar</span>.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Desenvolvemos cada funcionalidade pensando na rotina real dos profissionais da beleza. Menos burocracia, mais resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Calendar className="text-primary" />,
                title: "Agenda Inteligente",
                desc: "Agendamentos online 24h por dia, sem precisar responder mensagens o tempo todo."
              },
              {
                icon: <ShoppingBag className="text-primary" />,
                title: "Loja Integrada",
                desc: "Venda seus produtos online e receba pedidos diretamente no seu WhatsApp."
              },
              {
                icon: <BarChart3 className="text-primary" />,
                title: "Financeiro Real",
                desc: "Saiba exatamente quanto está ganhando por serviço e por venda de produto."
              },
              {
                icon: <Users className="text-primary" />,
                title: "CRM de Clientes",
                desc: "Histórico completo, preferências e controle de gastos de cada cliente."
              },
              {
                icon: <MessageCircle className="text-primary" />,
                title: "WhatsApp Marketing",
                desc: "Lembretes automáticos e confirmações de pedidos via WhatsApp."
              },
              {
                icon: <Smartphone className="text-primary" />,
                title: "Mobile First",
                desc: "Acesse e gerencie tudo do seu celular, de onde estiver, com interface fluida."
              },
              {
                icon: <Globe className="text-primary" />,
                title: "Página Pública",
                desc: "Um link exclusivo para sua bio do Instagram com todos os seus serviços e produtos."
              },
              {
                icon: <ShieldCheck className="text-primary" />,
                title: "Segurança Total",
                desc: "Seus dados protegidos com tecnologia de ponta e backups automáticos."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Audience */}
      <section className="py-32 px-6 bg-background-light">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <WatermarkedImage 
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800&h=600" 
              alt="Ideal for you" 
              className="rounded-[3rem] shadow-2xl"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Feito para quem transforma <span className="text-primary italic">autoestima</span>.
            </h2>
            <div className="space-y-6">
              {[
                "Cabeleireiros e Coloristas",
                "Manicures e Pedicures",
                "Esteticistas e Biomédicos",
                "Maquiadores Profissionais",
                "Designers de Sobrancelhas e Cílios",
                "Barbeiros e Studios de Tatuagem"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 p-8 bg-white rounded-3xl border border-primary/10 luxury-shadow">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-primary text-primary" />)}
              </div>
              <p className="italic text-gray-600 mb-4">
                "Minha agenda vivia bagunçada e eu perdia muito tempo no WhatsApp. Com o Beauty Agenda, minhas clientes agendam sozinhas e eu ainda vendo meus produtos de skin care online!"
              </p>
              <p className="font-bold text-gray-900">— Juliana Costa, Studio Beauty Pro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Escolha o plano que <span className="text-primary italic">combina</span> com você.
            </h2>
            <p className="text-gray-500">
              Sem taxas de adesão, sem fidelidade. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`relative p-10 rounded-[3rem] border transition-all duration-500 ${plan.highlight ? 'bg-white border-primary shadow-2xl scale-105 z-10' : 'bg-gray-50/50 border-gray-100 hover:border-primary/30'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                    Mais Popular
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-8 h-10">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-gray-400 text-sm font-medium">R$</span>
                  <span className="text-5xl font-display font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm font-medium">/mês</span>
                </div>
                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/register" 
                  className={`w-full py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 ${plan.highlight ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-dark' : 'bg-white text-primary border border-primary/20 hover:bg-primary/5'}`}
                >
                  {plan.cta}
                </Link>
                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">7 Dias Grátis</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Pronta para elevar o nível do seu negócio?
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto">
              Junte-se a centenas de profissionais que já automatizaram sua gestão e aumentaram seu faturamento.
            </p>
            <Link to="/register" className="inline-flex bg-white text-primary px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform gap-3 items-center">
              CRIAR MINHA CONTA AGORA <ArrowRight />
            </Link>
            <p className="text-white/60 text-xs mt-8 uppercase tracking-[0.2em] font-bold">
              Teste grátis por 7 dias • Sem cartão de crédito necessário
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <Calendar size={24} />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-gray-900 leading-none block">Beauty</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Agenda</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              A plataforma de gestão definitiva para profissionais da beleza. Transformamos sua rotina em uma experiência de luxo e eficiência.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#plans" className="hover:text-primary transition-colors">Planos e Preços</a></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Acessar Sistema</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Criar Conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center gap-3"><MessageCircle size={16} className="text-primary" /> (11) 99999-9999</li>
              <li className="flex items-center gap-3"><Instagram size={16} className="text-primary" /> @beautyagenda</li>
              <li className="flex items-center gap-3"><Globe size={16} className="text-primary" /> beautyagenda.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            © 2024 Beauty Agenda. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
