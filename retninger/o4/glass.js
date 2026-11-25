// Glasset bak portrettet i O4. Bygget videre på Christians studie «Shattered Glass»
// (~/Documents/ChatGPT/Testing prompts/shattered-glass): hvite glassbiter med tykkelse og slipte kanter,
// som trykkes ned rundt pekeren så det røde under kommer frem i sprekkene.
// Endret for O4: ligger bak navnet og portrettet, tegner bare når noe beveger seg, står stille når
// del 2 tar over, viser seg selv med ett trykk ved start, og følger fingeren på telefon.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Delaunay } from "d3-delaunay";

const vert = document.querySelector(".glass");
const rot = document.documentElement;
const rolig = matchMedia("(prefers-reduced-motion: reduce)").matches;
const telefon = () => innerWidth < 860;

// To materialer. Glass er det låste (logg 24l). Keramikk er en variant: ?keramikk i adressen (logg 24n).
// Keramikk: matt og varmere hvit, tykke fliser med skarpe kanter, mer vipping og bredere sprekker,
// og rødt lys som glør opp på sidene av flisene.
const keramikk = new URLSearchParams(location.search).has("keramikk");
const M = keramikk ? {
  farge: 0xf3f1ee, ruhet: 0.55, metall: 0, lakk: 0, miljo: 0.45, eksponering: 1.3, himmel: 1.5, lys: 1.9,
  stripe: 0.02, krymp: 0.26, innfelling: 1.4, tykk: 30, fasHoyde: 1.6, fasBredde: 2.4, fasSteg: 2,
  vridning: 17, glipe: 7, dybde: 46, kantRod: "vec3(.85,.02,.03)", kantRodStyrke: 0.95, glod: 22000, skygge: 0.55,
  ro: [248, 244, 242], // målt: flatene inne i radiusen
} : {
  farge: 0xf4f5f7, ruhet: 0.075, metall: 0.08, lakk: 1, miljo: 0.8, eksponering: 1.35, himmel: 1.25, lys: 2.1,
  stripe: 0.13, krymp: 0.15, innfelling: 5.6, tykk: 15, fasHoyde: 5.2, fasBredde: 7, fasSteg: 3,
  vridning: 10.5, glipe: 4.5, dybde: 38, kantRod: "vec3(.22,.006,.012)", kantRodStyrke: 0.9, glod: 38000, skygge: 0,
  ro: [246, 245, 248],
};
const tall = (v) => Number(v).toFixed(4); // tall inn i skyggeleggeren

// Innstillingene fra studien, litt justert (se loggen 24k)
const S = { tetthet: 28, ujevnhet: 0.78, radius: 300, dybde: M.dybde, stivhet: 240, demping: 27, vridning: M.vridning, glipe: M.glipe, rodt: 1, gjenreis: 1 };

