// Runde 4: innhold og byggeklosser som J, K og L deler.
// Rekkefølgen følger den du limte inn fra Black Flag:
// første skjerm, film, utvalgte prosjekter, det jeg gjør, hvem jeg er, laget for, spørsmål og svar, kontakt, bunn.
// «Siste artikler» er utelatt. Du har ingen artikler ennå, og jeg dikter ikke opp noen.

export const M = "../felles/r4/media/";

export const UTVALGTE = [
  {
    id: "adhdoyane", navn: "ADHD Norge Øyane", linje: ["Nettside", "Påmelding", "Nyheter"],
    tekst: "Lokallaget i Øygarden og Askøy har aktiviteter med påmelding, nyheter og prosjekter samlet på ett sted.",
    lenke: "https://adhdoyane.no/", lenketekst: "Åpne adhdoyane.no", status: "Live",
  },
  {
    id: "fanatastisk", navn: "Fanatastisk", linje: ["Nettside", "App"],
    tekst: "Musikkfestivalen i Fana fikk nettside og app, bygget på det samme innholdet. Festivalen redigerer alt selv.",
    lenke: "https://www.fanatastisk.no/", lenketekst: "Åpne fanatastisk.no", status: "Live, og appen ligger i App Store",
  },
  {
    id: "zempel", navn: "Zempel", linje: ["Digitalt verktøy"],
    tekst: "Et system for festivaldrift. Artister, program, frivillige og budsjett på ett sted, i stedet for i fem regneark.",
    lenke: "https://zempel.no/", lenketekst: "Åpne zempel.no", status: "I pilot hos styret i Fanatastisk",
  },
  {
    id: "nord", navn: "Nord", linje: ["Nettbutikk", "React", "Skolearbeid"],
    tekst: "Nettbutikk bygget i React på Kodehode, med søk, filter og handlekurv.",
    lenke: "https://nettbutikk-hazel.vercel.app/", lenketekst: "Åpne butikken", status: "Skolearbeid fra Kodehode",
  },
];

export const FLERE = [
  ["Bransjekart Norge", "Digitalt verktøy", "Live", "bransjekart"],
  ["Turntable", "Nettside som forteller", "Live", "turntable"],
  ["Nordlys journal", "Nettside", "Skolearbeid", "nordlys-journal"],
  ["Nordlys CSS", "Animasjon", "Skolearbeid", "nordlys-css"],
  ["Retro Vault", "Digitalt verktøy", "Skolearbeid", "retro-vault"],
  ["Fanatastisk-appen", "App", "Live i App Store", null],
  ["Øyane-verktøyene", "Digitale verktøy", "Live", null],
  ["Signal | Noise", "App", "Live som PWA", null],
  ["Lykkehjulet", "Digitalt verktøy", "Live", null],
];

const TJENESTER = [
  ["Nettsider", "Tegnet for deg, og laget for telefon først. Du redigerer innholdet selv.",
    ["Design som ikke er en mal", "Innhold du redigerer selv", "Opplæring når du tar over"]],
  ["Apper", "For iPhone, eller rett i nettleseren. Én ting som løser ett problem godt.",
    ["Virker uten nett der det trengs", "Hele veien ut i App Store", "Bygget på innholdet du alt har"]],
  ["Digitale verktøy", "Små verktøy som tar jobben ingen har tid til.",
    ["Skjemaer som regner ut selv", "Kart og oversikter du kan stole på", "Ingen konto og ingen sporing hvis du ikke må ha det"]],
];

const TILBUD = [
  ["Nettsider som forteller historier", "Du ruller, og siden svarer. Historien din fortelles i den rekkefølgen du vil ha den."],
  ["Gratis hjelp til dem som bidrar", "Driver du noe som gjør det bedre for andre, kan du søke om hjelp uten regning. Ett prosjekt om gangen. Det er måten jeg gir tilbake på."],
];

const SPORSMAL = [
  ["Hvem passer dette for?", "Arrangører, lag, foreninger og små bedrifter som trenger noe som er laget for dem, og ikke en mal."],
  ["Hva koster det?", "Det kommer an på hva du trenger. Vi snakker først, og du får vite prisen før noe bygges."],
  ["Hvor lang tid tar det?", "En enkel nettside tar noen uker. En app eller et verktøy tar lenger. Du får en plan etter den første samtalen."],
  ["Kan jeg endre innholdet selv etterpå?", "Ja. Du får opplæring, og etterpå driver du det selv."],
  ["Hvordan søker jeg om gratis hjelp?", "Send en e-post og fortell hva dere driver med. Jeg tar ett slikt prosjekt om gangen."],
];

