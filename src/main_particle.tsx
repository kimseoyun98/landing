import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppParticle from './App_particle';
import './style.css';

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <AppParticle />
  </StrictMode>,
);
