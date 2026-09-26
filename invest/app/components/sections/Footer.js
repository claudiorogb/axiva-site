import React from 'react';
import Logo from '../shared/Logo.js';
const footerLinks = [
    { label: 'Plataforma', href: '#plataforma' },
    { label: 'Metodologia', href: '#metodologia' },
    { label: 'Planos', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Informações importantes', href: '#informacoes' },
    { label: 'Política de Privacidade', href: 'https://axiva.com.br/privacidade' },
    { label: 'Termos de Uso', href: 'https://axiva.com.br/termos' },
    { label: 'Acesso', href: 'https://axiva.com.br/invest/private' },
];
export default function Footer() {
    return (React.createElement("footer", { className: "border-t border-slate-200 bg-axiva-bg" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 py-12 lg:px-8" },
            React.createElement("div", { className: "grid gap-10 lg:grid-cols-[1fr_2fr]" },
                React.createElement("div", { className: "flex flex-col gap-3" },
                    React.createElement(Logo, { variant: "footer" }),
                    React.createElement("p", { className: "max-w-xs text-sm text-axiva-gray" }, "Análise que encontra valor.")),
                React.createElement("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4" }, footerLinks.map((link) => (React.createElement("a", { key: link.label, href: link.href, className: "text-sm text-axiva-gray transition-colors hover:text-axiva-navy" }, link.label))))),
            React.createElement("div", { id: "informacoes", className: "mt-12 border-t border-slate-200 pt-8" },
                React.createElement("p", { className: "text-xs leading-relaxed text-slate-400" }, "As informações apresentadas na AXIVA Invest têm caráter informativo e não constituem recomendação de investimento. A decisão de investir é de responsabilidade do usuário. Investimentos em renda variável estão sujeitos a riscos de perda do capital investido. Rentabilidade passada não garante rentabilidade futura. A AXIVA Invest não realiza operações de compra ou venda de valores mobiliários."),
                React.createElement("p", { className: "mt-4 text-xs text-slate-400" },
                    "© ",
                    new Date().getFullYear(),
                    " AXIVA Invest. Todos os direitos reservados.")))));
}
