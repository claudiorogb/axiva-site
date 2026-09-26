import React from 'react';
import BrowserFrame from '/invest/app/components/shared/BrowserFrame.js';
import CompanyPreview from '/invest/app/components/shared/CompanyPreview.js';
import { getCompany } from '/invest/app/data/investData.js';
export default function CompanyAnalysis() {
    const company = getCompany('ITUB4');
    return (React.createElement("section", { id: "analise", className: "bg-white py-16 lg:py-28" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "grid items-center gap-12 lg:grid-cols-[45%_55%] lg:gap-16" },
                React.createElement("div", { className: "flex flex-col gap-5" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "h-px w-6 bg-axiva-green" }),
                        React.createElement("span", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Análise de empresas")),
                    React.createElement("h2", { className: "text-2xl font-semibold text-axiva-navy sm:text-3xl lg:text-[2.25rem]" }, "Entenda a empresa antes de olhar apenas para o preço."),
                    React.createElement("p", { className: "text-base leading-relaxed text-axiva-gray" }, "Reúna os principais dados fundamentalistas, indicadores de qualidade, valuation e histórico em uma visão organizada para facilitar sua análise."),
                    React.createElement("ul", { className: "mt-2 flex flex-col gap-3" }, [
                        'Indicadores de qualidade e valuation em uma única tela',
                        'Histórico de preço e indicadores ao longo do tempo',
                        'Dados fundamentalistas organizados por categoria',
                    ].map((item) => (React.createElement("li", { key: item, className: "flex items-start gap-2.5 text-sm text-axiva-navy" },
                        React.createElement("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-axiva-green" }),
                        item))))),
                React.createElement("div", null,
                    React.createElement(BrowserFrame, { showChrome: false },
                        React.createElement(CompanyPreview, { company: company })))))));
}
