import React from 'react';
const plans = [
    {
        name: 'Mensal',
        price: 'R$ 19,90',
        detail: 'no cartão\nou PIX',
        button: 'ASSINAR PLANO MENSAL',
        href: 'https://api.whatsapp.com/send/?phone=5511921335619&text=Ol%C3%A1%21+Tenho+interesse+no+Plano+Mensal+do+Ranking+de+A%C3%A7%C3%B5es.&type=phone_number&app_absent=0',
    },
    {
        name: 'Trimestral',
        installments: '3x de',
        price: 'R$ 12,77',
        detail: 'no cartão\nou R$ 35,82 no PIX',
        button: 'ASSINAR PLANO TRIMESTRAL',
        href: 'https://api.whatsapp.com/send/?phone=5511921335619&text=Ol%C3%A1%21+Tenho+interesse+no+Plano+Trimestral+do+Ranking+de+A%C3%A7%C3%B5es.&type=phone_number&app_absent=0',
    },
    {
        name: 'Semestral',
        installments: '6x de',
        price: 'R$ 10,89',
        detail: 'no cartão\nou R$ 59,70 no PIX',
        button: 'ASSINAR PLANO SEMESTRAL',
        href: 'https://api.whatsapp.com/send/?phone=5511921335619&text=Ol%C3%A1%21+Tenho+interesse+no+Plano+Semestral+do+Ranking+de+A%C3%A7%C3%B5es..&type=phone_number&app_absent=0',
    },
    {
        name: 'Anual',
        installments: '12x de',
        price: 'R$ 9,07',
        detail: 'no cartão\nou R$ 95,52 no PIX',
        button: 'ASSINAR PLANO ANUAL',
        href: 'https://api.whatsapp.com/send/?phone=5511921335619&text=Ol%C3%A1%21+Tenho+interesse+no+Plano+Anual+do+Ranking+de+A%C3%A7%C3%B5es..&type=phone_number&app_absent=0',
        featured: true,
    },
];
export default function Pricing() {
    return (React.createElement("section", { id: "planos", className: "bg-white py-16 lg:py-20" },
        React.createElement("div", { className: "mx-auto max-w-[1700px] px-4 lg:px-8" },
            React.createElement("div", { className: "text-center" },
                React.createElement("h2", { className: "text-3xl font-bold text-[#27b8b6] sm:text-4xl" }, "Escolha seu Plano"),
                React.createElement("p", { className: "mt-5 text-lg text-[#49617f] sm:text-xl" }, "Entre na área exclusiva para assinantes"),
                React.createElement("p", { className: "mt-4 text-sm text-[#244f82] sm:text-base" }, "Lista atualizada semanalmente • Cotações atualizadas diariamente • Metodologia baseada em fundamentos + valuation."),
                React.createElement("p", { className: "mt-9 text-base font-bold text-black sm:text-lg" }, "Escolha agora seu plano e tenha acesso à nossa área exclusiva para assinantes")),
            React.createElement("div", { className: "mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4" }, plans.map((plan) => (React.createElement("article", { key: plan.name, className: "relative flex min-h-[390px] flex-col overflow-hidden rounded-[28px] border border-[#21b8b7] bg-[#08243f] p-8 text-white" },
                plan.featured && (React.createElement("span", { className: "absolute right-0 top-0 rounded-bl-[20px] bg-[#28b7b6] px-5 py-3 text-xs font-extrabold text-black" }, "MAIOR ECONOMIA")),
                React.createElement("h3", { className: "text-2xl font-bold sm:text-3xl" }, plan.name),
                plan.installments && React.createElement("p", { className: "mt-5 text-sm sm:text-base" }, plan.installments),
                React.createElement("div", { className: `${plan.installments ? 'mt-2' : 'mt-5'} text-4xl font-extrabold tracking-tight sm:text-5xl` }, plan.price),
                React.createElement("p", { className: "mt-4 whitespace-pre-line text-sm leading-8 sm:text-base" }, plan.detail),
                React.createElement("a", { href: plan.href, target: "_blank", rel: "noopener noreferrer", className: "mt-10 inline-flex min-h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#2cbab9] to-[#61d5d3] px-4 text-center text-sm font-extrabold text-black transition-opacity hover:opacity-90 sm:text-base" }, plan.button))))))));
}
