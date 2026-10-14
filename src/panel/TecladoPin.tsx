import { useState } from 'react';

const LARGO = 4;

interface Props {
  titulo: string;
  error?: string;
  alCompletar: (pin: string) => void;
}

export function TecladoPin({ titulo, error, alCompletar }: Props) {
  const [pin, setPin] = useState('');

  const tocar = (d: string) => {
    const nuevo = (pin + d).slice(0, LARGO);
    setPin(nuevo);
    if (nuevo.length === LARGO) {
      setTimeout(() => {
        setPin('');
        alCompletar(nuevo);
      }, 120);
    }
  };

  return (
    <div className="tarjeta teclado-pin">
      <h2>{titulo}</h2>
      <div className="puntos-pin" aria-label={`${pin.length} de ${LARGO} dígitos`}>
        {Array.from({ length: LARGO }, (_, i) => (
          <span key={i} className={i < pin.length ? 'punto lleno' : 'punto'} />
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="teclas">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="tecla" onClick={() => tocar(d)}>{d}</button>
        ))}
        <span />
        <button className="tecla" onClick={() => tocar('0')}>0</button>
        <button className="tecla" onClick={() => setPin(pin.slice(0, -1))} aria-label="Borrar">⌫</button>
      </div>
    </div>
  );
}
