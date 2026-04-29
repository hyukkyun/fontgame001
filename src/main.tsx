import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import './index.css';
import { NOONNU_FONTS } from './constants/fonts';

// Pre-inject all font CSS definitions into the document head before React mounts
// This avoids a massive React layout thrashing on the first render frame on mobile.
const styleElement = document.createElement('style');
styleElement.id = 'noonnu-fonts-style';
styleElement.textContent = NOONNU_FONTS.map(f => f.css).join('\n');
document.head.appendChild(styleElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
);
