import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   GET SLUG FROM URL
================================ */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.body.innerHTML = "<p>Няма избрана статия.</p>";
  throw new Error("Missing slug");
}

/* ===============================
   LOAD ARTICLE
================================ */
async function loadArticle() {
  const q = query(
    collection(db, "events"),
    where("slug", "==", slug),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    document.body.innerHTML = "<p>Статията не е намерена.</p>";
    return;
  }

  const article = snap.docs[0].data();

  const titleEl = document.getElementById("article-title");
  const contentEl = document.getElementById("article-content");

  titleEl.textContent = article.title;
  contentEl.innerHTML = article.content.replace(/\n/g, "<br>");
}

/* ===============================
   INIT
================================ */
loadArticle();