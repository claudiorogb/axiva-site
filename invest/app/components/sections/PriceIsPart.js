import React from 'react';
import { useState } from 'react';
import { MiniLineChart, MockupStat, QualityIndicator } from '/invest/app/components/shared/MockupElements.js';
import { comparisonTickers, getCompany, formatCurrency, formatNumber, formatPercent } from '/invest/app/data/investData.js';
const tabs = ['Valor', 'Qualidade', 'Fundamentos', 'Comparação'];
export default function PriceIsPart() {
    const [active, setActive] = useState('Valor');
    const company = getCompany('PETR4');
    const comparisons = comparisonTickers.map((ticker) => getCompany(ticker));
    return (React.createElement("section", { id: "preco", className: "bg-axiva-navy py-16 lg:py-28" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-12 max-w-2xl" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    
                    React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Múltiplas dimensões")),
                React.createElement("h2", { className: "mt-3 text-2xl font-semibold text-white sm:text-3xl" }, "Preço é apenas uma parte da análise."),
                React.createElement("p", { className: "mt-4 text-base text-slate-300" }, "Entenda diferentes dimensões da empresa antes de formar sua própria conclusão.")),
            React.createElement("div", { className: "grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8" },
                React.createElement("nav", { className: "flex flex-row gap-1 overflow-x-auto hide-scrollbar lg:flex-col lg:gap-1", "aria-label": "Dimensões de análise" }, tabs.map((tab) => (React.createElement("button", { key: tab, onClick: () => setActive(tab), className: `shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${active === tab ? 'bg-axiva-green text-white' : 'text-slate-400 hover:bg-axiva-navy-light hover:text-white'}`, "aria-current": active === tab }, tab)))),
                React.createElement("div", { className: "rounded-xl border border-slate-700 bg-axiva-navy-light p-5 sm:p-6" },
                    React.createElement("div", { className: "mb-4 flex items-center gap-2" },
                        React.createElement("span", { className: "text-sm font-semibold text-white" }, company.ticker),
                        React.createElement("span", { className: "text-xs text-slate-400" }, company.name)),
                    active === 'Valor' && (React.createElement("div", { className: "animate-fade-in grid gap-5 sm:grid-cols-2 lg:grid-cols-4" },
                        React.createElement(MockupStat, { label: "Preço atual", value: formatCurrency(company.price), dark: true }),
                        React.createElement(MockupStat, { label: "P/L", value: formatNumber(company.pl, 2), dark: true }),
                        React.createElement(MockupStat, { label: "P/VP", value: formatNumber(company.pvp, 2), dark: true }),
                        React.createElement(MockupStat, { label: "Graham", value: formatCurrency(company.graham), dark: true }),
                        React.createElement("div", { className: "sm:col-span-2 lg:col-span-4" },
                            React.createElement("div", { className: "mb-2 text-[11px] font-medium text-slate-400" }, "Preço 6 meses"),
                            React.createElement(MiniLineChart, { values: company.history6m, className: "h-20 w-full" })))),
                    active === 'Qualidade' && (React.createElement("div", { className: "animate-fade-in flex flex-col gap-5" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-sm text-slate-300" }, "Indicador de qualidade"),
                            React.createElement(QualityIndicator, { score: company.quality, dark: true })),
                        React.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, company.notes?.map((item) => (React.createElement("div", { key: item, className: "flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2.5" },
                            React.createElement("span", { className: "text-xs text-slate-300" }, item),
                            React.createElement("span", { className: "text-xs font-medium text-axiva-green-light" }, "OK"))))))),
                    active === 'Fundamentos' && (React.createElement("div", { className: "animate-fade-in grid gap-3 sm:grid-cols-3 lg:grid-cols-6" }, [
                        { label: 'P/L', value: formatNumber(company.pl, 2) },
                        { label: 'P/VP', value: formatNumber(company.pvp, 2) },
                        { label: 'ROE', value: formatPercent(company.roe) },
                        { label: 'ROIC', value: company.roic == null ? 'N/D' : formatPercent(company.roic) },
                        { label: 'DY', value: formatPercent(company.dy) },
                        { label: 'Margem líq.', value: company.margin == null ? 'N/D' : formatPercent(company.margin) },
                    ].map((stat) => (React.createElement("div", { key: stat.label, className: "rounded-lg border border-slate-700 px-3 py-3" },
                        React.createElement("div", { className: "text-[10px] font-medium uppercase tracking-wide text-slate-500" }, stat.label),
                        React.createElement("div", { className: "mt-1 text-sm font-semibold text-white" }, stat.value)))))),

                    active === 'Comparação' && (React.createElement("div", { className: "animate-fade-in overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b border-slate-700" },
                                    React.createElement("th", { className: "pb-2 pr-4 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400" }, "Indicador"),
                                    comparisons.map((item) => (React.createElement("th", { key: item.ticker, className: "pb-2 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400" }, item.ticker))))),
                            React.createElement("tbody", null, [
                                { label: 'Preço', key: 'price' },
                                { label: 'Graham', key: 'graham' },
                                { label: 'P/VP', key: 'pvp' },
                                { label: 'P/L', key: 'pl' },
                                { label: 'ROE', key: 'roe' },
                                { label: 'DY', key: 'dy' },
                            ].map((row) => (React.createElement("tr", { key: row.label, className: "border-b border-slate-700/50" },
                                React.createElement("td", { className: "py-2.5 pr-4 text-xs text-slate-400" }, row.label),
                                comparisons.map((item) => {
                                    let value = 'N/D';
                                    if (row.key === 'price') value = formatCurrency(item.price);
                                    if (row.key === 'graham') value = formatCurrency(item.graham);
                                    if (row.key === 'pvp') value = formatNumber(item.pvp, 2);
                                    if (row.key === 'pl') value = formatNumber(item.pl, 2);
                                    if (row.key === 'roe') value = formatPercent(item.roe);
                                    if (row.key === 'dy') value = formatPercent(item.dy);
                                    return React.createElement("td", { key: item.ticker, className: "py-2.5 px-4 text-sm font-medium text-white" }, value);
                                })))))))))))));
}
