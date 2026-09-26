import React from 'react';
export default function Logo({className='', variant='header'}) {
  const width = variant === 'footer' ? '170px' : '150px';
  return React.createElement('img',{
    src:'/invest/axiva-wordmark.svg',
    alt:'AXIVA',
    className:`object-contain ${className}`,
    style:{width,height:'auto',maxWidth:'100%',display:'block'}
  });
}
