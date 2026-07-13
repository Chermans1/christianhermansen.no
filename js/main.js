// christianhermansen.no — vanilla JS, ingen avhengigheter.
// Prosjektene ligger i data/projects.json så innholdet kan flyttes til
// database senere uten å skrive om siden.

// ---------------------------------------------------------------------------
// Prosjektkort
// ---------------------------------------------------------------------------

function lagKort(prosjekt) {
  const kort = document.createElement("article");
  kort.className = "kort inn";

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

  const bilde = prosjekt.image
    ? `<img src="${prosjekt.image}" alt="Skjermbilde fra ${prosjekt.title}" loading="lazy">`
    : `<span class="kort-monogram" aria-hidden="true">${prosjekt.monogram}</span>`;

  kort.innerHTML = `
    <div class="kort-bilde">${bilde}</div>
    <div class="kort-innhold">
      <div class="kort-topp">
        <h3>${prosjekt.title}</h3>
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
  } catch {
    beholder.innerHTML =
      '<p class="dus">Fikk ikke lastet prosjektene. Prøv å laste siden på nytt.</p>';
  }
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
});
