// Mantener la app al día. Como es una PWA que funciona sin internet, el iPad guarda
// una copia; esto busca versiones nuevas y recarga sola cuando hay una:
// al abrir, al volver a la app y cada hora.

import { registerSW } from 'virtual:pwa-register';

/** Fecha de la versión (se fija al publicar). */
export const VERSION = __VERSION__;

let registro: ServiceWorkerRegistration | undefined;

export function iniciarActualizaciones(): void {
  registerSW({
    immediate: true, // con registerType 'autoUpdate', recarga sola al activarse la versión nueva
    onRegisteredSW(_url, reg) {
      registro = reg;
      if (!reg) return;
      setInterval(() => void reg.update(), 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) void reg.update();
      });
    },
  });
}

/** Botón "Actualizar la app": borra la copia guardada y recarga desde internet. */
export async function forzarActualizacion(): Promise<void> {
  try {
    await registro?.update();
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    const claves = (await caches?.keys()) ?? [];
    await Promise.all(claves.map((c) => caches.delete(c)));
  } finally {
    location.reload();
  }
}
