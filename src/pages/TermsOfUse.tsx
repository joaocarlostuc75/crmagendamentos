import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="bg-[#FDFBF7] min-h-screen font-body text-[#1A1A1A] p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
        <Link to="/" className="inline-flex items-center text-[#C6A84B] font-bold text-sm mb-8 hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Home
        </Link>
        
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A]">Termos de Uso</h1>
        
        <div className="prose prose-stone max-w-none text-gray-600">
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h3>1. Aceitação dos Termos</h3>
          <p>Ao acessar e usar o BeautyAgenda, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.</p>
          
          <h3>2. Descrição do Serviço</h3>
          <p>O BeautyAgenda é uma plataforma de gestão para profissionais de beleza, oferecendo agendamento online, controle financeiro e ferramentas de marketing.</p>
          
          <h3>3. Cadastro e Conta</h3>
          <p>Para utilizar o serviço, você deve fornecer informações precisas e completas. Você é responsável por manter a confidencialidade de sua conta e senha.</p>
          
          <h3>4. Planos e Pagamentos</h3>
          <p>Oferecemos planos de assinatura (Básico, Avançado, Master). Os pagamentos são recorrentes e podem ser cancelados a qualquer momento, sem multa de fidelidade.</p>
          
          <h3>5. Uso Aceitável</h3>
          <p>Você concorda em não usar o serviço para qualquer finalidade ilegal ou não autorizada.</p>
          
          <h3>6. Modificações no Serviço</h3>
          <p>Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio.</p>
          
          <h3>7. Contato</h3>
          <p>Para dúvidas sobre estes termos, entre em contato através dos nossos canais oficiais.</p>
        </div>
      </div>
    </div>
  );
}
