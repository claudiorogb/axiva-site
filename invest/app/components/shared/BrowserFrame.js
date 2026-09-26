import React from 'react';
export default function BrowserFrame({ children, url = 'axivainvest.com.br', className = '' }) {
    return (React.createElement("div", { className: `overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}` },
        React.createElement("div", { className: "flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3" },
            React.createElement("div", { className: "flex gap-1.5" },
                React.createElement("span", { className: "h-3 w-3 rounded-full bg-slate-300" }),
                React.createElement("span", { className: "h-3 w-3 rounded-full bg-slate-300" }),
                React.createElement("span", { className: "h-3 w-3 rounded-full bg-slate-300" })),
            React.createElement("div", { className: "ml-3 flex-1 truncate rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400" }, url)),
        React.createElement("div", { className: "bg-white" }, children)));
}
