import React from 'react';
import { ArrowRight } from 'lucide-react';
const examples = [
    { label: 'Critério', value: 'Qualidade AXIVA' },
    { label: 'Indicador', value: 'ROE' },
    { label: 'Cálculo', value: 'Lucro líquido / Patrimônio' },
    { label: 'Qualidade', value: 'Avaliação de consistência' },
    { label: 'Valuation', value: 'Múltiplos e Graham' },
    { label: 'Histórico', value: 'Evolução de 5 anos' },
];
export default function Methodology() {
    return (React.createElement("section", { id: "metodologia", className: "bg-axiva-bg py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid gap-12 lg:grid-cols-2 lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-5" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        
                        React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Metodologia e transparência")),
                    React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Entenda de onde vêm os resultados."),
                    React.createElement("p", { className: "text-base leading-relaxed text-axiva-gray" }, "A AXIVA apresenta os critérios por trás das análises para que você possa interpretar os resultados e formar sua própria conclusão."),
                    React.createElement("div", { className: "mt-4 rounded-lg border-l-2 border-axiva-green bg-white px-5 py-4" },
                        React.createElement("p", { className: "text-base font-medium text-axiva-navy" }, "Você não precisa confiar em uma nota sem entender de onde ela veio.")),
                    React.createElement("a", { href: "https://axiva.com.br/invest/private", className: "mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-axiva-green transition-colors hover:text-axiva-green-dark" },
                        "Conhecer a metodologia",
                        React.createElement(ArrowRight, { className: "h-3.5 w-3.5" }))),
                React.createElement("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3" }, examples.map((item) => (React.createElement("div", { key: item.label, className: "rounded-lg border border-slate-200 bg-white p-4" },
                    React.createElement("span", { className: "text-[11px] font-medium uppercase tracking-wide text-slate-400" }, item.label),
                    React.createElement("p", { className: "mt-1.5 text-sm font-medium text-axiva-navy" }, item.value)))))))));
}
