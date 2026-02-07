/* ===============================
   FIREBASE
================================ */
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   STATE
================================ */
let persons = [];

/* ===============================
   HELPERS
================================ */
const DEFAULT_IMAGE = "../images/history-people.jpg";
const ERA_LABELS = {
  early: "Ранна България (VII–XI в.)",
  medieval: "Средновековие (XII–XIV в.)",
  ottoman: "Османско владичество (XV–XIX в.)",
  revival: "Възраждане (XVIII–XIX в.)",
  modern: "Ново време (XIX–XX в.)"
};

function formatDate(day, month, year) {
  if (!day && !month && !year) return "";

  const d = day ? String(day).padStart(2, "0") : "";
  const m = month ? String(month).padStart(2, "0") : "";

  if (year) {
    if (d && m) return `${d}.${m}.${year} г.`;
    if (m) return `${m}.${year} г.`;
    if (d) return `${d}.${year} г.`;
    return `${year} г.`;
  }

  if (d && m) return `${d}.${m}`;
  if (m) return `${m}`;
  return `${d}`;
}

function formatLifeDates(person) {
  const birth = formatDate(person.birthDay, person.birthMonth, person.birthYear);
  const death = formatDate(person.deathDay, person.deathMonth, person.deathYear);

  if (birth && death) return `${birth} – ${death}`;
  if (death) return `† ${death}`;
  if (birth) return `р. ${birth}`;
  return "";
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(text, max = 180) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

/* ===============================
   ELEMENTS (1:1 с HTML)
================================ */
const grid = document.getElementById("catalogGrid");
const searchInput = document.getElementById("searchInput");
const eraFilter = document.getElementById("eraFilter"); // може да е null

/* ===============================
   LOAD PERSONS (САМО В ПАМЕТ)
================================ */
async function loadPersons() {
  const q = query(
    collection(db, "persons"),
    where("published", "==", true)
  );

  const snap = await getDocs(q);

  persons = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // ❗ ВАЖНО: нищо не показваме при load
  grid.innerHTML = "";
}

/* ===============================
   RENDER (НЕ ПИПА ДИЗАЙНА)
================================ */
function renderPersons(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>Няма намерени личности.</p>";
    return;
  }

  const cards = list.map(p => {
    const imageUrl = p.imageUrl || DEFAULT_IMAGE;
    const datesText = formatLifeDates(p);
    const periodText = p.period ? (ERA_LABELS[p.period] || p.period) : "";
    const descriptionText = truncate(cleanText(p.description || ""));

    return `
      <a href="person.html?slug=${p.slug}" class="person-card">
        <img class="person-card-image" src="${imageUrl}" alt="${p.name || ""}" loading="lazy">
        <div class="person-card-content">
          <h3 class="person-card-name">${p.name || ""}</h3>
          ${datesText ? `<div class="person-card-period">${datesText}</div>` : ""}
          ${descriptionText ? `<p class="person-card-description">${descriptionText}</p>` : ""}
          ${periodText ? `<span class="period-badge">${periodText}</span>` : ""}
        </div>
      </a>
    `;
  }).join("");

  grid.innerHTML = cards;

  requestAnimationFrame(() => {
    grid.querySelectorAll(".person-card").forEach((card, index) => {
      setTimeout(() => card.classList.add("visible"), index * 40);
    });
  });
}

/* ===============================
   FILTER LOGIC
================================ */
function applyFilters() {
  const text = searchInput.value.toLowerCase().trim();
  const era = eraFilter?.value || "all";

  const filtered = persons.filter(p => {
    const matchesText =
      text.length === 0 ||
      p.name?.toLowerCase().includes(text) ||
      p.description?.toLowerCase().includes(text);

    const matchesEra =
      era === "all" ||
      !p.period ||
      p.period === era;

    return matchesText && matchesEra;
  });

  renderPersons(filtered);
}

/* ===============================
   EVENTS
================================ */
searchInput.addEventListener("input", applyFilters);

if (eraFilter) {
  eraFilter.addEventListener("change", applyFilters);
}

/* ===============================
   INIT
================================ */
loadPersons().then(applyFilters);
