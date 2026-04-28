import React, { useEffect } from 'react';
import { NOONNU_FONTS } from '../constants/fonts';

const FontLoader: React.FC = () => {
  useEffect(() => {
    const styleId = 'noonnu-fonts-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    const allCss = NOONNU_FONTS.map(f => f.css).join('\n');
    styleElement.textContent = allCss;
  }, []);

  return null;
};

export default FontLoader;
