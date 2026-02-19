import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const heroBg = document.getElementById("personHeroBg");
const nameEl = document.getElementById("personName");
const periodEl = document.getElementById("personPeriod");
const datesEl = document.getElementById("personDates");
const descEl = document.getElementById("personDescription");

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

function getSlug() {
  return new URLSearchParams(window.location.search).get("slug");
}

// === НЕПРЕКЪСНАТ ТЕКСТ БЕЗ РАЗДЕЛЕНИЯ ===
function autoFormatDescription(text) {
  if (!text) return '<p class="article-text">Няма информация</p>';

  let html = '<div class="article-section visible">';
  
  // Разделяме на параграфи (по празни редове)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Ако няма празни редове, разделяме по единични \n
  if (paragraphs.length === 0) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    paragraphs.push(...lines);
  }

  if (paragraphs.length === 0) {
    return '<p class="article-text">Няма информация</p>';
  }

  // Всеки параграф БЕЗ inline стилове - CSS ще се грижи за всичко
  paragraphs.forEach((para, index) => {
    html += `<p class="article-text">${formatText(para)}</p>`;
  });

  html += '</div>';
  return html;
}

// === ФОРМАТИРАНЕ НА ТЕКСТ ===
function formatText(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('<br>');
}

// === АНИМАЦИЯ НА СЕКЦИИТЕ ===
function observeSections() {
  const sections = document.querySelectorAll('.article-section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  sections.forEach(section => {
    observer.observe(section);
  });
}

// === ЗАРЕЖДАНЕ НА ЛИЧНОСТ ===
async function loadPerson() {
  const slug = getSlug();
  if (!slug) return;

  const q = query(
    collection(db, "persons"),
    where("slug", "==", slug),
    where("published", "==", true)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    nameEl.textContent = "Личността не е намерена";
    return;
  }

  const p = snap.docs[0].data();

  nameEl.textContent = p.name;
  periodEl.textContent = p.period || "";
  
  // АВТОМАТИЧНО ФОРМАТИРАНЕ
  descEl.innerHTML = autoFormatDescription(p.description || "");

  const birthText = formatDate(p.birthDay, p.birthMonth, p.birthYear);
  const deathText = formatDate(p.deathDay, p.deathMonth, p.deathYear);
  if (birthText || deathText) {
    datesEl.textContent = `${birthText || "?"} – ${deathText || "?"}`;
  }

  if (p.imageUrl) {
    heroBg.style.backgroundImage = `url('${p.imageUrl}')`;
  }

  // Анимация
  setTimeout(() => {
    observeSections();
  }, 100);
}

loadPerson();