// ---------- Bruddmønsteret ----------
function tilfeldig(seed = 7219) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function knus(width, height, tetthet, ujevnhet, treff) {
  const rng = tilfeldig();
  const antall = Math.max(16, Math.round(width * height / 1e6 * tetthet));
  const pkt = [];
  for (let i = 0; i < antall; i++) pkt.push([rng() * width, rng() * height]);
  // Ett treffpunkt med små vifter, så bruddet ikke blir et jevnt mønster. Det legges ved portrettet.
  const rays = 5 + Math.floor(rng() * 4);
  for (let j = 0; j < rays; j++) {
    const a = j / rays * Math.PI * 2 + rng() * 0.3, r = 45 + rng() * 95 * ujevnhet;
    pkt.push([Math.max(0, Math.min(width, treff[0] + Math.cos(a) * r)), Math.max(0, Math.min(height, treff[1] + Math.sin(a) * r))]);
  }
  const voronoi = Delaunay.from(pkt).voronoi([0, 0, width, height]);
  const polys = [];
  for (let i = 0; i < pkt.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;
    const p = cell.slice(0, -1).map(([x, y]) => [x - width / 2, height / 2 - y]);
    if (rng() < ujevnhet * 0.8 && p.length > 3) { for (let j = 1; j < p.length - 1; j++) polys.push([p[0], p[j], p[j + 1]]); }
    else polys.push(p);
  }
  // Små knekker i kantene, delt mellom nabobitene så det ikke blir hull
  const kanter = new Map(), grenser = new Map();
  const nokkel = (p) => p.map((v) => v.toFixed(6)).join(",");
  const kantnokkel = (a, b) => [nokkel(a), nokkel(b)].sort().join(":");
  for (const poly of polys) {
    let areal = 0, omkrets = 0;
    poly.forEach((a, i) => { const b = poly[(i + 1) % poly.length]; areal += a[0] * b[1] - b[0] * a[1]; omkrets += Math.hypot(b[0] - a[0], b[1] - a[1]); });
    const grense = Math.abs(areal) / Math.max(omkrets, 1) * 0.12;
    poly.forEach((a, i) => { const k = kantnokkel(a, poly[(i + 1) % poly.length]); grenser.set(k, Math.min(grenser.get(k) ?? Infinity, grense)); });
  }
  return polys.map((poly) => poly.flatMap((a, idx) => {
    const b = poly[(idx + 1) % poly.length];
    const kA = nokkel(a), kB = nokkel(b), fram = kA < kB, k = fram ? kA + ":" + kB : kB + ":" + kA;
    if (!kanter.has(k)) {
      const s = fram ? a : b, e = fram ? b : a, dx = e[0] - s[0], dy = e[1] - s[1], len = Math.hypot(dx, dy);
      const kant = (Math.abs(a[0]) === width / 2 && a[0] === b[0]) || (Math.abs(a[1]) === height / 2 && a[1] === b[1]);
      const midt = [];
      if (len > 12 && !kant) {
        const amp = Math.min(1.15, len * 0.035, grenser.get(k)) * ujevnhet;
        for (const t of [0.25, 0.5, 0.75]) { const o = (rng() - 0.5) * 2 * amp; midt.push([s[0] + dx * t - dy / len * o, s[1] + dy * t + dx / len * o]); }
      }
      kanter.set(k, midt);
    }
    const midt = kanter.get(k);
    return [a, ...(fram ? midt : [...midt].reverse())];
  }));
}
function fjaer(pos, fart, maal, stiv, demp, dt) {
  fart += ((maal - pos) * stiv - fart * demp) * dt;
  pos += fart * dt;
  if (Math.abs(maal - pos) < 0.000015 && Math.abs(fart) < 0.0001) return [maal, 0];
  return [pos, fart];
}

// ---------- Scenen ----------
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" }); }
catch { throw new Error("Glasset: WebGL mangler, bakgrunnen blir hvit"); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0xffffff);
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Neutral holder hvitt hvitt (ACES i studien ga grått glass mot den hvite siden)
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = M.eksponering;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
vert.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2500);
kamera.position.z = 1000;
const himmel = new THREE.HemisphereLight(0xffffff, 0x8a8790, M.himmel); scene.add(himmel);
const lys = new THREE.DirectionalLight(0xffffff, M.lys); lys.position.set(-280, 380, 700); lys.castShadow = true;
lys.shadow.mapSize.set(2048, 2048); lys.shadow.bias = -0.0001; lys.shadow.normalBias = 0.3; lys.shadow.radius = 4;
lys.shadow.camera.near = 1; lys.shadow.camera.far = 1800; scene.add(lys);
const glod = new THREE.PointLight(0xff0018, 0, 450, 2); glod.position.z = 18; scene.add(glod);
const fyll = new THREE.DirectionalLight(0xffdada, 0.5); fyll.position.set(400, -280, 300); scene.add(fyll);
const bunn = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x050505 }));
bunn.position.z = -120; scene.add(bunn);

// Et rolig studiomiljø gir glasset brede refleksjoner
const miljo = new THREE.Scene(); miljo.background = new THREE.Color(0xaaaaaa);
for (const [x, y, z, sx, sy, styrke] of [[-300, 450, 400, 700, 350, 5], [450, 0, 200, 200, 650, 2], [-150, -500, 300, 650, 100, 1.5]]) {
  const flate = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(styrke), side: THREE.DoubleSide }));
  flate.position.set(x, y, z); flate.lookAt(0, 0, 0); miljo.add(flate);
}
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(miljo, 0.02).texture;
pmrem.dispose(); miljo.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });

// Synlig: sprekkene vises bare rundt pekeren og der glasset er trykket inn. Utenfor er glasset helt hvitt.
const u = { vis: { value: 0 }, peker: { value: new THREE.Vector2() }, r0: { value: 250 }, r1: { value: 380 }, ro: { value: new THREE.Color(M.ro[0] / 255, M.ro[1] / 255, M.ro[2] / 255) }, // målt: flatene inne i radiusen
  kant: { value: 0.32 }, depth: { value: S.dybde }, rotation: { value: S.vridning * Math.PI / 180 }, separation: { value: S.glipe } };
