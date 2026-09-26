import React from 'react';
import { ArrowRight } from 'lucide-react';
import { QualityIndicator } from '/invest/app/components/shared/MockupElements.js';
import { getCompany, selectionTickers, formatSignedPercent } from '/invest/app/data/investData.js';
const criteriaMap = {
    ITUB4: 'Qualidade + Valuation',
    WEGE3: 'Qualidade + Crescimento',
    PETR4: 'Valuation + Dividendos',
    VALE3: 'Qualidade + Valuation',
};
export default function SelecaoAxiva() {
    const selectionItems = selectionTickers.map((ticker) => {
        const company = getCompany(ticker);
        return {
            ...company,
            criteria: criteriaMap[ticker],
        };
    });
    return (React.createElement("section", { id: "selecao", className: "bg-white py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-2 lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-5" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "h-px w-6 bg-axiva-green" }),
                        React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Seleção AXIVA")),
                    React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Quer um ponto de partida?"),
                    React.createElement("p", { className: "text-base leading-relaxed text-axiva-gray" }, "A Seleção AXIVA aplica critérios da nossa metodologia para destacar empresas que merecem uma análise mais aprofundada."),
                    React.createElement("p", { className: "text-sm text-axiva-gray" }, "Não é uma recomendação de compra. É uma forma de reduzir o universo de empresas para começar sua análise com mais estrutura."),
                    React.createElement("a", { href: "#metodologia", className: "inline-flex w-fit items-center gap-1.5 text-sm font-medium text-axiva-green transition-colors hover:text-axiva-green-dark" },
                        "Entender os critérios utilizados",
                        React.createElement(ArrowRight, { className: "h-3.5 w-3.5" }))),
                React.createElement("div", { className: "rounded-xl border border-slate-200 bg-white shadow-sm" },
                    React.createElement("div", { className: "p-5 sm:p-6" },
                        React.createElement("div", { className: "mb-4 flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, "Seleção AXIVA"),
                                React.createElement("span", { className: "ml-2 text-xs text-slate-400" }, "Critérios aplicados"))),
                        React.createElement("div", { className: "flex flex-col gap-2" }, selectionItems.map((item) => (React.createElement("div", { key: item.ticker, className: "flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:border-axiva-green/30 hover:bg-axiva-green-soft/30" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", null,
                                    React.createElement("div", { className: "text-sm font-semibold text-axiva-navy" }, item.ticker),
                                    React.createElement("div", { className: "text-[11px] text-slate-400" }, item.name))),
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement("div", { className: "hidden text-right sm:block" },
                                    React.createElement("div", { className: "text-[10px] text-slate-400" }, "Critério"),
                                    React.createElement("div", { className: "text-[11px] text-axiva-gray" }, item.criteria)),
                                React.createElement(QualityIndicator, { score: item.quality }),
                                React.createElement("span", { className: `text-sm font-medium ${item.discount <= 0 ? 'text-axiva-green' : 'text-red-500'}` }, formatSignedPercent(item.discount)))))))))))));
}
