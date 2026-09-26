import React from 'react';
import { ArrowRight } from 'lucide-react';
import BrowserFrame from '../shared/BrowserFrame.js';
import { MockupStat, MiniLineChart, QualityIndicator, MockupBadge } from '../shared/MockupElements.js';
const LOGIN_URL = 'https://axiva.com.br/invest/private';
export default function Hero() {
    return (React.createElement("section", { id: "top", className: "bg-axiva-bg pt-16 pb-20 lg:pt-24 lg:pb-32" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-2 lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-6" },
                    React.createElement("h1", { className: "text-3xl font-bold leading-tight text-axiva-navy text-balance sm:text-4xl lg:text-[2.75rem]" }, "Analise investimentos com mais informação e menos improviso."),
                    React.createElement("p", { className: "max-w-lg text-base text-axiva-gray sm:text-lg" }, "Pesquise empresas, analise fundamentos e valuation, compare alternativas e acompanhe seus investimentos em um único lugar."),
                    React.createElement("div", { className: "flex" },
                        React.createElement("a", { href: LOGIN_URL, className: "inline-flex items-center justify-center gap-2 rounded-lg bg-axiva-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-axiva-green-dark" },
                            "Acessar área de assinantes",
                            React.createElement(ArrowRight, { className: "h-4 w-4" })))),
                React.createElement("div", { className: "relative" },
                    React.createElement(BrowserFrame, { url: "axivainvest.com.br/analise/PETR4" },
                        React.createElement("div", { className: "p-5 sm:p-6" },
                            React.createElement("div", { className: "mb-5 flex items-start justify-between" },
                                React.createElement("div", null,
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("span", { className: "text-lg font-bold text-axiva-navy" }, "PETR4"),
                                        React.createElement(MockupBadge, null, "MOCKUP")),
                                    React.createElement("span", { className: "text-xs text-slate-400" }, "Petrobras PN")),
                                React.createElement(QualityIndicator, { score: 4 })),
                            React.createElement("div", { className: "mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4" },
                                React.createElement(MockupStat, { label: "Preço atual", value: "R$ 38,45" }),
                                React.createElement(MockupStat, { label: "Valor estimado", value: "R$ 42,10" }),
                                React.createElement(MockupStat, { label: "Desconto", value: "-8,7%", hint: "sobre valor estimado" }),
                                React.createElement(MockupStat, { label: "Graham", value: "R$ 45,20" })),
                            React.createElement("div", { className: "mb-5 rounded-lg border border-slate-200 p-3" },
                                React.createElement("div", { className: "mb-2 flex items-center justify-between" },
                                    React.createElement("span", { className: "text-[11px] font-medium text-slate-400" }, "Histórico de preço, 6 meses"),
                                    React.createElement("span", { className: "text-[11px] font-medium text-axiva-green" }, "+12,3%")),
                                React.createElement(MiniLineChart, { className: "h-16 w-full" })),
                            React.createElement("div", { className: "grid grid-cols-3 gap-3 sm:grid-cols-6" }, [
                                { label: 'P/L', value: '5,8' },
                                { label: 'P/VP', value: '1,2' },
                                { label: 'ROE', value: '28,4%' },
                                { label: 'ROIC', value: '19,2%' },
                                { label: 'DY', value: '14,2%' },
                                { label: 'Qualidade', value: '4/5' },
                            ].map((stat) => (React.createElement("div", { key: stat.label, className: "rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2" },
                                React.createElement("div", { className: "text-[10px] font-medium uppercase tracking-wide text-slate-400" }, stat.label),
                                React.createElement("div", { className: "mt-0.5 text-sm font-semibold text-axiva-navy" }, stat.value))))),
                            React.createElement("div", { className: "mt-5 flex gap-2 border-b border-slate-200 pb-0" }, ['Visão geral', 'Fundamentos', 'Valuation', 'Histórico'].map((tab, i) => (React.createElement("button", { key: tab, className: `rounded-t-lg px-3 py-2 text-xs font-medium transition-colors ${i === 0
                                    ? 'border-b-2 border-axiva-green text-axiva-navy'
                                    : 'text-slate-400 hover:text-axiva-gray'}` }, tab)))))),
                    React.createElement("div", { className: "pointer-events-none absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-xl border border-slate-100 bg-slate-50/60" }))))));
}
