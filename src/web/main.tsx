import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './figtree.css';
import './tema.css';
import './temel.css';

import { App } from './App';

const kok = document.getElementById('kok');
if (!kok) throw new Error('#kok bulunamadı');

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
