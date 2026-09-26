import React from 'react';
const audiences = [
    {
        title: 'Para quem usa vários sites e planilhas',
        text: 'Centralize as principais informações utilizadas na análise.',
    },
    {
        title: 'Para quem quer entender melhor os números',
        text: 'Organize indicadores e critérios para facilitar a interpretação.',
    },
    {
        title: 'Para quem já tem seus próprios critérios',
        text: 'Crie listas e estratégias de acompanhamento de acordo com sua forma de analisar.',
    },
];
export default function WhoIsItFor() {
    return (React.createElement("section", { id: "para-quem", className: "bg-white py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-12 max-w-2xl" },
                React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Para quem quer analisar investimentos com mais estrutura.")),
            React.createElement("div", { className: "grid gap-8 sm:grid-cols-3 lg:gap-12" }, audiences.map((audience) => (React.createElement("div", { key: audience.title, className: "flex flex-col gap-2" },
                
                React.createElement("h3", { className: "text-base font-semibold text-axiva-navy" }, audience.title),
                React.createElement("p", { className: "text-sm leading-relaxed text-axiva-gray" }, audience.text))))))));
}
