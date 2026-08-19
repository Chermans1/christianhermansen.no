// christianhermansen.no — vanilla JS, ingen avhengigheter.
// Prosjektene ligger i data/projects.json så innholdet kan flyttes til
// database senere uten å skrive om siden.

// ---------------------------------------------------------------------------
// ProjectMockupCard: forhåndsvisning med miljøbilde og rullende skjerm
// Gjenbrukes av både prosjektkortene og case-siden.
// ---------------------------------------------------------------------------

function byggForhaandsvisning(prosjekt) {
  if (prosjekt.preview) {
    const p = prosjekt.preview;
    return `
      <div class="live-scene" style="--sx:${p.skjerm.x}%; --sy:${p.skjerm.y}%; --sw:${p.skjerm.w}%; --sh:${p.skjerm.h}%">
        <img class="live-bakgrunn" src="${p.scene}" alt="" loading="lazy">
        <div class="live-skjerm">
          <img class="live-side" src="${p.side}" alt="Rullende forhåndsvisning av ${prosjekt.title}" loading="lazy">
        </div>
      </div>`;
  }
  if (prosjekt.image) {
    return `<img src="${prosjekt.image}" alt="Skjermbilde fra ${prosjekt.title}" loading="lazy">`;
  }
  return `<span class="kort-monogram" aria-hidden="true">${prosjekt.monogram}</span>`;
}

function byggLenker(prosjekt) {
  const lenker = [];
  if (prosjekt.links.live) {
    lenker.push(`<a href="${prosjekt.links.live}" target="_blank" rel="noopener">Se live</a>`);
  }
  if (prosjekt.links.appstore) {
    lenker.push(`<a href="${prosjekt.links.appstore}" target="_blank" rel="noopener">App Store</a>`);
  }
  if (prosjekt.links.github) {
    lenker.push(`<a href="${prosjekt.links.github}" target="_blank" rel="noopener">GitHub</a>`);
  }
  if (prosjekt.links.website) {
    lenker.push(`<a href="${prosjekt.links.website}" target="_blank" rel="noopener">Nettside</a>`);
  }
  return lenker;
}

// ---------------------------------------------------------------------------
// Prosjektkort
// ---------------------------------------------------------------------------

function lagKort(prosjekt) {
  const kort = document.createElement("article");
  kort.className = "kort inn";

  const caseUrl = `/prosjekt.html?slug=${prosjekt.slug}`;
  const lenker = byggLenker(prosjekt);

  kort.innerHTML = `
    <div class="kort-bilde${prosjekt.preview ? " kort-live" : ""}">${byggForhaandsvisning(prosjekt)}</div>
    <div class="kort-innhold">
      <div class="kort-topp">
        <h3><a href="${caseUrl}">${prosjekt.title}</a></h3>
        <span class="kort-aar">${prosjekt.year}</span>
      </div>
      <span class="status">${prosjekt.status}</span>
      <p>${prosjekt.description}</p>
      <ul class="kort-tech">
        ${prosjekt.tech.map((t) => `<li>${t}</li>`).join("")}
      </ul>
      ${lenker.length ? `<div class="kort-lenker">${lenker.join("")}</div>` : ""}
    </div>
  `;

  // Hele kortet er klikkbart, men indre lenker (Se live, GitHub) vinner.
  kort.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    window.location.href = caseUrl;
  });

  return kort;
}

async function lastProsjekter() {
  const beholder = document.querySelector("[data-prosjekter]");
  if (!beholder) return;

  const kunUtvalgte = beholder.hasAttribute("data-kun-utvalgte");

  try {
    const svar = await fetch("/data/projects.json");
    const prosjekter = await svar.json();
    const liste = kunUtvalgte ? prosjekter.filter((p) => p.featured) : prosjekter;

    for (const prosjekt of liste) {
      beholder.appendChild(lagKort(prosjekt));
    }
    observerInn();
    observerLiveKort();
  } catch {
    beholder.innerHTML =
      '<p class="dus">Fikk ikke lastet prosjektene. Prøv å laste siden på nytt.</p>';
  }
}

// ---------------------------------------------------------------------------
// Case-side: /prosjekt.html?slug=... rendres fra samme JSON
// ---------------------------------------------------------------------------