const TURN = "mat3 turn(float x,float y){float a=cos(x),b=sin(x),c=cos(y),d=sin(y);return mat3(c,0.,-d,b*d,a,b*c,a*d,-b,a*c);}\n";
const hvitt = new THREE.MeshPhysicalMaterial({ color: M.farge, roughness: M.ruhet, metalness: M.metall, clearcoat: M.lakk, clearcoatRoughness: 0.1, envMapIntensity: M.miljo, ior: 1.48 });
hvitt.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, { uVis: u.vis, uPeker: u.peker, uR0: u.r0, uR1: u.r1, uRo: u.ro, uKant: u.kant, uDepth: u.depth, uRotation: u.rotation, uSeparation: u.separation });
  sh.vertexShader = "attribute vec3 aCenter; attribute vec4 aMotion; varying float vPressure; varying vec2 vTilt; varying vec2 vShard; varying vec2 vPos; varying float vHoyde; uniform float uDepth; uniform float uRotation; uniform float uSeparation;\n" + TURN + sh.vertexShader;
  sh.vertexShader = sh.vertexShader.replace("#include <beginnormal_vertex>", "vec3 objectNormal=turn(aMotion.y*uRotation,aMotion.z*uRotation)*normal;");
  sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `
    float pressure=clamp(aMotion.x,0.,1.05); vPressure=pressure; vTilt=aMotion.yz; vShard=position.xy-aCenter.xy;
    vHoyde=clamp((position.z-aCenter.z)/${tall(M.tykk + 2 * M.fasHoyde)}+1.,0.,1.);
    vec3 local=position-aCenter; local.xy*=1.-pressure*${tall(M.krymp)};
    vec3 transformed=turn(aMotion.y*uRotation,aMotion.z*uRotation)*local+aCenter;
    transformed.xy+=vec2(-aMotion.z,aMotion.y)*uSeparation;
    transformed.z-=pressure*uDepth; vPos=transformed.xy;`);
  sh.fragmentShader = "uniform float uVis; uniform vec2 uPeker; uniform float uR0; uniform float uR1; uniform vec3 uRo; varying vec2 vPos; uniform float uKant; varying float vPressure; varying vec2 vTilt; varying vec2 vShard; varying float vHoyde;\n" + sh.fragmentShader;
  sh.fragmentShader = sh.fragmentShader.replace("#include <opaque_fragment>", `
    float faceShade=clamp(1.-vTilt.x*.42+vTilt.y*.32,.52,1.18);
    float studioStripe=pow(max(0.,1.-abs(vShard.x*.004+vShard.y*.006+vTilt.x*.7)),7.);
    outgoingLight*=faceShade;
    // Mørkere slipte kanter, så sprekkene tegnes tydelig også når flatene er hvite
    outgoingLight*=1.-uKant*smoothstep(.04,.55,1.-abs(normal.z));
    outgoingLight+=vec3(${tall(M.stripe)})*studioStripe*(.2+vPressure*.8);
    // Keramikk: sidene av flisene blir mørkere nedover, som skygge nede i sprekken
    float vegg=smoothstep(.3,.8,1.-abs(normal.z));
    outgoingLight*=mix(1.,mix(1.-${tall(M.skygge)},1.,vHoyde),vegg);
    float edgeBounce=vPressure*(1.-abs(normal.z)); outgoingLight=mix(outgoingLight,${M.kantRod},edgeBounce*${tall(M.kantRodStyrke)}); outgoingLight+=vec3(.095,.002,.005)*vPressure*vPressure;
    #include <opaque_fragment>`);
  sh.fragmentShader = sh.fragmentShader.replace("#include <tonemapping_fragment>", "#include <tonemapping_fragment>\n gl_FragColor.rgb *= clamp(1.-vTilt.x*.3+vTilt.y*.25,.58,1.13);");
  // Utenfor radiusen rundt pekeren males glasset i én hvit tone, så sprekkene forsvinner helt.
  // Biter som fortsatt er trykket inn (sporet etter pekeren) holder sprekkene sine til de har rettet seg opp.
  sh.fragmentShader = sh.fragmentShader.replace("#include <colorspace_fragment>", `#include <colorspace_fragment>
    float naer = uVis * (1. - smoothstep(uR0, uR1, distance(vPos, uPeker)));
    float synlig = max(naer, smoothstep(.01, .18, vPressure));
    gl_FragColor.rgb = mix(uRo, gl_FragColor.rgb, synlig);`);
};
hvitt.customProgramCacheKey = () => keramikk ? "o4-keramikk" : "o4-glass";
// Rødt under glasset, samme rød som resten av siden (#e3242b) etter lys og tonekurve
const rodt = new THREE.MeshPhysicalMaterial({ color: 0xbd0009, roughness: 0.12, metalness: 0.3, clearcoat: 1, emissive: 0x500003, emissiveIntensity: 0.025 });
const rodflate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), rodt);
rodflate.position.z = -96; rodflate.receiveShadow = true; scene.add(rodflate);
const dybdeMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
dybdeMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, { uDepth: u.depth, uRotation: u.rotation, uSeparation: u.separation });
  sh.vertexShader = "attribute vec3 aCenter; attribute vec4 aMotion; uniform float uDepth; uniform float uRotation; uniform float uSeparation;\n" + TURN + sh.vertexShader;
  sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `
    float pressure=clamp(aMotion.x,0.,1.05);
    vec3 local=position-aCenter; local.xy*=1.-pressure*${tall(M.krymp)};
    vec3 transformed=turn(aMotion.y*uRotation,aMotion.z*uRotation)*local+aCenter;
    transformed.xy+=vec2(-aMotion.z,aMotion.y)*uSeparation;
    transformed.z-=pressure*uDepth;`);
};

