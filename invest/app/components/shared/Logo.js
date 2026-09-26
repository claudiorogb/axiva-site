import React from 'react';
const AXIVA_LOGO='https://drive.google.com/uc?export=view&id=1Oh-uMvTQW7XjjzTfHQQVKbcgkW8d23lv';
export default function Logo({className=''}){
  return React.createElement('img',{src:AXIVA_LOGO,alt:'AXIVA',className:`h-9 w-auto object-contain ${className}`});
}
