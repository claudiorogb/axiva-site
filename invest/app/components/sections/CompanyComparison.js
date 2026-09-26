import React from 'react';
import BrowserFrame from '../shared/BrowserFrame.js';
import { MockupBadge, QualityIndicator } from '../shared/MockupElements.js';
const companies = [
    { ticker: 'PETR4', name: 'Petrobras', price: 'R$ 38,45', estimated: 'R$ 42,10', discount: '-8,7%', quality: 4, pl: '5,8', pvp: '1,2', roe: '28,4%', roic: '19,2%', dy: '14,2%' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco', price: 'R$ 33,20', estimated: 'R$ 36,80', discount: '-9,8%', quality: 5, pl: '8,2', pvp: '1,8', roe: '22,1%', roic: '15,3%', dy: '6,8%' },
    { ticker: 'VALE3', name: 'Vale', price: 'R$ 61,30', estimated: 'R$ 58,00', discount: '+5,7%', quality: 4, pl: '6,1', pvp: '1,5', roe: '19,8%', roic: '14,7%', dy: '8,5%' },
];
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
                React.createElement("div", null,
                    React.createElement(BrowserFrame, { url: "axivainvest.com.br/comparacao" },
                        React.createElement("div", { className: "p-5 sm:p-6" },
                            React.createElement("div", { className: "mb-4 flex items-center gap-2" },
                                React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, "Comparação de empresas"),
                                React.createElement(MockupBadge, null, "MOCKUP")),
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
                                            const value = c[metric.key];
                                            if (metric.key === 'quality') {
                                                return (React.createElement("td", { key: c.ticker, className: "py-3 px-4" },
                                                    React.createElement(QualityIndicator, { score: Number(value) })));
                                            }
                                            const isDiscount = metric.key === 'discount';
                                            const isNegative = isDiscount && String(value).startsWith('-');
                                            return (React.createElement("td", { key: c.ticker, className: `py-3 px-4 text-sm font-medium ${isNegative ? 'text-axiva-green' : isDiscount ? 'text-red-500' : 'text-axiva-navy'}` }, value));
                                        }))))))))))))));
}