let geo, biter = [], bevegelse, W = 0, H = 0, mesh, skitten = true;
// Treffpunktet (der bruddet har de minste bitene og trykket ved start skjer) ligger i det ledige hvite feltet
// ved siden av portrettet: mellom teksten og figuren på stor skjerm, til venstre for hodet på telefon.
const treffpunkt = () => telefon() ? [W * 0.2, H * 0.47] : [W * 0.47, H * 0.6];
function bygg() {
  if (mesh) { scene.remove(mesh); geo.dispose(); }
  biter = []; const deler = []; let start = 0;
  const [tx, ty] = treffpunkt();
  for (const poly of knus(W + 160, H + 160, S.tetthet, S.ujevnhet, [tx + 80, ty + 80])) {
    const c = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
    const form = new THREE.Shape(poly.map((p) => {
      const dx = p[0] - c[0], dy = p[1] - c[1], r = Math.hypot(dx, dy), inn = Math.max(0.8, 1 - M.innfelling / Math.max(r, 1));
      return new THREE.Vector2(dx * inn, dy * inn);
    }));
    const bit = new THREE.ExtrudeGeometry(form, { depth: M.tykk, bevelEnabled: true, bevelThickness: M.fasHoyde, bevelSize: M.fasBredde, bevelSegments: M.fasSteg, steps: 1, curveSegments: 1 });
    // Toppen av biten ligger alltid i z = 0, uansett tykkelse
    bit.translate(c[0], c[1], -(M.tykk + M.fasHoyde)); bit.deleteAttribute("uv");
    const n = bit.attributes.position.count, sentre = new Float32Array(n * 3);
    for (let j = 0; j < n; j++) { sentre[j * 3] = c[0]; sentre[j * 3 + 1] = c[1]; }
    bit.setAttribute("aCenter", new THREE.BufferAttribute(sentre, 3));
    biter.push({ x: c[0], y: c[1], p: 0, v: 0, rx: 0, ry: 0, vx: 0, vy: 0, start, count: n });
    start += n; deler.push(bit);
  }
  geo = mergeGeometries(deler, false); deler.forEach((d) => d.dispose());
  bevegelse = new THREE.BufferAttribute(new Float32Array(start * 4), 4).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("aMotion", bevegelse);
  mesh = new THREE.Mesh(geo, hvitt); mesh.frustumCulled = false;
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.customDepthMaterial = dybdeMat;
  scene.add(mesh);
  renderer.shadowMap.needsUpdate = true; skitten = true;
}
function storrelse() {
  W = innerWidth; H = innerHeight; renderer.setSize(W, H);
  Object.assign(kamera, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 }); kamera.updateProjectionMatrix();
  bunn.scale.set(W + 300, H + 300, 1); rodflate.scale.set(W + 300, H + 300, 1);
  const e = Math.max(W, H) * 0.7;
  Object.assign(lys.shadow.camera, { left: -e, right: e, top: e, bottom: -e }); lys.shadow.camera.updateProjectionMatrix();
  // Mindre trykk på små skjermer, så det ikke tar hele telefonen
  S.radius = telefon() ? 190 : 300;
  u.r0.value = S.radius * 0.8; u.r1.value = S.radius * 1.25;
  bygg();
}
storrelse();
let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(storrelse, 130); });

