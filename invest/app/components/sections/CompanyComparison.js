import React from 'react';
import { QualityIndicator } from '/invest/app/components/shared/MockupElements.js';
import { comparisonTickers, getCompany, formatCurrency, formatNumber, formatPercent, formatSignedPercent } from '/invest/app/data/investData.js';
const companies = comparisonTickers.map((ticker) => getCompany(ticker));
const metrics = [
    { key: 'price', label: 'Preço' },
    { key: 'estimated', label: 'Valor estimado' },
    { key: 'discount', label: 'Desconto/Ágio' },
    { key: 'quality', label: 'Qualidade' },
    { key: 'pl', label: 'P/L' },
    { key: 'pvp', label: 'P/VP' },
    { key: 'roe', label: 'ROE' },
    { key: 'roic', label: 'ROIC' },
    { key: 'dy', label: 'DY' },
];
export default function CompanyComparison() {
    return (React.createElement("section", { id: "comparacao", className: "bg-axiva-bg py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-[40%_60%] lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-5" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "h-px w-6 bg-axiva-green" }),
                        React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Comparação")),
                    React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Compare antes de escolher o que analisar mais a fundo."),
                    React.createElement("p", { className: "text-base leading-relaxed text-axiva-gray" }, "Coloque empresas lado a lado para enxergar diferenças de valuation, qualidade e fundamentos com mais facilidade.")),
                React.createElement("div", { className: "rounded-xl border border-slate-200 bg-white shadow-sm" },
                    React.createElement("div", { className: "p-5 sm:p-6" },
                        React.createElement("div", { className: "mb-4 flex items-center gap-2" },
                            React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, "Comparação de empresas")),
                        React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement("table", { className: "w-full text-sm" },
                                React.createElement("thead", null,
                                    React.createElement("tr", { className: "border-b border-slate-200" },
                                        React.createElement("th", { className: "pb-3 pr-4 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400" }, "Indicador"),
                                        companies.map((c) => (React.createElement("th", { key: c.ticker, className: "pb-3 px-4 text-left" },
                                            React.createElement("div", { className: "text-sm font-semibold text-axiva-navy" }, c.ticker),
                                            React.createElement("div", { className: "text-[11px] font-normal text-slate-400" }, c.name)))))),
                                React.createElement("tbody", null, metrics.map((metric) => (React.createElement("tr", { key: metric.key, className: "border-b border-slate-100" },
                                    React.createElement("td", { className: "py-3 pr-4 text-xs text-slate-400" }, metric.label),
                                    companies.map((c) => {
                                        if (metric.key === 'quality') {
                                            return (React.createElement("td", { key: c.ticker, className: "py-3 px-4" },
                                                React.createElement(QualityIndicator, { score: c.quality })));
                                        }
                                        let value = 'N/D';
                                        if (metric.key === 'price') value = formatCurrency(c.price);
                                        if (metric.key === 'estimated') value = formatCurrency(c.estimated);
                                        if (metric.key === 'discount') value = formatSignedPercent(c.discount);
                                        if (metric.key === 'pl') value = formatNumber(c.pl, 2);
                                        if (metric.key === 'pvp') value = formatNumber(c.pvp, 2);
                                        if (metric.key === 'roe') value = formatPercent(c.roe);
                                        if (metric.key === 'roic') value = c.roic == null ? 'N/D' : formatPercent(c.roic);
                                        if (metric.key === 'dy') value = formatPercent(c.dy);
                                        const isDiscount = metric.key === 'discount';
                                        return (React.createElement("td", { key: c.ticker, className: `py-3 px-4 text-sm font-medium ${isDiscount ? (c.discount <= 0 ? 'text-axiva-green' : 'text-red-500') : 'text-axiva-navy'}` }, value));
                                    })))))))))))));
}
