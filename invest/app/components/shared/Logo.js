import React from 'react';
export default function Logo({className=''}) {
  return React.createElement('img',{src:'/invest/axiva-logo.webp',alt:'AXIVA',className:`h-10 w-auto object-contain ${className}`});
}