// ---------- Pekeren ----------
const peker = { x: 0, y: 0, aktiv: false };
let rortHar = false, introSlutt = 0;
const iDel1 = () => (parseFloat(rot.style.getPropertyValue("--p")) || 0) < 0.04;
const sett = (e) => { peker.x = e.clientX - W / 2; peker.y = H / 2 - e.clientY; };
if (!rolig) {
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") { rortHar = true; introSlutt = 0; sett(e); peker.aktiv = iDel1(); }
    else if (peker.aktiv) sett(e);
  }, { passive: true });
  addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" && iDel1()) { rortHar = true; introSlutt = 0; sett(e); peker.aktiv = true; } }, { passive: true });
  addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") peker.aktiv = false; }, { passive: true });
  addEventListener("pointercancel", () => { peker.aktiv = false; }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { peker.aktiv = false; });
  addEventListener("blur", () => { peker.aktiv = false; });
  // Ett trykk ved start, så en ser at glasset kan trykkes inn. Bare om pekeren ikke har rørt seg ennå.
  setTimeout(() => {
    if (rortHar || !iDel1()) return;
    const [tx, ty] = treffpunkt(); peker.x = tx - W / 2; peker.y = H / 2 - ty;
    peker.aktiv = true; introSlutt = performance.now() + 1100;
  }, 700);
}

// ---------- Sprekk bak stolen (Om meg) ----------
// Når bildet flytter seg til Om meg og tilbake, sprekker glasset i et felt bak stolen som følger den, og legger seg
// når den står stille. Kalles fra siden: glassSprekk(fraX, fraY, tilX, tilY, radius, ms), i skjermpunkter.
let sprekk = null;
window.glassSprekk = (x0, y0, x1, y1, r, ms) => {
  if (rolig) return;
  sprekk = { x0: x0 - W / 2, y0: H / 2 - y0, x1: x1 - W / 2, y1: H / 2 - y1, r, ms, t0: performance.now() };
};

