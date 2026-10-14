import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './ui/estilos.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { pedirAlmacenamientoPersistente } from './data/db';

void pedirAlmacenamientoPersistente();

// Safari en iPad: evitar zoom con dos dedos o doble toque dentro de la app.
document.addEventListener('gesturestart', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
