import React from 'react';
import { Search, BarChart3, Bell } from 'lucide-react';
const pillars = [
    {
        icon: Search,
        title: 'Descubra',
        text: 'Encontre empresas utilizando indicadores, qualidade, valuation e critérios de análise.',
    },
    {
        icon: BarChart3,
        title: 'Analise e compare',
        text: 'Entenda fundamentos, preço, qualidade e diferenças entre empresas antes de aprofundar sua análise.',
    },
    {
        icon: Bell,
        title: 'Acompanhe',
        text: 'Crie listas, estratégias e alertas para acompanhar o que realmente importa para você.',
    },
];
export default function PlatformOverview() {
    return (React.createElement("section", { id: "plataforma", className: "bg-axiva-bg py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-12 max-w-2xl" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    
                    React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "A plataforma")),
                React.createElement("h2", { className: "mt-3 text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Uma plataforma. Mais clareza para analisar."),
                React.createElement("p", { className: "mt-4 text-base text-axiva-gray" }, "Da descoberta de empresas ao acompanhamento da sua estratégia, reúna as principais etapas da análise em um único ambiente.")),
            React.createElement("div", { className: "grid gap-10 sm:grid-cols-3 lg:gap-12" }, pillars.map((pillar) => (React.createElement("div", { key: pillar.title, className: "flex flex-col gap-3" },
                React.createElement(pillar.icon, { className: "h-5 w-5 text-axiva-green", strokeWidth: 1.5 }),
                React.createElement("div", { className: "h-px w-10 bg-axiva-green" }),
                React.createElement("h3", { className: "text-lg font-semibold text-axiva-navy" }, pillar.title),
                React.createElement("p", { className: "text-sm leading-relaxed text-axiva-gray" }, pillar.text))))))));
}