const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function topp() {
  return `
  <a class="hopp" href="#arbeid">Hopp til arbeidet</a>
  <header class="r4-topp">
    <a class="r4-logo" href="#" aria-label="Christian Hermansen, til toppen"><img src="../felles/ch-logo-horisontal-krem.svg" alt="" width="168" height="40"></a>
    <nav aria-label="Hovedmeny">
      <a href="#arbeid">Arbeid</a><a href="#tjenester">Tjenester</a><a href="#hvem">Om meg</a><a class="r4-knapp" href="#kontakt">Kontakt</a>
    </nav>
  </header>`;
}

export function flere() {
  return `
  <div class="r4-flere">
    <h3>Flere prosjekter</h3>
    <ul>${FLERE.map(([n, t, s]) => `<li><span class="n">${e(n)}</span><span class="t">${e(t)}</span><span class="s">${e(s)}</span></li>`).join("")}</ul>
  </div>`;
}

export function nedre({ hvemTittel = "Tømrer i femten år. Utvikler nå.", portrett = true } = {}) {
  return `
  <section class="r4 r4-tjenester" id="tjenester" aria-labelledby="t-tittel">
    <header class="r4-hode"><p class="r4-merke">Det jeg gjør</p><h2 id="t-tittel">Nettsider, apper og digitale verktøy.</h2></header>
    <ol class="r4-tre">${TJENESTER.map(([n, t, p], i) => `
      <li><span class="nr" aria-hidden="true">0${i + 1}</span><h3>${n}</h3><p>${t}</p><ul>${p.map((x) => `<li>${x}</li>`).join("")}</ul></li>`).join("")}
    </ol>
    <div class="r4-tilbud">${TILBUD.map(([n, t]) => `<article><h3>${n}</h3><p>${t}</p></article>`).join("")}</div>
  </section>

  <section class="r4 r4-hvem" id="hvem" aria-labelledby="h-tittel">
    ${portrett ? `<figure><img src="/assets/img/portrett.webp" alt="Christian Hermansen, portrett i svart-hvitt" width="900" height="1350" loading="lazy"></figure>` : ""}
    <div>
      <p class="r4-merke">Hvem jeg er</p>
      <h2 id="h-tittel">${hvemTittel}</h2>
      <p>Jeg fikk min første datamaskin på åttitallet, en Commodore 64, og har hatt data i fingrene siden. Men yrkesveien min er ingen rett linje: rundt femten år som tømrer, etter hvert som bas og prosjektleder, og til slutt tre år som driftssjef i et brannvernfirma.</p>
      <p>Håndverkertankegangen ble med: mål to ganger, kutt én gang, og ikke lever noe du ikke ville hatt i eget hus. Det gjelder kode også.</p>
      <p>I dag tar jeg fullstack-utdanning hos Kodehode i Bergen, og bygger ekte ting ved siden av.</p>
    </div>
  </section>

  <section class="r4 r4-lagetfor" aria-labelledby="l-tittel">
    <p class="r4-merke" id="l-tittel">Laget for</p>
    <ul><li>Fanatastisk</li><li>ADHD Norge Øyane</li></ul>
    <p class="r4-liten">Her står bare ekte oppdrag.</p>
  </section>

  <section class="r4 r4-sporsmal" aria-labelledby="s-tittel">
    <header class="r4-hode"><p class="r4-merke">Spørsmål og svar</p><h2 id="s-tittel">Det folk lurer på.</h2></header>
    <div class="r4-liste">${SPORSMAL.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
  </section>

  <section class="r4 r4-kontakt" id="kontakt" aria-labelledby="k-tittel">
    <header class="r4-hode"><p class="r4-merke">Kontakt</p><h2 id="k-tittel">Fortell hva du trenger.</h2></header>
    <form class="r4-skjema" novalidate>
      <fieldset><legend>Jeg trenger</legend>
        ${["Nettside", "App", "Digitalt verktøy", "Vet ikke ennå"].map((v, i) => `<label class="brikke"><input type="checkbox" name="trenger" value="${v}"><span>${v}</span></label>`).join("")}
      </fieldset>
      <fieldset><legend>Jeg er</legend>
        ${["Arrangør", "Lag eller forening", "Bedrift", "Privatperson"].map((v) => `<label class="brikke"><input type="radio" name="hvem" value="${v}"><span>${v}</span></label>`).join("")}
      </fieldset>
      <div class="felt"><label for="f-navn">Navn</label><input id="f-navn" name="navn" autocomplete="name"></div>
      <div class="felt"><label for="f-epost">E-post</label><input id="f-epost" name="epost" type="email" autocomplete="email"></div>
      <div class="felt bred"><label for="f-om">Kort om prosjektet</label><textarea id="f-om" name="om" rows="4"></textarea></div>
      <div class="send"><button type="submit">Send</button><p class="r4-liten" role="status" aria-live="polite">Eller skriv til <a href="mailto:epost@christianhermansen.no">epost@christianhermansen.no</a>. Jeg svarer selv.</p></div>
    </form>
  </section>

  <footer class="r4-bunn">
    <img src="/assets/img/ch-logo-stablet-krem.svg" alt="Christian Hermansen" width="120" height="120" loading="lazy">
    <p><a href="mailto:epost@christianhermansen.no">epost@christianhermansen.no</a><br><a href="https://github.com/Chermans1">GitHub</a></p>
    <p class="r4-liten">© 2026 Christian Hermansen. Bygd for hånd i Bergen.<br>Dette er en skisse. Tekstene er utkast, og skjemaet sender ikke noe.</p>
    <div class="r4-striper" aria-hidden="true"><i></i><i></i><i></i></div>
  </footer>`;
}

