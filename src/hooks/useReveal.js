import { useEffect } from 'react';

// Anima os elementos .reveal sempre que entram na tela (descendo ou subindo)
// e os esconde de novo quando saem, para a animação se repetir.
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          e.target.classList.toggle('in', e.isIntersecting);
        }),
      { threshold: 0.12, rootMargin: '-4% 0px -6% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
