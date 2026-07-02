import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './p2/App';
import './p2/style.css';

// 새로고침 시 항상 최상단으로
if (typeof history !== 'undefined') history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