async function lastCase() {
  const beholder = document.querySelector("[data-case]");
  if (!beholder) return;

  const slug = new URLSearchParams(window.location.search).get("slug");

  try {
    const svar = await fetch("/data/projects.json");
    const prosjekter = await svar.json();
    const prosjekt = prosjekter.find((p) => p.slug === slug);

    if (!prosjekt) {
      beholder.innerHTML = `
        <h1 class="inn">Fant ikke prosjektet.</h1>
        <p class="inn dus">Det du leter etter ligger kanskje på <a href="/prosjekter.html">prosjektsiden</a>.</p>`;
      return;
    }

    document.title = `${prosjekt.title} - Christian Hermansen`;

    const lenker = byggLenker(prosjekt);
    const harBilde = prosjekt.preview || prosjekt.image;

    beholder.innerHTML = `
      <p class="kicker inn">${prosjekt.type}</p>
      <h1 class="inn">${prosjekt.title}</h1>
      <p class="case-meta inn"><span class="status">${prosjekt.status}</span><span class="kort-aar">${prosjekt.year}</span></p>
      ${harBilde ? `<div class="kort kort-case inn"><div class="kort-bilde${prosjekt.preview ? " kort-live" : ""}">${byggForhaandsvisning(prosjekt)}</div></div>` : ""}
      <p class="ingress inn">${prosjekt.description}</p>
      ${prosjekt.omtale && prosjekt.omtale.length ? prosjekt.omtale.map((avsnitt) => `<p class="inn">${avsnitt}</p>`).join("") : ""}
      ${prosjekt.utfordringer ? `<h2 class="inn">Utfordringer</h2><p class="inn">${prosjekt.utfordringer}</p>` : ""}
      ${prosjekt.galleri && prosjekt.galleri.length ? `
        <h2 class="inn">${prosjekt.galleriTittel || "Fra verkstedet"}</h2>
        <div class="case-galleri inn">
          ${prosjekt.galleri.map((b) => `<figure><img src="${b.src}" alt="${b.alt}" loading="lazy">${b.tekst ? `<figcaption>${b.tekst}</figcaption>` : ""}</figure>`).join("")}
        </div>` : ""}
      <h2 class="inn">Teknologi</h2>
      <ul class="verktoy-liste inn">${prosjekt.tech.map((t) => `<li>${t}</li>`).join("")}</ul>
      ${lenker.length ? `<div class="kort-lenker case-lenker inn">${lenker.join("")}</div>` : ""}
      <p class="inn" style="margin-top: 2.5rem;"><a class="pil-lenke-venstre" href="/prosjekter.html">← Alle prosjekter</a></p>
    `;
    observerInn();
    observerLiveKort();
  } catch {
    beholder.innerHTML =
      '<p class="dus">Fikk ikke lastet prosjektet. Prøv å laste siden på nytt.</p>';
  }
}

// ---------------------------------------------------------------------------
// Mobil: hover finnes ikke, så rullingen trigges når kortet er godt synlig.
// CSS-en (@media hover:none) bruker .i-syne-klassen. Reduced motion
// håndteres i CSS, som for hover.
// ---------------------------------------------------------------------------

function observerLiveKort() {
  if (window.matchMedia("(hover: hover)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const kort = document.querySelectorAll(".kort-live");
  if (!kort.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const mål = entry.target.closest(".kort");
        if (!mål) continue;
        mål.classList.toggle("i-syne", entry.intersectionRatio >= 0.6);
      }
    },
    { threshold: [0, 0.6] }
  );
  kort.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Lysboks: galleri-flisene er beskåret til kvadrat - klikk viser hele bildet.
// Native <dialog>, ingen avhengigheter. Esc lukker automatisk.
// ---------------------------------------------------------------------------

function initLysboks() {
  document.addEventListener("click", (e) => {
    const bilde = e.target.closest(".case-galleri img");
    if (!bilde) return;

    let dialog = document.getElementById("lysboks");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "lysboks";
      dialog.innerHTML =
        '<button type="button" aria-label="Lukk">&times;</button><img alt="">';
      dialog.addEventListener("click", (ev) => {
        if (ev.target === dialog || ev.target.closest("button")) dialog.close();
      });
      document.body.appendChild(dialog);
    }

    const img = dialog.querySelector("img");
    img.src = bilde.src;
    img.alt = bilde.alt;
    dialog.showModal();
  });
}

// ---------------------------------------------------------------------------
// Rolig inn-animasjon. Slås av automatisk ved prefers-reduced-motion (CSS).
// ---------------------------------------------------------------------------

function observerInn() {
  const elementer = document.querySelectorAll(".inn:not(.synlig)");
  if (!("IntersectionObserver" in window)) {
    elementer.forEach((el) => el.classList.add("synlig"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("synlig");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1 }
  );
  elementer.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Hamburgermeny - bokstavelig talt. Burgeren vises i lag (eksplodert) og
// stabler seg sammen når menyen åpnes. Ren CSS-animasjon, JS bytter kun state.
// ---------------------------------------------------------------------------

function initMeny() {
  const knapp = document.querySelector(".burger");
  const nav = document.querySelector("nav.nav");
  if (!knapp || !nav) return;

  const lukk = () => {
    knapp.setAttribute("aria-expanded", "false");
    nav.classList.remove("meny-apen");
  };

  knapp.addEventListener("click", () => {
    const apen = knapp.getAttribute("aria-expanded") === "true";
    knapp.setAttribute("aria-expanded", String(!apen));
    nav.classList.toggle("meny-apen", !apen);
  });

  // Lukk ved lenkeklikk (viktig for #kontakt på samme side) og med Escape
  nav.querySelectorAll("ul a").forEach((a) => a.addEventListener("click", lukk));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lukk();
  });
}

// ---------------------------------------------------------------------------
// Årstall i footer
// ---------------------------------------------------------------------------

function settAar() {
  const el = document.querySelector("[data-aar]");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  settAar();
  observerInn();
  lastProsjekter();
  lastCase();
  initLysboks();
  initMeny();
});