// ---------- Tegning: bare når noe beveger seg ----------
let sist = performance.now();
function ramme(naa) {
  requestAnimationFrame(ramme);
  const dt = Math.min((naa - sist) / 1000, 1 / 30); sist = naa;
  if (introSlutt && naa > introSlutt) { introSlutt = 0; if (!rortHar) peker.aktiv = false; }
  if (peker.aktiv && !iDel1()) peker.aktiv = false;
  const steg = Math.max(1, Math.ceil(dt / 0.008)), h = dt / steg;
  let endret = false, maks = 0;
  // Hvor sprekkfeltet er nå: det følger stolen med samme myke fart, kommer fort og legger seg mot slutten
  let sx = 0, sy = 0, sStyrke = 0;
  if (sprekk) {
    const t = (naa - sprekk.t0) / sprekk.ms;
    if (t > 1) sprekk = null;
    else {
      const g = 1 - Math.exp(-t * 4.2);
      sx = sprekk.x0 + (sprekk.x1 - sprekk.x0) * g; sy = sprekk.y0 + (sprekk.y1 - sprekk.y0) * g;
      sStyrke = Math.min(1, t / 0.15) * (t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45) * 0.9;
    }
  }
  for (const f of biter) {
    let dx = f.x - peker.x, dy = f.y - peker.y, d = Math.hypot(dx, dy);
    const t = peker.aktiv ? Math.max(0, 1 - d / S.radius) : 0;
    let maal = t * t * (3 - 2 * t);
    if (t > 0) f.sprekk = false;
    if (sStyrke > 0) {
      const bx = f.x - sx, by = f.y - sy, bd = Math.hypot(bx, by), k = Math.max(0, 1 - bd / sprekk.r), b = k * k * (3 - 2 * k) * sStyrke;
      if (b > maal) { f.sprekk = true; maal = b; dx = bx * S.radius / sprekk.r; dy = by * S.radius / sprekk.r; }
    }
    if (maal === 0 && f.p === 0 && f.rx === 0 && f.ry === 0) continue;
    const korn = Math.sin(f.x * 12.9898 + f.y * 78.233);
    const rx = maal * (dy / S.radius * 3 + korn * 0.45), ry = maal * (-dx / S.radius * 3 + Math.cos(f.y * 5.17 + f.x) * 0.45);
    const g = maal < f.p ? S.gjenreis : 1, k = S.stivhet * g * g, dm = S.demping * g;
    for (let j = 0; j < steg; j++) {
      [f.p, f.v] = fjaer(f.p, f.v, maal, k, dm, h);
      [f.rx, f.vx] = fjaer(f.rx, f.vx, rx, k, dm, h);
      [f.ry, f.vy] = fjaer(f.ry, f.vy, ry, k, dm, h);
    }
    // det røde lyset følger pekeren, ikke sprekken bak stolen
    if (!f.sprekk) maks = Math.max(maks, f.p);
    endret = true;
    for (let i = f.start; i < f.start + f.count; i++) { const o = i * 4; bevegelse.array[o] = f.p; bevegelse.array[o + 1] = f.rx; bevegelse.array[o + 2] = f.ry; }
  }
  if (endret) { bevegelse.needsUpdate = true; renderer.shadowMap.needsUpdate = true; skitten = true; }
  // Sprekkene kommer fort når pekeren er der, og tones sakte bort når den går
  const maalVis = peker.aktiv ? 1 : 0, gammelVis = u.vis.value;
  u.vis.value += (maalVis - gammelVis) * (1 - Math.exp(-dt * (maalVis > gammelVis ? 9 : 2.2)));
  if (Math.abs(u.vis.value - maalVis) < 0.002) u.vis.value = maalVis;
  if (u.vis.value !== gammelVis) skitten = true;
  if (u.vis.value > 0 && (u.peker.value.x !== peker.x || u.peker.value.y !== peker.y)) { u.peker.value.set(peker.x, peker.y); skitten = true; }
  if (!skitten) return;
  glod.position.set(peker.x, peker.y, 18); glod.intensity = M.glod * maks * S.rodt;
  renderer.render(scene, kamera);
  skitten = false;
  vert.classList.add("klar");
}
requestAnimationFrame(ramme);
window.glassInfo = () => ({ biter: biter.length, trekanter: renderer.info.render.triangles, aktiv: peker.aktiv });
// Til finjustering i konsollen: glassJuster({ eksponering: 1.3 })
window.glassJuster = (o) => {
  if (o.eksponering != null) renderer.toneMappingExposure = o.eksponering;
  if (o.himmel != null) himmel.intensity = o.himmel;
  if (o.lys != null) lys.intensity = o.lys;
  if (o.farge != null) hvitt.color.set(o.farge);
  if (o.miljo != null) hvitt.envMapIntensity = o.miljo;
  if (o.kant != null) u.kant.value = o.kant;
  if (o.ro != null) u.ro.value.set(o.ro);
  if (o.r0 != null) u.r0.value = o.r0;
  if (o.r1 != null) u.r1.value = o.r1;
  if (o.vis != null) u.vis.value = o.vis;
  if (o.tone != null) { renderer.toneMapping = THREE[o.tone + "ToneMapping"]; hvitt.needsUpdate = rodt.needsUpdate = true; }
  renderer.shadowMap.needsUpdate = true; skitten = true;
};
// Gjennomsnittlig farge på glasset i ro (til finjustering): glassMal()
window.glassMal = () => {
  renderer.render(scene, kamera);
  const gl = renderer.getContext(), b = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(4);
  let sum = 0, n = 0, lav = 255; const kanal = [[], [], []];
  for (let i = 0; i < 400; i++) {
    gl.readPixels(Math.floor(Math.random() * b), Math.floor(Math.random() * h), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const v = (px[0] + px[1] + px[2]) / 3; sum += v; n++; lav = Math.min(lav, v);
    for (let k = 0; k < 3; k++) kanal[k].push(px[k]);
  }
  const median = kanal.map((k) => k.sort((x, y) => x - y)[200]);
  return { snitt: Math.round(sum / n), morkest: Math.round(lav), median };
};
