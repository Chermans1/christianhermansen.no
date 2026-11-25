// Prosjektene i O3. Tekstene er hentet fra data/projects.json på dagens side, fra README-ene til prosjektene
// og fra utkastene i runde 4. Ingen tall eller sitater er diktet opp.
// film: rullefilm laget av 02_Design/opptak/lag-rull.sh (den ekte siden som ruller sakte nedover)
export const PROSJEKTER = [
  {
    id: "zempel", navn: "Zempel", type: "Digitalt verktøy", status: "I pilot hos styret i Fanatastisk", aar: "",
    ingress: "Styr festivalen, ikke innboksen.",
    tekst: [
      "Et system for festivaldrift. Artister, program, frivillige og budsjett på ett sted, i stedet for i fem regneark.",
      "Artister, crew, ridere og produksjon er samlet, så ingen må jakte på artistinformasjon i innboksen.",
    ],
    omfang: ["Idé og konsept", "Design", "Kode", "Pilot med en ekte festival"],
    lenke: "https://zempel.no/", lenketekst: "zempel.no",
  },
  {
    // Nettside og app. Teksten om appen er hentet fra README i adhd-oyane-app (25.11.2026).
    id: "adhdoyane", navn: "ADHD Norge Øyane", type: "Nettside og app", status: "Live", aar: "",
    ingress: "Et lokallag samlet på ett sted, og kvitteringene ut av e-posten.",
    tekst: [
      "Lokallaget i Øygarden og Askøy har aktiviteter med påmelding, nyheter og prosjekter samlet på ett sted. Medlemmene melder seg på rett på siden, uten skjemaer eller e-post.",
      "Jeg er frivillig økonomiansvarlig i lokallaget, og utlegg betydde å lagre bildet, skrive en e-post og legge ved. Appen gjør det til ett steg: de frivillige tar bilde av kvitteringen, velger prosjekt og sender. Kassereren godkjenner og betaler ut fra samme sted, og alle ser hvor mye som er igjen på hvert prosjekt.",
      "Innloggingen skjer med kode på e-post, uten passord. Hvem som kan se og gjøre hva, håndheves i databasen, ikke bare i appen.",
    ],
    omfang: ["Nettside med påmelding", "Nyheter og prosjektsider", "Webapp for kvitteringer og utlegg", "Roller og tilgang i databasen"],
    lenke: "https://adhdoyane.no/", lenketekst: "adhdoyane.no",
  },
  {
    id: "fanatastisk", navn: "Fanatastisk", type: "Nettside og app", status: "Live, nytt design til 2027", aar: "2025–2027",
    ingress: "En lokal festival i Fana, med nettside og app som leser det samme innholdet.",
    tekst: [
      "Det nye designet til 2027 er en nattplakat: filmen spiller inne i logoen, billetten ligger oppå i krem, og festivaldagene er billetter du trykker deg inn på. Program, artistsider, FAQ og billettkjøp via Ticketmaster følger med fra før.",
      "Festivalen redigerer alt selv i Sanity Studio, også hvilken fase siden står i, fra nedtelling før første artist er sluppet til fullt program. Artister som ikke er annonsert, vises aldri.",
      "Appen leser det samme innholdet og har fått det samme designet i versjon 2.0: program, artistsider, kart over området og favoritter med varsel før konserten starter. Første versjon har ligget i App Store siden 17. august 2026.",
    ],
    omfang: ["Nettside i Next.js", "Innhold og faser i Sanity", "iOS-app i SwiftUI", "Billettkjøp via Ticketmaster"],
    lenke: "https://fanatastisk.no/", lenketekst: "fanatastisk.no",
  },
  {
    id: "bransjekart", navn: "Bransjekart Norge", type: "Webapp", status: "Live", aar: "2026",
    ingress: "Et åpent kart, uten betalt plass.",
    tekst: [
      "Startet med en Excel-fil med 36 bedrifter. To dager senere var det blitt et åpent kart med 277 tech- og utviklingsselskaper i Norge, med verifisert adresse, nettside og organisasjonsnummer.",
      "Data råtner fort. Derfor sjekker et eget skript hver oppføring mot Brønnøysundregistrene og selskapets egen nettside, og publiseringen nekter å gå live hvis dataene har hull. Gratis, uten innlogging og uten annonser.",
    ],
    omfang: ["Datainnsamling og verifisering", "Kart i Leaflet", "Filter og søk", "Skript i Node.js"],
    lenke: "https://bransjekart.christianhermansen.no", lenketekst: "bransjekart.christianhermansen.no",
  },
  {
    id: "nordlys-journal", navn: "Nordlys", type: "Nettside", status: "Demo av en reiseside", aar: "2026",
    ingress: "En reisedagbok for norske reisemål.",
    tekst: [
      "En responsiv reisedagbok bygget med Vite og vanlig JavaScript. Du filtrerer reisemål etter kyst, fjell og by, lagrer favoritter og planlegger turer med dato og nedtelling.",
      "Bildene er laget med KI.",
    ],
    omfang: ["Vite og JavaScript", "Filter og favoritter", "Turplanlegger med nedtelling"],
    lenke: "https://chermans1.github.io/nordlys-journal/", lenketekst: "Se demoen",
  },
  {
    id: "retro-vault", navn: "Retro Vault", type: "Digitalt verktøy", status: "Demo av et samlingsarkiv", aar: "2026",
    ingress: "Et mediearkiv med 11 908 oppføringer.",
    tekst: [
      "Et arkiv for musikk, film og spill med filter, søk, sortering, favoritter og statistikk, lagret i nettleseren.",
      "Den fulle samlingen har 11 908 oppføringer. Den offentlige versjonen viser et utvalg på 300.",
    ],
    omfang: ["JavaScript", "Lagring i nettleseren", "Filter, søk og statistikk"],
    lenke: "https://chermans1.github.io/retro-vault/", lenketekst: "Se demoen",
  },
];

