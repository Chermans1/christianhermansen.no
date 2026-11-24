// Havet i den valgte retningen (M): vannflaten, plaskene og morilden.
//
// Én historie i bakgrunnen, styrt av rullingen:
//   1. Dykket. Mot slutten av åpningen stiger vannflaten opp gjennom bildet. Over den ser du naustet,
//      under den havet. Flaten er ekte vann i liten målestokk: en rekke søyler som fjærer og drar i
//      naboene sine. Den skvulper når du ruller fort, og plasker når pekeren går gjennom den.
//   2. Nedstigningen. Det faste havlaget skyves sakte oppover resten av siden (--ned går fra 0 til 1).
//   3. Morilden. Lyspunkter som står nesten mørke når vannet er stille, og lyser opp når du ruller, klikker
//      eller fører pekeren gjennom dem. Slik er det i sjøen også: den lyser når vannet blir forstyrret.
//      Derfor lyser også vannkanten og dråpene i et plask.
//
// Den som har bedt om mindre bevegelse får bare det faste havlaget. Ingen bølger, ingen plask, ingen morild.
import { rolig } from "./felles.js";

const TAU = Math.PI * 2;
const klem = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tilf = (a, b) => a + Math.random() * (b - a);

// sted: seksjonen med åpningen. lag: alt som er over vann (klippes av vannflaten).
// lerret: canvas over åpningen der vannflaten tegnes. bak: det faste havlaget.
// fra: hvor langt ut i åpningen dykket starter (0 til 1).
// skum: vannflaten skummer. Lite skum når sjøen ligger stille, mye når du ruller fort eller plasker. Valgt 17.11.
export function hav({ sted, lag, lerret, bak, fra = 0.72, skum = true }) {
  let B = innerWidth, H = innerHeight, stedTopp = 0, stedLengde = 1, nedFra = 0, nedTil = 1;

  function maalSiden() {
    B = innerWidth; H = innerHeight;
    const r = sted.getBoundingClientRect();
    stedTopp = r.top + scrollY;
    stedLengde = Math.max(1, r.height - H);
    nedFra = stedTopp + stedLengde;
    nedTil = Math.max(nedFra + 1, document.documentElement.scrollHeight - H);
  }
  const settNed = () => bak.style.setProperty("--ned", klem((scrollY - nedFra) / (nedTil - nedFra)).toFixed(4));

  if (rolig.matches) {
    maalSiden(); settNed();
    addEventListener("scroll", settNed, { passive: true });
    addEventListener("resize", () => { maalSiden(); settNed(); });
    addEventListener("load", () => { maalSiden(); settNed(); });
    return;
  }

  // Laget med morild ligger rett over havbildene og bak alt innhold, så tekst og bilder står foran.
  const vann = document.createElement("canvas");
  vann.className = "m-vann";
  vann.setAttribute("aria-hidden", "true");
  bak.after(vann);
  const g = vann.getContext("2d"), gl = lerret.getContext("2d");
  const liten = B < 700;
  let dpr = 1;

  // ---- Vannflaten: søyler som fjærer mot hvile og drar i naboene (bølgene brer seg utover) ----
  const DX = 8, STRAM = 0.02, DEMP = 0.03, SPRE = 0.22;
  let n = 0, hoyde, fartS, vl, vr;
  let skumLokal = null;                  // ekstra skum der det nettopp har plasket
  function lagSoyler() {
    n = Math.ceil(B / DX) + 2;
    hoyde = new Float32Array(n); fartS = new Float32Array(n); vl = new Float32Array(n); vr = new Float32Array(n); skumLokal = new Float32Array(n);
  }
  function stegVann() {
    for (let i = 0; i < n; i++) { fartS[i] += -STRAM * hoyde[i] - DEMP * fartS[i]; hoyde[i] = klem(hoyde[i] + fartS[i], -150, 150); }
    for (let runde = 0; runde < 4; runde++) {
      for (let i = 0; i < n; i++) {
        if (i > 0) { vl[i] = SPRE * (hoyde[i] - hoyde[i - 1]); fartS[i - 1] += vl[i]; }
        if (i < n - 1) { vr[i] = SPRE * (hoyde[i] - hoyde[i + 1]); fartS[i + 1] += vr[i]; }
      }
      for (let i = 0; i < n; i++) { if (i > 0) hoyde[i - 1] += vl[i]; if (i < n - 1) hoyde[i + 1] += vr[i]; }
    }
  }
  // et støt i flaten ved x. kraft > 0 trykker flaten ned, kraft < 0 løfter den
  function stot(x, kraft, bredde = 2.6) {
    const midt = x / DX;
    for (let i = Math.max(0, Math.floor(midt - bredde * 3)); i <= Math.min(n - 1, Math.ceil(midt + bredde * 3)); i++) {
      const a = (i - midt) / bredde;
      fartS[i] += kraft * Math.exp(-a * a);
    }
  }

  function maal() {
    maalSiden();
    dpr = Math.min(devicePixelRatio || 1, 2);
    for (const c of [vann, lerret]) { c.width = Math.round(B * dpr); c.height = Math.round(H * dpr); }
    lagSoyler();
  }
  maal();
  addEventListener("resize", maal);
  addEventListener("load", maalSiden);

  const MARG = 90;                       // hvor langt utenfor bildet flaten står før og etter dykket
  const LEPPE = 70;                      // så langt over bildets nedre kant ligger vannflaten når bildet følger den opp
  let loft = 0;                          // hvor mye bildet over vann er skjøvet opp (px, negativt)
  let d = 0, y0 = H + MARG, fart = 0, t = 0, utslag = 12, akk = 0;
  const donning = (x, forskyv = 0) => {
    const l1 = Math.max(520, B * 0.62), l2 = l1 * 0.43;
    return utslag * (0.62 * Math.sin((x / l1) * TAU + (t + forskyv) * 1.05) + 0.38 * Math.sin((x / l2) * TAU - (t + forskyv) * 1.6 + 1.3));
  };
  const soyle = (x) => { const f = klem(x / DX, 0, n - 1.001), i = Math.floor(f), k = f - i; return hoyde[i] * (1 - k) + hoyde[i + 1] * k; };
  const soyleFart = (x) => fartS[Math.round(klem(x / DX, 0, n - 1))];
  const linje = (x) => y0 + donning(x) + soyle(x);
  const iDykket = () => d > 0 && d < 1;

  // ---- Dråper ----
  const draaper = [];

  // ---- Morild ----
  const N = liten ? 54 : 110, morild = [], kjol = [];
  const nyMorild = () => ({ x: tilf(0, B), y: tilf(0, H), z: tilf(0.35, 1), f: tilf(0, TAU), hvile: tilf(0.05, 0.16), e: 0 });
  // ett lyspunkt: svak glød rundt en lys kjerne
  const lyspunkt = (x, y, r, a, glod, kjerne) => {
    g.beginPath(); g.arc(x, y, r * glod, 0, TAU);
    g.fillStyle = "rgba(53, 200, 240, " + (a * 0.17).toFixed(3) + ")"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, TAU);
    g.fillStyle = "rgba(190, 246, 255, " + (a * kjerne).toFixed(3) + ")"; g.fill();
  };
  for (let i = 0; i < N; i++) morild.push(nyMorild());
  // vannet ble rørt her: morilden rundt lyser opp, og noen korte glimt blir igjen der det skjedde
  function ror(x, y, radius, styrke, glimt) {
    for (const m of morild) {
      const a = Math.hypot(m.x - x, m.y - y);
      if (a < radius) m.e = Math.min(1, m.e + (1 - a / radius) * styrke);
    }
    for (let i = 0; i < glimt && kjol.length < 150; i++) {
      const v = tilf(0, TAU), s = tilf(20, 150);
      kjol.push({ x: x + tilf(-12, 12), y: y + tilf(-12, 12), vx: Math.cos(v) * s, vy: Math.sin(v) * s, liv: 1, lengde: tilf(0.7, 1.5), r: tilf(0.6, 1.7) });
    }
  }

  // Plask: pekeren (eller en finger) går gjennom vannflaten ved x. retning 1 = ned i vannet, -1 = opp av det.
  let sistPlask = 0;
  function plask(x, retning, styrke) {
    const naa = performance.now();
    if (naa - sistPlask < 110) return;                                       // ikke ti plask av én rask bevegelse
    sistPlask = naa;
    stot(x, retning * (5 + 11 * styrke), 4.5 + styrke * 2.5);                 // bred og rund grop, ikke en spiss
    stot(x - 60, -retning * (2 + 4 * styrke), 3.4); stot(x + 60, -retning * (2 + 4 * styrke), 3.4);   // kragen som reiser seg rundt
    const yl = linje(x);
    const antall = Math.round((liten ? 4 : 6) + (liten ? 7 : 12) * styrke);
    for (let i = 0; i < antall && draaper.length < 120; i++) {
      draaper.push({ x: x + tilf(-18, 18), y: yl - 2, vx: tilf(-1, 1) * (50 + 150 * styrke), vy: -tilf(150, 300 + 300 * styrke), r: tilf(0.8, 2.6) });
    }
    ror(x, yl + 30, 260, 0.6 + 0.4 * styrke, Math.round(8 + 14 * styrke));
    if (skum) { const midt = x / DX; for (let i = Math.max(0, Math.floor(midt - 24)); i <= Math.min(n - 1, Math.ceil(midt + 24)); i++) { const a = (i - midt) / 9; skumLokal[i] = Math.min(1, skumLokal[i] + (0.5 + 0.5 * styrke) * Math.exp(-a * a)); } }
  }

  const peker = { x: -999, y: -999, uro: 0, tid: 0 };
  addEventListener("pointermove", (ev) => {
    const x = ev.clientX, y = ev.clientY, naa = performance.now();
    const dx = x - peker.x, dy = y - peker.y, lengde = Math.hypot(dx, dy), dtp = Math.max(4, naa - peker.tid);
    if (peker.x > -900 && lengde < 500) {
      peker.uro = Math.min(1, peker.uro + lengde / 90);
      let under = d >= 1;
      if (iDykket() && y0 < H + 20) {
        const var_ = peker.y > linje(peker.x), er = y > linje(x);
        under = er;
        if (var_ !== er) plask(x, er ? 1 : -1, klem(0.2 + (Math.abs(dy) / dtp) * 0.4, 0.2, 1));
        else if (er && y - linje(x) < 90) stot(x, -Math.min(2.4, lengde * 0.05), 3);   // drar du fingeren like under flaten, løfter vannet seg etter
        else if (!er && linje(x) - y < 26) stot(x, Math.min(1.6, lengde * 0.04), 3);  // og stryker du over den, trykkes den litt ned
      }
      if (under) {
        // kjølvannet etter pekeren: korte lysglimt der vannet ble rørt
        const antall = Math.min(5, Math.floor(lengde / 16));
        for (let i = 0; i < antall && kjol.length < 150; i++) {
          const k = Math.random();
          kjol.push({ x: peker.x + dx * k + tilf(-9, 9), y: peker.y + dy * k + tilf(-9, 9), vx: dx * 0.6 + tilf(-14, 14), vy: dy * 0.6 + tilf(-14, 14), liv: 1, lengde: tilf(0.7, 1.5), r: tilf(0.6, 1.7) });
        }
      }
    }
    peker.x = x; peker.y = y; peker.tid = naa;
  }, { passive: true });
  addEventListener("pointerdown", (ev) => {
    const x = ev.clientX, y = ev.clientY;
    peker.x = x; peker.y = y; peker.tid = performance.now();
    if (iDykket() && y0 < H + 20) {
      const yl = linje(x);
      if (Math.abs(y - yl) < 70) plask(x, 1, 0.75);
      else if (y > yl) ror(x, y, 240, 0.9, 14);
    } else if (d >= 1) ror(x, y, 240, 0.9, 14);
  }, { passive: true });

  // ---- Skum ----
  // Tre lag som alle følger bølgen: en melkehvit sky av små luftbobler under flaten, tydelige bobler som stiger
  // i den, og en frynset skumkant oppå. Hvert korn har sin faste plass og størrelse (regnet ut fra hvor det
  // står), så skummet flimrer ikke, det driver. Mengden styres av farten, og av plask der de treffer.
  let skumNivaa = 0, hastNaa = 0;
  const hash2 = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const stoy = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), e = hash2(i + 1, j + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + e) * sx * sy;
  };
  const dott = document.createElement("canvas");
  dott.width = dott.height = 48;
  {
    const c = dott.getContext("2d"), rg = c.createRadialGradient(24, 24, 0, 24, 24, 24);
    rg.addColorStop(0, "rgba(190, 220, 222, 1)");                        // #bedcde, blek som skummet ved naustet i bildet
    rg.addColorStop(0.55, "rgba(190, 220, 222, 0.5)");
    rg.addColorStop(1, "rgba(190, 220, 222, 0)");
    c.fillStyle = rg; c.fillRect(0, 0, 48, 48);
  }
  // skyen tegnes smått og blåses opp, så de enkelte flekkene flyter sammen til én sky
  const SKS = 4, sky = document.createElement("canvas"), gk = sky.getContext("2d");
  const SKUMLAG = [
    { c: liten ? 13 : 15, r0: 18, r1: 54, stig: 14, a: 0.13, myk: true, fro: 11 },                          // melkehvit sky
    { c: liten ? 8 : 9, r0: 0.8, r1: 3.3, stig: 40, a: 0.75, farge: "206, 228, 228", fro: 29, lav: 0.12, trinn: 0.13 },   // bobler som stiger
    { c: 5, r0: 1.2, r1: 4.2, stig: 0, a: 1, farge: "228, 240, 238", fro: 53, kant: true, lav: 0.22, trinn: 0.17 },   // skumkanten
  ];
  function tegnSkum(dt) {
    const maal = klem(0.16 + hastNaa * 1.7);
    skumNivaa += (maal - skumNivaa) * (1 - Math.exp(-dt * (maal > skumNivaa ? 9 : 0.9)));   // kommer fort, legger seg sakte
    const svinn = Math.exp(-dt * 1.1);
    for (let i = 0; i < n; i++) skumLokal[i] *= svinn;
    if (sky.width !== Math.ceil(B / SKS) || sky.height !== Math.ceil(H / SKS)) { sky.width = Math.ceil(B / SKS); sky.height = Math.ceil(H / SKS); }
    gk.setTransform(1 / SKS, 0, 0, 1 / SKS, 0, 0);
    gk.clearRect(0, 0, B + SKS, H + SKS);
    for (const L of SKUMLAG) {
      const kol = Math.ceil(B / L.c) + 1, skift = t * L.stig, botter = [[], [], [], []];
      for (let i = 0; i < kol; i++) {
        const x0 = i * L.c, xk = klem(x0, 0, B);
        const lokal = Math.min(1.4, skumNivaa + skumLokal[Math.round(klem(xk / DX, 0, n - 1))]);
        if (lokal < 0.04) continue;
        const yl = linje(xk);
        const under = L.kant ? 8 + 14 * lokal : 26 + H * 0.3 * lokal, over = L.kant ? 7 + 18 * lokal : 5 + 40 * lokal;
        // skumkanten ligger i flak langs flaten. Skyen og boblene står i lange strimer nedover, som driver oppover.
        const flak = L.kant ? stoy(x0 * 0.022 + L.fro, t * 0.22) : 0;
        const j0 = Math.floor((skift - over) / L.c), j1 = Math.ceil((skift + under) / L.c);
        for (let jj = j0; jj <= j1; jj++) {
          const h1 = hash2(i + L.fro, jj), h2 = hash2(i + L.fro * 3, jj + 101), h3 = hash2(i + 7, jj * 3 + L.fro);
          const avst = jj * L.c - skift + (h2 - 0.5) * L.c;                 // under flaten når den er positiv
          const forhold = avst >= 0 ? avst / under : avst / over;
          // to lag støy: brede dotter og smale strimer. Skyen er sammenhengende med ujevn tykkelse, boblene og kanten står i klaser.
          const st = L.kant ? flak : 0.62 * stoy(x0 * 0.012 + L.fro, avst * 0.005 - t * 0.3) + 0.38 * stoy(x0 * 0.045 + L.fro + 7, avst * 0.012 - t * 0.5);
          const tett = Math.exp(-3 * forhold * forhold) * (L.myk ? 0.34 + 0.95 * st : 0.14 + 1.3 * st * st) * Math.min(1, lokal * 1.6);
          if (tett < (L.myk ? 0.02 + h3 * 0.3 : L.kant ? 0.06 + h3 * 0.7 : 0.1 + h3 * 0.85)) continue;
          const x = x0 + (h1 - 0.5) * L.c * 1.5 + Math.sin(t * 1.8 + h3 * TAU) * L.c * 0.16, y = yl + avst;
          const r = (L.r0 + (L.r1 - L.r0) * h2 * h2) * (0.65 + 0.5 * tett);
          if (L.myk) { gk.globalAlpha = Math.min(1, tett * L.a * 1.6); gk.drawImage(dott, x - r, y - r, r * 2, r * 2); }
          else botter[Math.min(3, Math.floor(tett * L.a * 4))].push(x, y, r);
        }
      }
      if (L.myk) { gl.imageSmoothingEnabled = true; gl.imageSmoothingQuality = "high"; gl.drawImage(sky, 0, 0, sky.width * SKS, sky.height * SKS); }
      else botter.forEach((b, k) => {
        if (!b.length) return;
        gl.beginPath();
        for (let q = 0; q < b.length; q += 3) { gl.moveTo(b[q] + b[q + 2], b[q + 1]); gl.arc(b[q], b[q + 1], b[q + 2], 0, TAU); }
        gl.fillStyle = "rgba(" + L.farge + ", " + (L.lav + k * L.trinn).toFixed(2) + ")"; gl.fill();
      });
    }
  }

  let sist = performance.now(), sistSy = scrollY, gaar = true;

  // Overgangen skal ikke se påklistret ut. Derfor har den ingen egne farger: bildet over mørkner inn mot
  // vannkanten, havet under gjør det samme, og de to møtes i den samme mørke tonen. Kanten selv er en mørk
  // rand med et svakt gjenskinn av himmelen der bølgen heller mot lyset.
  const MORK = "7, 24, 29";              // den mørkeste tonen i sjøen på bildet, #07181d
  function tegnFlate() {
    const steg = liten ? 8 : 12;
    const xs = [], yf = [];
    for (let x = 0; x <= B + steg; x += steg) { const xx = Math.min(x, B); xs.push(xx); yf.push(linje(xx)); }
    const m = xs.length;
    // det som er over vann klippes langs flaten. Laget er skjøvet opp, så punktene regnes om til lagets egne mål
    let poly = "0px " + (-loft).toFixed(1) + "px, " + B + "px " + (-loft).toFixed(1) + "px";
    for (let i = m - 1; i >= 0; i--) poly += ", " + xs[i].toFixed(1) + "px " + (yf[i] - loft).toFixed(1) + "px";
    lag.style.clipPath = "polygon(" + poly + ")";

    const sti = (dy = 0) => { gl.beginPath(); gl.moveTo(xs[0], yf[0] + dy); for (let i = 1; i < m; i++) gl.lineTo(xs[i], yf[i] + dy); };
    gl.lineJoin = "round"; gl.lineCap = "round";

    // 1. Over flaten: sjøen nærmest kameraet mørkner inn mot kanten
    // tegnes i smale søyler (3 px) som hver følger bølgen, så tonen ligger jevnt langs kanten uten striper
    const OVER = klem(H * 0.17, 100, 200), UNDER = klem(H * 0.15, 90, 170), SMAL = 3;
    const fin = [];
    for (let x = 0; x < B; x += SMAL) fin.push(linje(x + SMAL / 2));
    const over = gl.createLinearGradient(0, 0, 0, OVER);
    over.addColorStop(0, "rgba(" + MORK + ", 0)");
    over.addColorStop(0.55, "rgba(" + MORK + ", 0.24)");
    over.addColorStop(1, "rgba(" + MORK + ", 0.8)");
    const under = gl.createLinearGradient(0, 0, 0, UNDER);
    under.addColorStop(0, "rgba(" + MORK + ", 0.8)");
    under.addColorStop(0.4, "rgba(" + MORK + ", 0.3)");
    under.addColorStop(1, "rgba(" + MORK + ", 0)");
    gl.save();
    sti(); gl.lineTo(B, -10); gl.lineTo(0, -10); gl.closePath(); gl.clip();
    gl.fillStyle = over;
    for (let i = 0; i < fin.length; i++) {
      gl.setTransform(dpr, 0, 0, dpr, i * SMAL * dpr, (fin[i] + 3 - OVER) * dpr);
      gl.fillRect(0, 0, SMAL, OVER);
    }
    gl.restore();
    // 2. Under flaten: havet er like mørkt helt oppe ved kanten, og åpner seg nedover
    gl.save();
    gl.setTransform(dpr, 0, 0, dpr, 0, 0);
    sti(); gl.lineTo(B, H + 10); gl.lineTo(0, H + 10); gl.closePath(); gl.clip();
    gl.fillStyle = under;
    for (let i = 0; i < fin.length; i++) {
      gl.setTransform(dpr, 0, 0, dpr, i * SMAL * dpr, (fin[i] - 3) * dpr);
      gl.fillRect(0, 0, SMAL, UNDER);
    }
    gl.restore();
    gl.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 3. Kanten: en myk mørk rand, og gjenskinn av himmelen der bølgen heller mot lyset
    sti(1); gl.lineWidth = 9; gl.strokeStyle = "rgba(3, 12, 16, 0.3)"; gl.stroke();
    sti(1); gl.lineWidth = 3.5; gl.strokeStyle = "rgba(3, 12, 16, 0.55)"; gl.stroke();
    for (let i = 0; i < m - 1; i++) {
      const helning = (yf[i + 1] - yf[i]) / (xs[i + 1] - xs[i] || 1);
      const a = klem(0.14 + helning * 2.2 + 0.08 * Math.sin(xs[i] * 0.05 + t * 2.2), 0.04, 0.62);
      if (a < 0.02) continue;
      gl.beginPath(); gl.moveTo(xs[i], yf[i] - 1); gl.lineTo(xs[i + 1], yf[i + 1] - 1);
      gl.lineWidth = 1 + a * 1.4; gl.strokeStyle = "rgba(168, 204, 208, " + a.toFixed(3) + ")"; gl.stroke();
    }

    // 4. Morild i vannkanten: der flaten er i bevegelse, lyser den
    gl.globalCompositeOperation = "lighter";
    gl.lineCap = "butt";
    let forrigeA = 0;
    for (let i = 0; i < m - 1; i++) {
      const uro = Math.abs(soyleFart(xs[i]));
      const a = forrigeA * 0.55 + klem((uro - 0.9) * 0.11, 0, 0.7) * 0.45;      // jevnet ut langs kanten, så lyset ikke blir prikkete
      forrigeA = a;
      if (a < 0.02) continue;
      gl.beginPath(); gl.moveTo(xs[i] - 0.5, yf[i] + 1); gl.lineTo(xs[i + 1] + 0.5, yf[i + 1] + 1);
      gl.lineWidth = 8; gl.strokeStyle = "rgba(53, 200, 240, " + (a * 0.34).toFixed(3) + ")"; gl.stroke();
      gl.lineWidth = 2.2; gl.strokeStyle = "rgba(196, 248, 255, " + a.toFixed(3) + ")"; gl.stroke();
    }
    gl.lineCap = "round";
    gl.globalCompositeOperation = "source-over";
  }

  function ramme(naa) {
    if (!gaar) return;
    const dt = Math.min(0.05, Math.max(0.001, (naa - sist) / 1000));
    sist = naa; t += dt;
    const sy = scrollY, dS = sy - sistSy;
    sistSy = sy;

    // Dykket følger rullingen, litt seigt, slik vann er. Midt i dykket går det saktere, så en rekker å se
    // bildet som er delt i over og under vann.
    const p = klem((sy - stedTopp) / stedLengde);
    const u = klem((p - fra) / (1 - fra)), v = 2 * u - 1;
    const maalD = 0.5 + 0.5 * Math.sign(v) * Math.pow(Math.abs(v), 1.7);
    d += (maalD - d) * (1 - Math.exp(-dt * 10));
    if (Math.abs(maalD - d) < 0.0006) d = maalD;
    const forrige = y0;
    y0 = H + MARG - d * (H + 2 * MARG);
    const dy0 = y0 - forrige;
    fart += (dy0 / dt - fart) * 0.2;
    const hast = klem(Math.abs(fart) / 1300);                               // hvor fort flaten flytter seg, 0 til 1
    hastNaa = hast;
    utslag = klem(H * 0.02, 9, 20) + hast * 30;                             // dønningen vokser når det går fort

    // Vi dykker: bildet over vann går opp sammen med flaten. Først kommer vannkanten til syne nederst,
    // så følger bildet den hele veien opp og ut.
    loft = d > 0 ? Math.min(0, y0 - (H - LEPPE)) : 0;
    lag.style.transform = loft ? "translate3d(0, " + loft.toFixed(1) + "px, 0)" : "";
    bak.style.setProperty("--inn", (1 - d).toFixed(4));
    settNed();

    const dykker = iDykket();
    gl.setTransform(dpr, 0, 0, dpr, 0, 0);
    gl.clearRect(0, 0, B, H);
    if (d <= 0) {
      if (lag.style.clipPath) lag.style.clipPath = "";
      if (lag.style.visibility) lag.style.visibility = "";
      draaper.length = 0;
    } else if (d >= 1) {
      if (lag.style.visibility !== "hidden") lag.style.visibility = "hidden";
      draaper.length = 0;
    } else {
      lag.style.visibility = "";
      // vannet: fast takt, så det oppfører seg likt på alle skjermer
      akk += dt;
      for (let i = 0; i < 3 && akk >= 1 / 60; i++, akk -= 1 / 60) {
        if (hast > 0.03) {
          // rulling rører opp flaten: noen tilfeldige støt, og et skvulp som går på tvers
          for (let k = 0; k < 3; k++) fartS[Math.floor(Math.random() * n)] += tilf(-1, 1) * hast * 9;
          for (let k = 0; k < n; k++) fartS[k] += Math.sin(k * 0.07 + t * 3.4) * hast * 0.9 * Math.sign(fart || 1);
        }
        stegVann();
      }
      if (akk > 0.1) akk = 0;
      tegnFlate();
      if (skum) tegnSkum(dt);

      // dråper fra plask: opp i lufta og ned igjen, med et lite skvulp når de lander
      for (let i = draaper.length - 1; i >= 0; i--) {
        const s = draaper[i];
        s.vy += 1700 * dt; s.x += s.vx * dt; s.y += s.vy * dt + dy0;
        if (s.x < -20 || s.x > B + 20 || (s.vy > 0 && s.y > linje(klem(s.x, 0, B)))) { if (s.x > 0 && s.x < B) stot(s.x, s.r * 0.9, 1.4); draaper.splice(i, 1); continue; }
        const hx = s.x - s.vx * 0.011, hy = s.y - s.vy * 0.011;
        gl.beginPath(); gl.moveTo(hx, hy); gl.lineTo(s.x, s.y);
        gl.lineWidth = s.r * 3.6; gl.strokeStyle = "rgba(53, 200, 240, 0.14)"; gl.stroke();
        gl.lineWidth = s.r * 1.5; gl.strokeStyle = "rgba(232, 246, 244, 0.85)"; gl.stroke();
      }
    }

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, B, H);
    if (d > 0) {
      const ned = klem((sy - nedFra) / (nedTil - nedFra));
      // Hvor mye vannet flytter seg forbi kameraet i dette bildet: i dykket følger det vannflaten, etterpå rullingen
      const flytt = dykker ? dy0 : -dS;

      // Morild: flere jo dypere en kommer
      const uro = klem(Math.abs(flytt) / 26);
      const synlige = Math.round(N * (0.5 + 0.5 * ned));
      const R = 170;
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < N; i++) {
        const m = morild[i];
        m.f += dt * (0.35 + m.z * 0.4);
        m.x += Math.sin(m.f) * 3.2 * m.z * dt;
        m.y += flytt * m.z * 0.55 + Math.cos(m.f * 0.7) * 2.4 * dt;
        if (m.y < -12) { m.y += H + 24; m.x = tilf(0, B); m.e = 0; } else if (m.y > H + 12) { m.y -= H + 24; m.x = tilf(0, B); m.e = 0; }
        if (uro > 0.02 && Math.random() < uro * 0.1) m.e = Math.min(1, m.e + tilf(0.45, 1));
        if (peker.uro > 0.02) {
          const ax = m.x - peker.x, ay = m.y - peker.y, avstand = Math.hypot(ax, ay);
          if (avstand < R) { const k = 1 - avstand / R; m.e = Math.min(1, m.e + k * peker.uro * 0.5); m.x += (ax / (avstand + 1)) * k * 26 * dt; m.y += (ay / (avstand + 1)) * k * 26 * dt; }
        }
        m.e *= Math.exp(-dt * 1.25);
        if (i >= synlige) continue;
        lyspunkt(m.x, m.y, (0.5 + m.z * 1.05) * (1 + m.e * 0.7), m.hvile + m.e * 0.84, 4.6, 1);
      }
      for (let i = kjol.length - 1; i >= 0; i--) {
        const k = kjol[i];
        k.liv -= dt / k.lengde;
        if (k.liv <= 0) { kjol.splice(i, 1); continue; }
        k.vx *= Math.exp(-dt * 2.2); k.vy *= Math.exp(-dt * 2.2);
        k.x += k.vx * dt; k.y += k.vy * dt + flytt * 0.6;
        lyspunkt(k.x, k.y, k.r, k.liv * k.liv, 4.2, 0.95);
      }
      g.globalCompositeOperation = "source-over";
    } else {
      kjol.length = 0;
    }
    peker.uro *= Math.exp(-dt * 5);
    requestAnimationFrame(ramme);
  }
  document.addEventListener("visibilitychange", () => { gaar = !document.hidden; sist = performance.now(); sistSy = scrollY; if (gaar) requestAnimationFrame(ramme); });
  requestAnimationFrame(ramme);
}