// Kalles etter at innholdet er satt inn.
export function koble() {
  const skjema = document.querySelector(".r4-skjema");
  skjema?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    skjema.querySelector("[role=status]").innerHTML = "Dette er en skisse, så ingenting ble sendt. Skriv til <a href=\"mailto:epost@christianhermansen.no\">epost@christianhermansen.no</a>.";
  });
}

// Tekst som følger filmen: hvilket prosjekt som vises akkurat nå.
export async function filmtekst(video, ut) {
  try {
    const klipp = await (await fetch(M + "reel.json?v=3")).json();
    const vis = () => {
      const t = video.currentTime;
      const k = klipp.find((x) => t >= x.fra && t < x.til) || klipp[0];
      if (ut.dataset.id !== k.id) { ut.dataset.id = k.id; ut.querySelector(".fn").textContent = k.navn; ut.querySelector(".ft").textContent = k.type; }
    };
    // klippene er rundt ett sekund, så teksten må følge bilde for bilde der nettleseren kan det
    if ("requestVideoFrameCallback" in video) { const gaa = () => { vis(); video.requestVideoFrameCallback(gaa); }; video.requestVideoFrameCallback(gaa); }
    else video.addEventListener("timeupdate", vis);
    vis();
  } catch { /* uten listen vises filmen uten tekst */ }
}

export const rolig = matchMedia("(prefers-reduced-motion: reduce)");

// Gnister som stiger sakte opp over siden, flere jo lenger ned en ruller.
// Etter glørne hos Black Flag: de er få øverst og tette nederst, så en kjenner at en er på vei ned mot noe varmt.
// Står stille ute av bildet og tegnes ikke i det hele tatt for den som har bedt om mindre bevegelse.
export function gnister() {
  if (rolig.matches) return;
  const c = document.createElement("canvas");
  c.className = "r4-gnister";
  c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  const g = c.getContext("2d");
  let b = 0, h = 0, dpr = 1;
  const maal = () => { dpr = Math.min(devicePixelRatio || 1, 2); b = innerWidth; h = innerHeight; c.width = b * dpr; c.height = h * dpr; };
  maal();
  addEventListener("resize", maal);
  const MAKS = innerWidth < 700 ? 30 : 64, p = [];  // færre på telefon, ellers blir det tett
  const ny = (hvorSomHelst) => ({ x: Math.random() * b, y: hvorSomHelst ? Math.random() * h : h + 12, r: 0.9 + Math.random() * 1.7, fart: 9 + Math.random() * 28, sving: Math.random() * 6.28, styrke: 0.45 + Math.random() * 0.55, rust: Math.random() < 0.35 });
  for (let i = 0; i < MAKS; i++) p.push(ny(true));
  let sist = performance.now(), gaar = true;
  function tegn(naa) {
    if (!gaar) return;
    const dt = Math.min(0.05, (naa - sist) / 1000);
    sist = naa;
    const lengst = document.documentElement.scrollHeight - h;
    const dyp = lengst > 0 ? Math.min(1, scrollY / lengst) : 0;
    const antall = Math.round(5 + (MAKS - 5) * Math.pow(dyp, 1.5));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, b, h);
    for (let i = 0; i < MAKS; i++) {
      const s = p[i];
      s.y -= s.fart * dt;
      s.sving += dt * 1.3;
      s.x += Math.sin(s.sving) * 7 * dt;
      if (s.y < -12) { p[i] = ny(false); continue; }
      if (i >= antall) continue;
      const a = s.styrke * (0.6 + 0.4 * Math.sin(s.sving * 3));
      g.fillStyle = s.rust ? "#e2632f" : "#d9923c";
      g.globalAlpha = a * 0.22;
      g.beginPath(); g.arc(s.x, s.y, s.r * 3.2, 0, 6.283); g.fill();
      g.globalAlpha = a;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
    }
    requestAnimationFrame(tegn);
  }
  document.addEventListener("visibilitychange", () => { gaar = !document.hidden; sist = performance.now(); if (gaar) requestAnimationFrame(tegn); });
  requestAnimationFrame(tegn);
}
