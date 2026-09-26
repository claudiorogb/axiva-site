import React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
const faqs = [
    {
        q: 'O que é a AXIVA Invest?',
        a: 'A AXIVA Invest é uma plataforma para pesquisar, analisar, comparar e acompanhar investimentos. Reúne dados fundamentalistas, indicadores de qualidade, valuation e ferramentas de acompanhamento em um único lugar.',
    },
    {
        q: 'A AXIVA recomenda ações?',
        a: 'Não. A AXIVA fornece informação, ferramentas e critérios para apoiar sua análise. A decisão de investir permanece com você.',
    },
    {
        q: 'O que é a Seleção AXIVA?',
        a: 'A Seleção AXIVA aplica critérios da nossa metodologia para destacar empresas que merecem uma análise mais aprofundada. É um ponto de partida, não uma recomendação de compra.',
    },
    {
        q: 'Como funciona o valuation?',
        a: 'A AXIVA apresenta valor estimado e referências como Graham com base em metodologias descritas na plataforma. Os critérios são transparentes para que você interprete os resultados.',
    },
    {
        q: 'Como é calculada a qualidade?',
        a: 'O indicador de qualidade considera fatores como consistência de lucro, ROE, endividamento e crescimento. Os critérios utilizados são apresentados para cada empresa.',
    },
    {
        q: 'Posso criar meus próprios critérios?',
        a: 'Sim. Você pode criar listas, estratégias e alertas com os critérios que fazem sentido para sua forma de analisar.',
    },
    {
        q: 'Os dados são atualizados?',
        a: 'Sim. Os dados das empresas e indicadores de mercado são atualizados conforme a frequência definida para cada fonte.',
    },
    {
        q: 'Quais empresas posso analisar?',
        a: 'A plataforma abrange empresas listadas na B3. Você pode pesquisar por ticker, setor ou utilizando os filtros disponíveis.',
    },
    {
        q: 'Preciso entender de análise fundamentalista para usar?',
        a: 'Não. A AXIVA organiza os indicadores e critérios para facilitar a interpretação, mas ter familiaridade com os conceitos ajuda a aproveitar melhor as ferramentas.',
    },
    {
        q: 'Como funciona o acesso?',
        a: 'O acesso é feito por assinatura com opções mensal, trimestral, semestral e anual. O pagamento pode ser feito por cartão ou PIX, conforme o plano.',
    },
];
export default function FAQ() {
    const [open, setOpen] = useState(0);
    return (React.createElement("section", { id: "faq", className: "bg-white py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-10 max-w-2xl" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    
                    React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Dúvidas frequentes")),
                React.createElement("h2", { className: "mt-3 text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Perguntas e respostas")),
            React.createElement("div", { className: "mx-auto max-w-3xl divide-y divide-slate-200 border-y border-slate-200" }, faqs.map((faq, idx) => (React.createElement("div", { key: idx },
                React.createElement("button", { onClick: () => setOpen(open === idx ? null : idx), className: "flex w-full items-center justify-between gap-4 py-4 text-left", "aria-expanded": open === idx },
                    React.createElement("span", { className: "text-sm font-medium text-axiva-navy" }, faq.q),
                    React.createElement(ChevronDown, { className: `h-4 w-4 shrink-0 text-slate-400 transition-transform ${open === idx ? 'rotate-180' : ''}` })),
                open === idx && (React.createElement("div", { className: "animate-fade-in pb-4 pr-8" },
                    React.createElement("p", { className: "text-sm leading-relaxed text-axiva-gray" }, faq.a))))))))));
}
