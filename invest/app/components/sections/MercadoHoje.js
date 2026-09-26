import React from 'react';
import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
const MACRO_API = 'https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-macro-market';
const order = ['BRL=X', 'EURBRL=X', '^BVSP', 'CDI'];
const labels = {
    'BRL=X': 'Dólar comercial',
    'EURBRL=X': 'Euro',
    '^BVSP': 'Ibovespa',
    CDI: 'CDI anualizado',
};
function formatValue(item) {
    const value = item.value == null ? null : Number(item.value);
    if (value == null || !Number.isFinite(value))
        return 'N/D';
    if (item.unit === 'BRL') {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
    if (item.unit === 'PTS')
        return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pts`;
    if (item.key === 'CDI' && item.unit === '% a.d.') {
        const annual = (Math.pow(1 + value / 100, 252) - 1) * 100;
        return `${annual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatChange(value) {
    if (value == null || !Number.isFinite(Number(value)))
        return 'N/D';
    return `${(Number(value) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
export default function MercadoHoje() {
    const [items, setItems] = useState(order.map((key) => ({ key, value: null, change_pct: null })));
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const response = await fetch(`${MACRO_API}?_=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                const json = await response.json();
                if (!active || !Array.isArray(json?.data))
                    return;
                const byKey = new Map(json.data.map((item) => [String(item.key), item]));
                setItems(order.map((key) => byKey.get(key) ?? { key, value: null, change_pct: null }));
            }
            catch (error) {
                console.error('AXIVA macro market error', error);
            }
        };
        load();
        const timer = window.setInterval(load, 120000);
        return () => {
            active = false;
            window.clearInterval(timer);
        };
    }, []);
    return (React.createElement("section", { id: "mercado", className: "bg-axiva-navy py-16 lg:py-20" },
        React.createElement("div", { className: "mx-auto max-w-container px-4 lg:px-8" },
            React.createElement("div", { className: "mb-8 flex items-center gap-2" },
                
                React.createElement("h2", { className: "text-xs font-medium uppercase tracking-wider text-axiva-green" }, "Mercado Hoje")),
            React.createElement("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4" }, items.map((item) => {
                const change = item.key === 'CDI' || item.change_pct == null ? null : Number(item.change_pct);
                const positive = change != null && change > 0;
                const negative = change != null && change < 0;
                return (React.createElement("div", { key: item.key, className: "rounded-xl border border-slate-700 bg-axiva-navy-light p-4 shadow-sm" },
                    React.createElement("span", { className: "block text-[11px] font-medium uppercase tracking-wide text-slate-300" }, labels[item.key] ?? item.label ?? item.key),
                    React.createElement("span", { className: "mt-2 block text-xl font-semibold text-white" }, formatValue(item)),
                    item.key !== 'CDI' && (React.createElement("div", { className: "mt-2 flex items-center gap-1.5" },
                        positive ? React.createElement(TrendingUp, { className: "h-3.5 w-3.5 text-axiva-green-light" }) : negative ? React.createElement(TrendingDown, { className: "h-3.5 w-3.5 text-red-400" }) : null,
                        React.createElement("span", { className: `text-sm font-medium ${positive ? 'text-axiva-green-light' : negative ? 'text-red-400' : 'text-slate-400'}` }, formatChange(change))))));
            })))));
}
