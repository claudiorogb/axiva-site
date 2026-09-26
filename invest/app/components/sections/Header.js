import React from 'react';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../shared/Logo.js';
const MARKET_API = 'https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-market-strip';
const LOGIN_URL = 'https://axiva.com.br/invest/private';
const navLinks = [
    { label: 'Plataforma', href: '#plataforma' },
    { label: 'Análise', href: '#analise' },
    { label: 'Seleção AXIVA', href: '#selecao' },
    { label: 'Metodologia', href: '#metodologia' },
    { label: 'Planos', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
];
const fmtMoney = (value) => value == null
    ? 'N/D'
    : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtPct = (value) => value == null
    ? 'N/D'
    : `${(Number(value) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [market, setMarket] = useState([]);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const response = await fetch(`${MARKET_API}?_=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                const json = await response.json();
                if (active && Array.isArray(json?.data))
                    setMarket(json.data);
            }
            catch (error) {
                console.error('AXIVA market strip error', error);
            }
        };
        load();
        const timer = window.setInterval(load, 120000);
        return () => { active = false; window.clearInterval(timer); };
    }, []);
    const items = market.length ? market : [
        { label: 'Mercado', price: null, day_change_pct: null },
        { label: 'Cotações', price: null, day_change_pct: null },
    ];
    const doubled = [...items, ...items];
    return (React.createElement("header", { className: "sticky top-0 z-50" },
        React.createElement("div", { className: `border-b transition-colors duration-200 ${scrolled ? 'border-slate-200 bg-white/95 backdrop-blur-sm' : 'border-transparent bg-white'}` },
            React.createElement("div", { className: "mx-auto flex max-w-container items-center justify-between px-4 py-3 lg:px-8" },
                React.createElement("a", { href: "#top", "aria-label": "AXIVA Invest, página inicial" },
                    React.createElement(Logo, null)),
                React.createElement("nav", { className: "hidden items-center gap-6 lg:flex", "aria-label": "Navegação principal" }, navLinks.map((link) => (React.createElement("a", { key: link.href, href: link.href, className: "text-sm font-medium text-axiva-gray transition-colors hover:text-axiva-navy" }, link.label)))),
                React.createElement("div", { className: "hidden items-center gap-3 lg:flex" },
                    React.createElement("a", { href: LOGIN_URL, className: "inline-flex items-center gap-1.5 rounded-lg bg-axiva-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-axiva-navy-light" },
                        "Área exclusiva",
                        React.createElement(ArrowRight, { className: "h-3.5 w-3.5" }))),
                React.createElement("button", { className: "rounded-lg p-2 text-axiva-navy lg:hidden", onClick: () => setMenuOpen(!menuOpen), "aria-label": menuOpen ? 'Fechar menu' : 'Abrir menu', "aria-expanded": menuOpen }, menuOpen ? React.createElement(X, { className: "h-5 w-5" }) : React.createElement(Menu, { className: "h-5 w-5" }))),
            menuOpen && (React.createElement("div", { className: "border-t border-slate-200 lg:hidden" },
                React.createElement("nav", { className: "flex flex-col gap-1 px-4 py-3", "aria-label": "Navegação mobile" },
                    navLinks.map((link) => (React.createElement("a", { key: link.href, href: link.href, onClick: () => setMenuOpen(false), className: "rounded-lg px-3 py-2.5 text-sm font-medium text-axiva-gray transition-colors hover:bg-slate-50 hover:text-axiva-navy" }, link.label))),
                    React.createElement("a", { href: LOGIN_URL, onClick: () => setMenuOpen(false), className: "mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-axiva-navy px-4 py-2.5 text-sm font-medium text-white" },
                        "Área exclusiva",
                        React.createElement(ArrowRight, { className: "h-3.5 w-3.5" })))))),
        React.createElement("div", { className: "overflow-hidden border-b border-slate-200 bg-axiva-navy" },
            React.createElement("div", { className: "flex whitespace-nowrap animate-ticker py-2" }, doubled.map((item, i) => {
                const change = item.day_change_pct == null ? null : Number(item.day_change_pct);
                const positive = change != null && change > 0;
                const negative = change != null && change < 0;
                return (React.createElement("div", { key: `${item.ticker ?? item.label}-${i}`, className: "flex items-center gap-2 px-5 text-xs" },
                    React.createElement("span", { className: "font-semibold text-white" }, item.label ?? item.ticker ?? 'Mercado'),
                    React.createElement("span", { className: "text-slate-300" }, fmtMoney(item.price)),
                    React.createElement("span", { className: positive ? 'text-axiva-green-light' : negative ? 'text-red-400' : 'text-slate-400' },
                        positive ? '▲ ' : negative ? '▼ ' : '',
                        fmtPct(change)),
                    React.createElement("span", { className: "text-slate-600" }, "|")));
            })))));
}
