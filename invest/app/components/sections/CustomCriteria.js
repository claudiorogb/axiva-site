import React from 'react';
import { List, Bell, SlidersHorizontal } from 'lucide-react';
import { QualityIndicator } from '/invest/app/components/shared/MockupElements.js';
import { customListTickers, getCompany, formatPercent } from '/invest/app/data/investData.js';
export default function CustomCriteria() {
    const items = customListTickers.map((ticker) => getCompany(ticker));
    return (React.createElement("section", { id: "criterios", className: "bg-white py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-10 max-w-2xl" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    
                    React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Personalização")),
                React.createElement("h2", { className: "mt-3 text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Crie os seus critérios."),
                React.createElement("p", { className: "mt-4 text-base text-axiva-gray" }, "Organize sua própria forma de acompanhar empresas com listas, critérios e estratégias que façam sentido para você.")),
            React.createElement("div", { className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" },
                React.createElement("div", { className: "grid lg:grid-cols-[220px_1fr]" },
                    React.createElement("div", { className: "border-b border-slate-200 p-4 lg:border-b-0 lg:border-r" },
                        React.createElement("nav", { className: "flex flex-col gap-1" },
                            React.createElement("button", { className: "flex items-center gap-2 rounded-lg bg-axiva-green-soft px-3 py-2 text-sm font-medium text-axiva-navy" },
                                React.createElement(List, { className: "h-4 w-4 text-axiva-green", strokeWidth: 1.5 }),
                                "Minha Lista"),
                            React.createElement("button", { className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-axiva-gray hover:bg-slate-50" },
                                React.createElement(Bell, { className: "h-4 w-4 text-slate-400", strokeWidth: 1.5 }),
                                "Meus alertas"),
                            React.createElement("button", { className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-axiva-gray hover:bg-slate-50" },
                                React.createElement(SlidersHorizontal, { className: "h-4 w-4 text-slate-400", strokeWidth: 1.5 }),
                                "Meus critérios"))),
                    React.createElement("div", { className: "p-5 sm:p-6" },
                        React.createElement("div", { className: "mb-4 flex items-center justify-between" },
                            React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, "Minha Lista"),
                            React.createElement("span", { className: "text-xs text-slate-400" },
                                items.length,
                                " empresas")),
                        React.createElement("div", { className: "flex flex-col gap-2" }, items.map((item) => (React.createElement("div", { key: item.ticker, className: "flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3" },
                            React.createElement("div", null,
                                React.createElement("div", { className: "text-sm font-semibold text-axiva-navy" }, item.ticker),
                                React.createElement("div", { className: "text-[11px] text-slate-400" }, item.name)),
                            React.createElement("div", { className: "flex items-center gap-4" },
                                React.createElement("span", { className: "hidden text-xs font-medium text-axiva-green sm:block" }, `DY ${formatPercent(item.dy)}`),
                                React.createElement(QualityIndicator, { score: item.quality })))))),
                        React.createElement("div", { className: "mt-5 rounded-lg border border-axiva-green/20 bg-axiva-green-soft/30 p-4" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(Bell, { className: "h-4 w-4 text-axiva-green", strokeWidth: 1.5 }),
                                React.createElement("span", { className: "text-sm font-medium text-axiva-navy" }, "Alertas ativos")),
                            React.createElement("p", { className: "mt-2 text-xs text-axiva-gray" }, "3 alertas configurados para mudanças de preço, indicadores e critérios."))))))));
}
