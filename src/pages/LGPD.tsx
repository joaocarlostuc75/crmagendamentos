import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LGPD() {
  return (
    <div className="bg-[#FDFBF7] min-h-screen font-body text-[#1A1A1A] p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
        <Link to="/" className="inline-flex items-center text-[#C6A84B] font-bold text-sm mb-8 hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Voltar para Home
        </Link>
        
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A]">LGPD - Lei Geral de Proteção de Dados</h1>
        
        <div className="prose prose-stone max-w-none text-gray-600">
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h3>1. Compromisso com a LGPD</h3>
          <p>O BeautyAgenda está comprometido com a conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantindo a privacidade e a segurança dos dados pessoais de nossos usuários.</p>
          
          <h3>2. Seus Direitos como Titular de Dados</h3>
          <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
          <ul>
            <li>Confirmação da existência de tratamento de dados;</li>
            <li>Acesso aos dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>Portabilidade dos dados a outro fornecedor de serviço ou produto;</li>
            <li>Eliminação dos dados pessoais tratados com o consentimento do titular;</li>
            <li>Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;</li>
            <li>Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;</li>
            <li>Revogação do consentimento.</li>
          </ul>
          
          <h3>3. Encarregado de Proteção de Dados (DPO)</h3>
          <p>Para exercer seus direitos ou tirar dúvidas sobre o tratamento de seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados através do e-mail: dpo@beautyagenda.com.</p>
          
          <h3>4. Segurança da Informação</h3>
          <p>Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.</p>
          
          <h3>5. Transferência Internacional de Dados</h3>
          <p>Seus dados podem ser armazenados em servidores localizados fora do Brasil, sempre garantindo o nível de proteção exigido pela legislação brasileira.</p>
        </div>
      </div>
    </div>
  );
}
