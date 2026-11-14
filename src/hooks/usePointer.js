// Posição do ponteiro compartilhada entre os componentes animados
// (sem re-render do React: é lida a cada frame).
export const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };

if (typeof window !== 'undefined') {
  const set = (x, y) => {
    pointer.x = x;
    pointer.y = y;
    pointer.nx = x / window.innerWidth - 0.5;
    pointer.ny = y / window.innerHeight - 0.5;
    pointer.active = true;
  };
  window.addEventListener('pointermove', (e) => set(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => e.touches[0] && set(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -9999;
    pointer.nx = pointer.ny = 0;
    pointer.active = false;
  });
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
