import React from 'react';
import { ArrowRight } from 'lucide-react';
import BrowserFrame from '/invest/app/components/shared/BrowserFrame.js';
import CompanyPreview from '/invest/app/components/shared/CompanyPreview.js';
import { getCompany } from '/invest/app/data/investData.js';
export default function Hero() {
    const company = getCompany('PETR4');
    return (React.createElement("section", { id: "top", className: "bg-axiva-bg pt-16 pb-20 lg:pt-24 lg:pb-32" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-2 lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-6" },
                    React.createElement("h1", { className: "text-3xl font-bold leading-tight text-axiva-navy text-balance sm:text-4xl lg:text-[2.75rem]" }, "Analise investimentos com mais informação e menos improviso."),
                    React.createElement("p", { className: "max-w-xl text-base text-axiva-gray sm:text-lg" }, "Pesquise empresas, analise fundamentos e valuation, compare alternativas e acompanhe seus investimentos em um único lugar."),
                    React.createElement("div", { className: "flex" },
                        React.createElement("a", { href: "https://axiva.com.br/invest/private", className: "inline-flex items-center justify-center gap-2 rounded-lg bg-axiva-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-axiva-green-dark" },
                            "Acessar área de assinantes",
                            React.createElement(ArrowRight, { className: "h-4 w-4" })))),
                React.createElement("div", { className: "relative" },
                    React.createElement(BrowserFrame, { showChrome: false },
                        React.createElement(CompanyPreview, { company: company, compact: true })),
                    React.createElement("div", { className: "pointer-events-none absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-xl border border-slate-100 bg-slate-50/60" }))))));
}
