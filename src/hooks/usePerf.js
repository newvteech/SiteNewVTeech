import { useSyncExternalStore } from 'react';

/* ------------------------------------------------------------------
   Modo leve: desliga as nuvens pequenas e reduz partículas para
   celulares mais simples.

   Liga sozinho quando:
   - o aparelho tem pouca memória ou poucos núcleos,
   - o usuário ativou "economia de dados" ou "reduzir movimento",
   - ou a animação roda abaixo de ~30 quadros por segundo no começo.
   O visitante também pode ligar/desligar no rodapé (fica salvo no navegador).
------------------------------------------------------------------- */

const KEY = 'newv-modo-leve';
const listeners = new Set();

function readSaved() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function save(v) {
  try { v === null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v); } catch { /* sem armazenamento */ }
}

function detectWeakDevice() {
  if (typeof navigator === 'undefined') return false;
  const mem = navigator.deviceMemory;          // só alguns navegadores informam
  const cores = navigator.hardwareConcurrency;
  const saveData = navigator.connection && navigator.connection.saveData;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return Boolean(saveData || reduce || (mem && mem <= 3) || (cores && cores <= 3));
}

const saved = typeof window !== 'undefined' ? readSaved() : null;
let state = {
  lite: saved === 'on' ? true : saved === 'off' ? false : (typeof window !== 'undefined' && detectWeakDevice()),
  manual: saved === 'on' || saved === 'off',
  auto: false, // ligado automaticamente por estar lento
};

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const perf = {
  get lite() { return state.lite; },
  toggle() {
    const lite = !state.lite;
    save(lite ? 'on' : 'off');
    set({ lite, manual: true, auto: false });
  },
  // chamado pela nuvem principal com os quadros por segundo medidos no início
  reportFps(fps) {
    if (state.manual || state.lite) return;
    if (fps < 30) set({ lite: true, auto: true });
  },
};

export function usePerf() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => state
  );
}
