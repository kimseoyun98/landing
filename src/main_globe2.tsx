import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import App from './App_globe2';
import './style.css';

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
