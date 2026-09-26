import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { QualityIndicator } from '/invest/app/components/shared/MockupElements.js';
import { getCompany, researchTickers, formatCurrency, formatNumber, formatPercent } from '/invest/app/data/investData.js';
const filters = ['Ticker', 'Setor', 'P/L', 'P/VP', 'DY', 'ROE', 'ROIC', 'Qualidade', 'Preço'];
export default function FindCompanies() {
    const companies = researchTickers.map((ticker) => getCompany(ticker));
    return (React.createElement("section", { id: "pesquisa", className: "bg-axiva-bg py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-10 max-w-3xl" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    
                    React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Pesquisa de empresas")),
                React.createElement("h2", { className: "mt-3 text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Encontre empresas que fazem sentido para o que você procura."),
                React.createElement("p", { className: "mt-4 text-base text-axiva-gray" }, "Use filtros e critérios para explorar o mercado sem precisar analisar empresa por empresa desde o início.")),
            React.createElement("div", { className: "rounded-xl border border-slate-200 bg-white shadow-sm" },
                React.createElement("div", { className: "p-5 sm:p-6" },
                    React.createElement("div", { className: "mb-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" },
                        React.createElement(Search, { className: "h-4 w-4 text-slate-400" }),
                        React.createElement("span", { className: "text-sm text-slate-400" }, "Pesquisar por ticker, nome ou setor...")),
                    React.createElement("div", { className: "mb-5 flex flex-wrap gap-2" }, filters.map((filter) => (React.createElement("button", { key: filter, className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-axiva-gray transition-colors hover:border-axiva-green hover:text-axiva-navy" },
                        filter,
                        React.createElement(ChevronDown, { className: "h-3 w-3" }))))),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b border-slate-200" }, ['Ticker', 'Empresa', 'Setor', 'P/L', 'P/VP', 'DY', 'ROE', 'ROIC', 'Qualidade', 'Preço'].map((header) => (React.createElement("th", { key: header, className: "whitespace-nowrap py-2.5 pr-4 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400" }, header))))),
                            React.createElement("tbody", null, companies.map((c) => (React.createElement("tr", { key: c.ticker, className: "border-b border-slate-100 transition-colors hover:bg-slate-50" },
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm font-semibold text-axiva-navy" }, c.ticker),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-gray" }, c.name),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-gray" }, c.sector),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-navy" }, formatNumber(c.pl, 2)),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-navy" }, formatNumber(c.pvp, 2)),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-navy" }, formatPercent(c.dy)),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-navy" }, formatPercent(c.roe)),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm text-axiva-navy" }, c.roic == null ? 'N/D' : formatPercent(c.roic)),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4" },
                                    React.createElement(QualityIndicator, { score: c.quality })),
                                React.createElement("td", { className: "whitespace-nowrap py-3 pr-4 text-sm font-medium text-axiva-navy" }, formatCurrency(c.price)))))))))))));
}
