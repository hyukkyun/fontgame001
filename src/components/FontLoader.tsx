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

    // Use FontFace API to register and trigger loading
    requestAnimationFrame(() => {
      NOONNU_FONTS.forEach(async (font) => {
        if (font.css.includes('@font-face')) {
          const urlMatch = font.css.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            try {
              const weightMatch = font.css.match(/font-weight:\s*([^;]+)/);
              const weight = weightMatch ? weightMatch[1].trim() : '400';
              
              const familyName = font.family;
              // Check if already added
              const existingFonts = Array.from(document.fonts);
              if (!existingFonts.find(f => f.family === familyName)) {
                const fontFace = new FontFace(familyName, `url(${urlMatch[1]})`, {
                  display: 'swap',
                  weight: weight
                });
                
                document.fonts.add(fontFace);
                // Trigger load immediately
                fontFace.load().catch(err => {
                  console.warn(`Failed to load font: ${familyName}`, err);
                });
              }
            } catch (e) {
              console.error(`Error processing font ${font.name}:`, e);
            }
          }
        }
      });
    });
  }, []);

  return null;
};

export default FontLoader;
