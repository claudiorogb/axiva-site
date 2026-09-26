import React from 'react';
function icon(paths){return function Icon({className='',strokeWidth=2,...props}){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth,strokeLinecap:'round',strokeLinejoin:'round',className,'aria-hidden':'true',...props},...paths.map((d,i)=>React.createElement('path',{d,key:i})));}}
export const ArrowRight=icon(['M5 12h14','m13 6 6 6-6 6']);
export const Menu=icon(['M4 6h16','M4 12h16','M4 18h16']);
export const X=icon(['M18 6 6 18','M6 6l12 12']);
export const Search=icon(['M21 21l-4.35-4.35','M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16']);
export const BarChart3=icon(['M3 3v18h18','M18 17V9','M13 17V5','M8 17v-3']);
export const Bell=icon(['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9','M10 21h4']);
export const ChevronDown=icon(['m6 9 6 6 6-6']);
export const List=icon(['M8 6h13','M8 12h13','M8 18h13','M3 6h.01','M3 12h.01','M3 18h.01']);
export const SlidersHorizontal=icon(['M21 4h-7','M10 4H3','M21 12h-9','M8 12H3','M21 20h-5','M12 20H3','M14 2v4','M8 10v4','M16 18v4']);
export const TrendingUp=icon(['m3 17 6-6 4 4 8-8','M14 7h7v7']);
export const TrendingDown=icon(['m3 7 6 6 4-4 8 8','M14 17h7v-7']);
export const RefreshCw=icon(['M21 12a9 9 0 0 1-15.3 6.4L3 16','M3 21v-5h5','M3 12A9 9 0 0 1 18.3 5.6L21 8','M21 3v5h-5']);
export const Filter=icon(['M4 5h16','M7 12h10','M10 19h4']);