export const film = (id) => `/media/arbeid/${id}.mp4`;
export const plakat = (id) => `/media/arbeid/${id}.webp`;

// Bildestripen i prosjektvisningen, ovenfra og ned. Den første er alltid rullefilmen fra båndet.
// telefon: hele telefonopptaket ruller sakte i en telefon. bilde: et stillbilde over hele bredden. apper: skjermer side om side.
const R4 = "/media/arbeid/";
export const GALLERI = {
  zempel: [{ t: "film" }, { t: "telefon", src: "/media/arbeid/zempel-mobil.webp", tekst: "Zempel på telefon" }, { t: "bilde", src: R4 + "zempel-topp.webp", tekst: "Første skjerm på zempel.no" }],
  adhdoyane: [{ t: "film" }, { t: "telefon", src: "/media/arbeid/adhdoyane-mobil.webp", tekst: "Hele forsiden på telefon" },
    { t: "apper", bg: "#eef2f7", src: ["/media/arbeid/adhdoyane-app-prosjekter.webp", "/media/arbeid/adhdoyane-app-send.webp", "/media/arbeid/adhdoyane-app-kasserer.webp"], tekst: "Appen: prosjektene med det som er igjen, å sende en kvittering, og køen kassereren godkjenner fra. Bildene er tatt med oppdiktede data." }, { t: "bilde", src: R4 + "adhdoyane-topp.webp", tekst: "Første skjerm på adhdoyane.no" }],
  fanatastisk: [{ t: "film" }, { t: "apper", bg: "#090707", src: [R4 + "fanatastisk-app-hjem.webp", R4 + "fanatastisk-app-program.webp", R4 + "fanatastisk-app-artist.webp"], tekst: "Appen i versjon 2.0: forsiden, programmet og en artistside" }, { t: "telefon", src: R4 + "fanatastisk-mobil.webp", tekst: "Nettsiden på telefon, med 2026-programmet" }, { t: "bilde", src: R4 + "fanatastisk-topp.webp", tekst: "Første skjerm i det nye designet. Filmen spiller inne i logoen." }],
  bransjekart: [{ t: "film" }, { t: "telefon", src: "/media/arbeid/bransjekart-mobil.webp", tekst: "Listen og kartet på telefon" }, { t: "bilde", src: "/assets/img/bransjekart.webp", tekst: "Kartet med filter" }],
  "nordlys-journal": [{ t: "film" }, { t: "telefon", src: "/media/arbeid/nordlys-journal-mobil.webp", tekst: "Hele siden på telefon" }, { t: "bilde", src: R4 + "nordlys-journal-topp.webp", tekst: "Første skjerm" }],
  "retro-vault": [{ t: "film" }, { t: "telefon", src: "/media/arbeid/retro-vault-mobil.webp", tekst: "Arkivet på telefon" }, { t: "bilde", src: R4 + "retro-vault-topp.webp", tekst: "Arkivet med filter og detaljvisning" }],
};
