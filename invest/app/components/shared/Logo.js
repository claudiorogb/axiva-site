import React from 'react';
export default function Logo({className='', variant='header'}) {
  const width = variant === 'footer' ? '180px' : '155px';
  return React.createElement('img',{
    src:'/invest/axiva-logo.webp',
    alt:'AXIVA',
    className:`object-contain ${className}`,
    style:{width,height:'auto',maxWidth:'100%',display:'block'}
  });
}
