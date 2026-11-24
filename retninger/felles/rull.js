// Felles for de tre retningsskissene. Ingen avhengigheter.
// Hver [data-scene] får --p fra 0 til 1 etter hvor langt den er rullet gjennom.
// <html> får --side (0 til 1 for hele siden) og klassen .klar når siden er lastet.

(() => {
  const rot = document.documentElement;
  const scener = [...document.querySelectorAll("[data-scene]")];
  const rolig = matchMedia("(prefers-reduced-motion: reduce)");
  let venter = false;

  function oppdater() {
    venter = false;
    const vh = innerHeight;
    for (const el of scener) {
      const r = el.getBoundingClientRect();
      const lengde = r.height - vh;
      // data-scene="syn": hvor langt elementet er kommet gjennom vinduet (0 når det dukker opp nederst, 1 når det er ute øverst)
      let p = el.dataset.scene === "syn" ? (vh - r.top) / (vh + r.height) : lengde > 0 ? -r.top / lengde : 1;
      p = Math.min(1, Math.max(0, p));
      el.style.setProperty("--p", rolig.matches ? "1" : p.toFixed(4));
    }
    const hele = rot.scrollHeight - vh;
    rot.style.setProperty("--side", hele > 0 ? (scrollY / hele).toFixed(4) : "0");
    document.dispatchEvent(new CustomEvent("rull", { detail: { y: scrollY } }));
  }

  function be() {
    if (venter) return;
    venter = true;
    requestAnimationFrame(oppdater);
  }

  addEventListener("scroll", be, { passive: true });
  addEventListener("resize", be);
  rolig.addEventListener("change", be);
  oppdater();
  requestAnimationFrame(() => rot.classList.add("klar"));
})();
