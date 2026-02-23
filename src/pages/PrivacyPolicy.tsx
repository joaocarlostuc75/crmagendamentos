import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#FDFBF7] min-h-screen font-body text-[#1A1A1A] p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
        <Link to="/" className="inline-flex items-center text-[#C6A84B] font-bold text-sm mb-8 hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Home
        </Link>
        
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A]">Política de Privacidade</h1>
        
        <div className="prose prose-stone max-w-none text-gray-600">
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h3>1. Coleta de Informações</h3>
          <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e detalhes do seu negócio ao criar uma conta.</p>
          
          <h3>2. Uso das Informações</h3>
          <p>Usamos as informações coletadas para fornecer, manter e melhorar nossos serviços, processar transações e enviar comunicações importantes.</p>
          
          <h3>3. Compartilhamento de Informações</h3>
          <p>Não vendemos ou alugamos suas informações pessoais para terceiros. Compartilhamos dados apenas com prestadores de serviços que nos ajudam a operar o BeautyAgenda.</p>
          
          <h3>4. Segurança dos Dados</h3>
          <p>Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.</p>
          
          <h3>5. Seus Direitos</h3>
          <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações da sua conta.</p>
          
          <h3>6. Cookies e Tecnologias Semelhantes</h3>
          <p>Utilizamos cookies para melhorar sua experiência, analisar o uso do site e personalizar conteúdo.</p>
          
          <h3>7. Alterações nesta Política</h3>
          <p>Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre alterações significativas através do nosso site ou por e-mail.</p>
        </div>
      </div>
    </div>
  );
}
