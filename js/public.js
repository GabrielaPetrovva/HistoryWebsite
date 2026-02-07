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
   HELPERS
================================ */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ===============================
   LOAD DATA
================================ */
async function loadPersons() {
  const snap = await getDocs(
    query(collection(db, "persons"), where("published", "==", true))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function loadEvents() {
  const snap = await getDocs(
    query(collection(db, "events"), where("published", "==", true))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ===============================
   INDEX.HTML – ARTICLES LIST
================================ */
async function renderIndex() {
  const list = document.getElementById("articlesList");
  if (!list) return;

  const events = await loadEvents();

  list.innerHTML = "";

  if (!events.length) {
    list.innerHTML = "<p>Няма публикувани статии.</p>";
    return;
  }

  events.forEach(a => {
    list.innerHTML += `
      <article>
        <h2>
          <a href="article.html?slug=${a.slug}">
            ${a.title}
          </a>
        </h2>
        <p>${(a.content || "").slice(0, 120)}...</p>
      </article>
    `;
  });
}

/* ===============================
   ARTICLE.HTML – SINGLE ARTICLE
================================ */
async function renderArticle() {
  const slug = getParam("slug");
  if (!slug) return;

  const titleEl = document.getElementById("articleTitle");
  const contentEl = document.getElementById("articleContent");
  const personEl = document.getElementById("relatedPersons");

  if (!titleEl || !contentEl) return;

  const events = await loadEvents();
  const persons = await loadPersons();

  const article = events.find(e => e.slug === slug);
  if (!article) {
    titleEl.textContent = "Статията не е намерена";
    return;
  }

  titleEl.textContent = article.title;
  contentEl.textContent = article.content;

  if (personEl && article.figure) {
    const person = persons.find(p => p.id === article.figure);
    if (person) {
      personEl.innerHTML = `
        <h3>Личност</h3>
        <a href="person.html?slug=${person.slug}">
          ${person.name}
        </a>
      `;
    }
  }
}

/* ===============================
   PERSON.HTML – SINGLE PERSON
================================ */
async function renderPerson() {
  const slug = getParam("slug");
  if (!slug) return;

  const nameEl = document.getElementById("personName");
  const descEl = document.getElementById("personDescription");
  const articlesEl = document.getElementById("personArticles");

  if (!nameEl || !descEl) return;

  const persons = await loadPersons();
  const events = await loadEvents();

  const person = persons.find(p => p.slug === slug);
  if (!person) {
    nameEl.textContent = "Личността не е намерена";
    return;
  }

  nameEl.textContent = person.name;
  descEl.textContent = person.description || "";

  if (articlesEl) {
    const related = events.filter(e => e.figure === person.id);
    articlesEl.innerHTML = "<h3>Свързани статии</h3>";

    if (!related.length) {
      articlesEl.innerHTML += "<p>Няма статии.</p>";
      return;
    }

    related.forEach(a => {
      articlesEl.innerHTML += `
        <a href="article.html?slug=${a.slug}">
          ${a.title}
        </a><br>
      `;
    });
  }
}

/* ===============================
   INIT
================================ */
renderIndex();
renderArticle();
renderPerson();