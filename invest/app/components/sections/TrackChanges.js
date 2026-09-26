import React from 'react';
import { TrendingUp, RefreshCw, Filter } from 'lucide-react';
const timeline = [
    { ticker: 'PETR4', event: 'Preço alterado', detail: 'R$ 37,90 → R$ 38,45 (+1,45%)', time: 'há 2h', icon: TrendingUp },
    { ticker: 'ITUB4', event: 'Indicador atualizado', detail: 'ROE revisado: 21,8% → 22,1%', time: 'há 5h', icon: RefreshCw },
    { ticker: 'WEGE3', event: 'Entrou em critério', detail: 'Qualidade elevada (5/5)', time: 'há 1 dia', icon: Filter },
];
export default function TrackChanges() {
    return (React.createElement("section", { id: "acompanhar", className: "bg-axiva-bg py-16 lg:py-24" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-2 lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-5" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        
                        React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Acompanhamento")),
                    React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl" }, "Não precisa recomeçar sua análise todos os dias."),
                    React.createElement("p", { className: "text-base leading-relaxed text-axiva-gray" }, "Acompanhe mudanças relevantes nas empresas e concentre sua atenção no que realmente mudou.")),
                React.createElement("div", { className: "rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" },
                    React.createElement("div", { className: "mb-5 flex items-center justify-between" },
                        React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, "O que mudou hoje"),
                        React.createElement("span", { className: "text-xs text-slate-400" }, "3 atualizações")),
                    React.createElement("div", { className: "flex flex-col gap-1" }, timeline.map((item, idx) => (React.createElement("div", { key: idx, className: "relative flex gap-4 pb-6 last:pb-0" },
                        idx < timeline.length - 1 && (React.createElement("div", { className: "absolute left-[15px] top-8 bottom-0 w-px bg-slate-200" })),
                        React.createElement("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-axiva-green/20 bg-axiva-green-soft" },
                            React.createElement(item.icon, { className: "h-4 w-4 text-axiva-green", strokeWidth: 1.5 })),
                        React.createElement("div", { className: "flex flex-col gap-0.5 pt-1" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "text-sm font-semibold text-axiva-navy" }, item.ticker),
                                React.createElement("span", { className: "text-xs text-slate-400" }, item.time)),
                            React.createElement("span", { className: "text-sm text-axiva-gray" }, item.event),
                            React.createElement("span", { className: "text-xs text-slate-400" }, item.detail)))))))))));
}
