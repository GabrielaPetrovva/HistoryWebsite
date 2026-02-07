// js/index.js
/* ===============================
   FIREBASE
================================ */
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   FEATURED PERSON
================================ */
async function loadFeaturedPerson() {
  const box = document.getElementById("featuredPerson");
  if (!box) return;

  const q = query(
    collection(db, "persons"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    box.innerHTML = "<p>Няма налични личности.</p>";
    return;
  }

  const p = snap.docs[0].data();

  box.innerHTML = `
    <h3>Започни с ${p.name}</h3>
    <p>${(p.description || "").slice(0, 220)}...</p>
    <a href="html/person.html?slug=${p.slug}" class="cta-button">
      Прочети историята →
    </a>
  `;
}

/* ===============================
   LATEST ARTICLES  ✅ ПОПРАВЕНО
================================ */
async function loadLatestArticles() {
  const grid = document.getElementById("latestArticles");
  if (!grid) return;

  grid.innerHTML = "";

  // ❗ не режем със where, за да няма празно
  const q = query(
    collection(db, "events"),
    orderBy("createdAt", "desc"),
    limit(3)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    grid.innerHTML = "<p>Няма публикувани статии.</p>";
    return;
  }

  snap.docs.forEach(docSnap => {
    const a = docSnap.data();

    // ако няма published → пак показваме
    if (a.published === false) return;

    grid.innerHTML += `
      <article class="article-card">
        <h4>${a.title}</h4>
        <p>${(a.content || "").slice(0, 120)}...</p>
        <a href="html/article.html?slug=${a.slug}">
          Прочети →
        </a>
      </article>
    `;
  });
}

/* ===============================
   INIT
================================ */
loadFeaturedPerson();
loadLatestArticles();