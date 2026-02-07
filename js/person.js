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
  descEl.innerHTML = p.description || "";

  const birthText = formatDate(p.birthDay, p.birthMonth, p.birthYear);
  const deathText = formatDate(p.deathDay, p.deathMonth, p.deathYear);
  if (birthText || deathText) {
    datesEl.textContent = `${birthText || "?"} – ${deathText || "?"}`;
  }

  if (p.imageUrl) {
    heroBg.style.backgroundImage = `url('${p.imageUrl}')`;
  }
}

loadPerson();
