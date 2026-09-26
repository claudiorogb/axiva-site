import React from 'react';
export function InfoBadge({ children, className = '' }) {
    return (React.createElement("span", { className: `inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 ${className}` }, children));
}
export function MockupLabel({ children, className = '' }) {
    return React.createElement("span", { className: `text-[11px] font-medium text-slate-400 ${className}` }, children);
}
export function MockupValue({ children, className = '' }) {
    return React.createElement("span", { className: `text-sm font-semibold text-axiva-navy ${className}` }, children);
}
export function MockupStat({ label, value, hint, dark = false }) {
    return (React.createElement("div", { className: "flex flex-col gap-0.5" },
        React.createElement("span", { className: `text-[10px] font-medium uppercase tracking-wide ${dark ? 'text-slate-300' : 'text-slate-400'}` }, label),
        React.createElement("span", { className: `text-sm font-semibold ${dark ? 'text-white' : 'text-axiva-navy'}` }, value),
        hint && React.createElement("span", { className: `text-[10px] ${dark ? 'text-slate-300' : 'text-slate-400'}` }, hint)));
}
export function MiniLineChart({ values, positive, className = '' }) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const stepX = values.length > 1 ? 150 / (values.length - 1) : 150;
    const points = values
        .map((value, index) => {
        const x = index * stepX;
        const y = 35 - ((value - min) / spread) * 28;
        return `${x},${y.toFixed(2)}`;
    })
        .join(' ');
    const first = values[0];
    const last = values[values.length - 1];
    const tone = positive ?? last >= first;
    const color = tone ? '#00A88F' : '#EF4444';
    return (React.createElement("svg", { viewBox: "0 0 150 40", className: className, preserveAspectRatio: "none" },
        React.createElement("polyline", { points: points, fill: "none", stroke: color, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }),
        React.createElement("polygon", { points: `${points} 150,40 0,40`, fill: color, opacity: "0.1" })));
}
export function MiniBarChart({ values, className = '' }) {
    const max = Math.max(...values);
    return (React.createElement("div", { className: `flex items-end gap-1.5 ${className}` }, values.map((v, i) => (React.createElement("div", { key: i, className: "flex-1 rounded-t bg-axiva-green/20", style: { height: `${(v / max) * 100}%` } },
        React.createElement("div", { className: "h-full rounded-t bg-axiva-green", style: { opacity: 0.3 + (v / max) * 0.7 } }))))));
}
export function QualityIndicator({ score = 3, maxScore = 5, dark = false }) {
    return (React.createElement("div", { className: "flex items-center gap-1.5" },
        React.createElement("div", { className: "flex gap-1" }, Array.from({ length: maxScore }).map((_, i) => (React.createElement("span", { key: i, className: `h-2 w-2 rounded-full ${i < score ? 'bg-axiva-green' : dark ? 'bg-slate-600' : 'bg-slate-200'}` })))),
        React.createElement("span", { className: `text-xs font-medium ${dark ? 'text-white' : 'text-axiva-navy'}` },
            score,
            "/",
            maxScore)));
}
