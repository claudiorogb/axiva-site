import React from 'react';
export function MockupBadge({ children, className = '' }) {
    return (React.createElement("span", { className: `inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400 ${className}` }, children));
}
export function MockupLabel({ children, className = '' }) {
    return (React.createElement("span", { className: `text-[11px] font-medium text-slate-400 ${className}` }, children));
}
export function MockupValue({ children, className = '' }) {
    return (React.createElement("span", { className: `text-sm font-semibold text-axiva-navy ${className}` }, children));
}
export function MockupStat({ label, value, hint, dark = false }) {
    return (React.createElement("div", { className: "flex flex-col gap-0.5" },
        React.createElement("span", { className: `text-[10px] font-medium uppercase tracking-wide ${dark ? 'text-slate-300' : 'text-slate-400'}` }, label),
        React.createElement("span", { className: `text-sm font-semibold ${dark ? 'text-white' : 'text-axiva-navy'}` }, value),
        hint && React.createElement("span", { className: `text-[10px] ${dark ? 'text-slate-300' : 'text-slate-400'}` }, hint)));
}
export function MiniLineChart({ positive = true, className = '' }) {
    const color = positive ? '#00A88F' : '#EF4444';
    const points = positive
        ? '0,35 15,30 30,32 45,22 60,25 75,15 90,18 105,8 120,12 135,5 150,3'
        : '0,8 15,12 30,10 45,18 60,15 75,22 90,20 105,28 120,25 135,32 150,35';
    return (React.createElement("svg", { viewBox: "0 0 150 40", className: className, preserveAspectRatio: "none" },
        React.createElement("polyline", { points: points, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        React.createElement("polygon", { points: `${points} 150,40 0,40`, fill: color, opacity: "0.07" })));
}
export function MiniBarChart({ values, className = '' }) {
    const max = Math.max(...values);
    return (React.createElement("div", { className: `flex items-end gap-1.5 ${className}` }, values.map((v, i) => (React.createElement("div", { key: i, className: "flex-1 rounded-t bg-axiva-green/20", style: { height: `${(v / max) * 100}%` } },
        React.createElement("div", { className: "h-full rounded-t bg-axiva-green", style: { opacity: 0.3 + (v / max) * 0.7 } }))))));
}
export function QualityIndicator({ score = 3, maxScore = 5 }) {
    return (React.createElement("div", { className: "flex items-center gap-1.5" },
        React.createElement("div", { className: "flex gap-1" }, Array.from({ length: maxScore }).map((_, i) => (React.createElement("span", { key: i, className: `h-2 w-2 rounded-full ${i < score ? 'bg-axiva-green' : 'bg-slate-200'}` })))),
        React.createElement("span", { className: "text-xs font-medium text-axiva-navy" },
            score,
            "/",
            maxScore)));
}
