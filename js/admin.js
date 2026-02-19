import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= STATE ================= */
let persons = [];
let editingPersonId = null;
let editingArticleId = null;

/* ================= SMART FORMATTING HELPERS ================= */

/**
 * Интелигентно форматиране на текст в HTML
 * Автоматично разпознава:
 * - Подзаглавия (кратки редове, може би с главни букви или удебеление)
 * - Параграфи (отделени с празни редове)
 * - Списъци (започват с цифра, тире или булет)
 */
function smartFormatContent(text) {
  if (!text || !text.trim()) return '';
  
  // Почистване на текста
  let cleaned = text
    .replace(/\r\n/g, '\n')  // Windows нови редове
    .replace(/\r/g, '\n')    // Old Mac нови редове
    .trim();
  
  // Разделяме на блокове (параграфи отделени с празни редове)
  const blocks = cleaned.split(/\n\s*\n/);
  
  const htmlBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    
    // Проверка дали е подзаглавие
    if (isHeading(trimmed)) {
      return formatAsHeading(trimmed);
    }
    
    // Проверка дали е списък
    if (isList(trimmed)) {
      return formatAsList(trimmed);
    }
    
    // Обикновен параграф
    return formatAsParagraph(trimmed);
  });
  
  return htmlBlocks.filter(Boolean).join('\n\n');
}

/**
 * Проверява дали блок текст е подзаглавие
 */
function isHeading(text) {
  const lines = text.split('\n');
  
  // Само един ред
  if (lines.length > 1) return false;
  
  const line = text.trim();
  
  // Критерии за подзаглавие:
  // 1. Къс текст (до 100 символа)
  // 2. Няма точка в края ИЛИ започва с цифра и точка (1. Заглавие)
  // 3. Може да е с ГЛАВНИ БУКВИ или да започва с главна буква
  
  if (line.length > 100) return false;
  
  // Започва с цифра и точка: "1. Заглавие" или "I. Заглавие"
  if (/^[IVX0-9]+\.\s+/.test(line)) return true;
  
  // Започва с ## (Markdown стил)
  if (line.startsWith('##')) return true;
  
  // Всички главни букви (поне 3 думи)
  const words = line.replace(/[^а-яА-Я\s]/g, '').split(/\s+/).filter(Boolean);
  const upperCaseWords = words.filter(w => w === w.toUpperCase() && w.length > 1);
  if (upperCaseWords.length >= 2 && upperCaseWords.length === words.length) {
    return true;
  }
  
  // Къс текст БЕЗ точка в края (вероятно заглавие)
  if (line.length <= 60 && !line.endsWith('.') && !line.endsWith(',')) {
    // Проверка дали изглежда като заглавие (започва с главна буква)
    if (/^[А-ЯA-Z]/.test(line)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Форматира текст като подзаглавие
 */
function formatAsHeading(text) {
  let cleaned = text
    .replace(/^##\s*/, '')  // Премахва ## ако има
    .replace(/^[IVX0-9]+\.\s*/, '')  // Премахва номерация
    .trim();
  
  return `<h2 class="section-title">${cleaned}</h2>`;
}

/**
 * Проверява дали блок текст е списък
 */
function isList(text) {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return false;
  
  // Проверка дали повечето редове започват с маркер за списък
  const listLines = lines.filter(line => {
    const trimmed = line.trim();
    return /^[-•*]\s+/.test(trimmed) ||  // Булети: -, •, *
           /^[0-9]+\.\s+/.test(trimmed);  // Номерирани: 1., 2., 3.
  });
  
  return listLines.length >= lines.length * 0.7; // 70% от редовете са списък
}

/**
 * Форматира като списък (ul или ol)
 */
function formatAsList(text) {
  const lines = text.split('\n').filter(Boolean);
  
  // Проверка дали е номериран списък
  const isOrdered = /^[0-9]+\.\s+/.test(lines[0].trim());
  
  const listItems = lines.map(line => {
    let content = line
      .replace(/^[-•*]\s+/, '')    // Премахва буллети
      .replace(/^[0-9]+\.\s+/, '') // Премахва номерация
      .trim();
    return `  <li>${content}</li>`;
  }).join('\n');
  
  if (isOrdered) {
    return `<ol class="article-list">\n${listItems}\n</ol>`;
  } else {
    return `<ul class="article-list">\n${listItems}\n</ul>`;
  }
}

/**
 * Форматира като параграф
 */
function formatAsParagraph(text) {
  // Заменяме единични нови редове с интервали
  const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return `<p class="article-text">${cleaned}</p>`;
}

/**
 * Конвертира HTML обратно в обикновен текст за редактиране
 */
function htmlToPlainText(html) {
  if (!html) return '';
  
  return html
    .replace(/<h2[^>]*>/gi, '\n\n')
    .replace(/<\/h2>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?[uo]l[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}

/* ================= ORIGINAL HELPERS ================= */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeDateParts(day, month, year) {
  if (day !== null && (day < 1 || day > 31)) day = null;
  if (month !== null && (month < 1 || month > 12)) month = null;
  if (year !== null && year < 0) year = null;
  return { day, month, year };
}

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function parseDateInput(value) {
  const cleaned = value.trim();
  if (!cleaned) return { day: null, month: null, year: null };

  const parts = cleaned.split(/[.\-\/\s]+/).filter(Boolean);
  let day = null;
  let month = null;
  let year = null;

  if (parts.length === 1) {
    year = toInt(parts[0]);
  } else if (parts.length === 2) {
    const a = toInt(parts[0]);
    const b = toInt(parts[1]);

    if (String(parts[0]).length === 4) {
      year = a;
      month = b;
    } else if (String(parts[1]).length === 4) {
      year = b;
      if (a !== null && a <= 12) {
        month = a;
      } else {
        day = a;
      }
    } else {
      day = a;
      month = b;
    }
  } else {
    if (String(parts[0]).length === 4) {
      year = toInt(parts[0]);
      month = toInt(parts[1]);
      day = toInt(parts[2]);
    } else {
      day = toInt(parts[0]);
      month = toInt(parts[1]);
      year = toInt(parts[2]);
    }
  }

  return normalizeDateParts(day, month, year);
}

function formatDateForInput(day, month, year) {
  if (!day && !month && !year) return "";

  const d = day ? String(day).padStart(2, "0") : "";
  const m = month ? String(month).padStart(2, "0") : "";

  if (year) {
    if (d && m) return `${d}.${m}.${year}`;
    if (m) return `${m}.${year}`;
    if (d) return `${d}.${year}`;
    return `${year}`;
  }

  if (d && m) return `${d}.${m}`;
  if (m) return `${m}`;
  return `${d}`;
}

/* ================= NAV ================= */
document.querySelectorAll(".admin-nav-links a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    window.showView(link.dataset.view);
  });
});

window.showView = function (view) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  const target = document.getElementById(view + "-view");
  if (target) target.classList.remove("hidden");
};

/* ================= ARTICLE EDIT MODAL ================= */
const articleFormView = document.getElementById("article-form-view");
const editArticleModal = document.getElementById("edit-article-modal");
const editArticleModalContent = document.getElementById("edit-article-modal-content");
const personFormSection = document.getElementById("person-form-section");
const editPersonModal = document.getElementById("edit-person-modal");
const editPersonModalContent = document.getElementById("edit-person-modal-content");

let articleFormHome = null;
let articleFormHomeNext = null;
let personFormHome = null;
let personFormHomeNext = null;

function storeArticleFormHome() {
  if (!articleFormView || articleFormHome) return;
  articleFormHome = articleFormView.parentElement;
  articleFormHomeNext = articleFormView.nextElementSibling;
}

function attachArticleFormToModal() {
  if (!articleFormView || !editArticleModalContent) return;
  storeArticleFormHome();
  editArticleModalContent.appendChild(articleFormView);
  articleFormView.classList.remove("hidden");
}

function detachArticleFormFromModal() {
  if (!articleFormView || !articleFormHome) return;
  if (articleFormHomeNext && articleFormHomeNext.parentElement === articleFormHome) {
    articleFormHome.insertBefore(articleFormView, articleFormHomeNext);
  } else {
    articleFormHome.appendChild(articleFormView);
  }
}

function storePersonFormHome() {
  if (!personFormSection || personFormHome) return;
  personFormHome = personFormSection.parentElement;
  personFormHomeNext = personFormSection.nextElementSibling;
}

function attachPersonFormToModal() {
  if (!personFormSection || !editPersonModalContent) return;
  storePersonFormHome();
  editPersonModalContent.appendChild(personFormSection);
}

function detachPersonFormFromModal() {
  if (!personFormSection || !personFormHome) return;
  if (personFormHomeNext && personFormHomeNext.parentElement === personFormHome) {
    personFormHome.insertBefore(personFormSection, personFormHomeNext);
  } else {
    personFormHome.appendChild(personFormSection);
  }
}

window.openArticleEditModal = function () {
  if (!editArticleModal) return;
  attachArticleFormToModal();
  editArticleModal.classList.add("active");
};

window.closeArticleEditModal = function () {
  if (!editArticleModal) return;
  editArticleModal.classList.remove("active");
  detachArticleFormFromModal();
  if (articleFormView) articleFormView.classList.add("hidden");
};

window.openPersonEditModal = function () {
  if (!editPersonModal) return;
  attachPersonFormToModal();
  editPersonModal.classList.add("active");
};

window.closePersonEditModal = function () {
  if (!editPersonModal) return;
  editPersonModal.classList.remove("active");
  detachPersonFormFromModal();
};

window.cancelArticleForm = function () {
  window.closeArticleEditModal();
  window.showView("articles");
};

window.cancelPersonForm = function () {
  window.resetPerson();
  window.closePersonEditModal();
};

if (editArticleModal) {
  editArticleModal.addEventListener("click", e => {
    if (e.target === editArticleModal) window.closeArticleEditModal();
  });
}

if (editPersonModal) {
  editPersonModal.addEventListener("click", e => {
    if (e.target === editPersonModal) window.closePersonEditModal();
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && editArticleModal?.classList.contains("active")) {
    window.closeArticleEditModal();
  }
  if (e.key === "Escape" && editPersonModal?.classList.contains("active")) {
    window.closePersonEditModal();
  }
});

/* ================= PERSONS ================= */
async function loadPersons() {
  const snap = await getDocs(collection(db, "persons"));
  persons = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  document.getElementById("stat-persons").textContent = persons.length;
  renderPersons();
  populatePersonsSelect();
}

function renderPersons() {
  const list = document.getElementById("persons-list");
  list.innerHTML = "";

  persons.forEach(p => {
    list.innerHTML += `
      <div class="article-item">
        <div class="article-info">
          <div class="article-title">${p.name}</div>
        </div>
        <div class="article-actions">
          <button class="btn-icon" onclick="editPerson('${p.id}')">✎</button>
          <button class="btn-icon" onclick="openDeleteModal('persons','${p.id}')">🗑</button>
        </div>
      </div>
    `;
  });
}

function populatePersonsSelect() {
  const select = document.getElementById("article-figure");
  select.innerHTML = `<option value="">Избери личност</option>`;

  persons.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
}

/* ================= IMAGE PREVIEW ================= */
const urlInput = document.getElementById("person-image");
const fileInput = document.getElementById("person-image-file");
const previewImg = document.getElementById("person-image-preview");

async function updateImagePreview() {
  if (urlInput.value.trim()) {
    previewImg.src = urlInput.value.trim();
    previewImg.style.display = "block";
    return;
  }

  if (fileInput.files[0]) {
    const base64 = await fileToBase64(fileInput.files[0]);
    previewImg.src = base64;
    previewImg.style.display = "block";
    return;
  }

  previewImg.style.display = "none";
}

urlInput.addEventListener("input", updateImagePreview);
fileInput.addEventListener("change", updateImagePreview);

/* ================= SAVE PERSON ================= */
window.savePerson = async function () {
  const wasEditing = Boolean(editingPersonId);
  const name = document.getElementById("person-name").value.trim();
  const slug = document.getElementById("person-slug").value.trim();

  if (!name || !slug) {
    alert("Име и slug са задължителни");
    return;
  }

  let finalImage = "";

  if (urlInput.value.trim()) {
    finalImage = urlInput.value.trim();
  } else if (fileInput.files[0]) {
    finalImage = await fileToBase64(fileInput.files[0]);
  }

  const birthInput = document.getElementById("person-birth-date").value;
  const deathInput = document.getElementById("person-death-date").value;
  const birth = parseDateInput(birthInput);
  const death = parseDateInput(deathInput);

  const data = {
    name,
    slug,
    birthDay: birth.day,
    birthMonth: birth.month,
    birthYear: birth.year,
    deathDay: death.day,
    deathMonth: death.month,
    deathYear: death.year,
    imageUrl: finalImage,
    description: document.getElementById("person-description").value.trim(),
    published: true,
    updatedAt: Timestamp.now()
  };

  if (editingPersonId) {
    await updateDoc(doc(db, "persons", editingPersonId), data);
  } else {
    await addDoc(collection(db, "persons"), {
      ...data,
      createdAt: Timestamp.now()
    });
  }

  if (wasEditing) window.closePersonEditModal();
  window.resetPerson();
  loadPersons();
};

window.editPerson = function (id) {
  const p = persons.find(x => x.id === id);
  if (!p) return;

  editingPersonId = id;

  document.getElementById("person-name").value = p.name || "";
  document.getElementById("person-slug").value = p.slug || "";
  document.getElementById("person-birth-date").value =
    formatDateForInput(p.birthDay, p.birthMonth, p.birthYear);
  document.getElementById("person-death-date").value =
    formatDateForInput(p.deathDay, p.deathMonth, p.deathYear);
  urlInput.value = p.imageUrl || "";
  fileInput.value = "";
  document.getElementById("person-description").value = p.description || "";

  updateImagePreview();
  window.openPersonEditModal();
};

window.resetPerson = function () {
  editingPersonId = null;
  [
    "person-name",
    "person-slug",
    "person-birth-date",
    "person-death-date",
    "person-image",
    "person-description"
  ].forEach(id => document.getElementById(id).value = "");

  fileInput.value = "";
  previewImg.style.display = "none";
};

/* ================= ARTICLES ================= */
async function loadArticles() {
  const snap = await getDocs(collection(db, "events"));
  const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  document.getElementById("stat-published").textContent =
    articles.filter(a => a.published).length;

  document.getElementById("stat-drafts").textContent =
    articles.filter(a => !a.published).length;

  renderArticles(articles);
}

function renderArticles(articles) {
  const list = document.getElementById("articles-list");
  list.innerHTML = "";

  articles.forEach(a => {
    const person = persons.find(p => p.id === a.figure)?.name || "—";

    list.innerHTML += `
      <div class="article-item">
        <div class="article-info">
          <div class="article-title">${a.title}</div>
          <div class="article-meta">
            <span>${a.published ? "Публикувана" : "Чернова"}</span>
            <span>${person}</span>
          </div>
        </div>
        <div class="article-actions">
          <button class="btn-icon" onclick="editArticle('${a.id}')">✎</button>
          <button class="btn-icon" onclick="openDeleteModal('events','${a.id}')">🗑</button>
        </div>
      </div>
    `;
  });
}

window.openArticleForm = function () {
  window.closeArticleEditModal();
  editingArticleId = null;
  document.getElementById("article-title").value = "";
  document.getElementById("article-slug").value = "";
  document.getElementById("article-figure").value = "";
  document.getElementById("article-content").value = "";
  window.showView("article-form");
};

window.saveDraft = () => saveArticle(false);
window.publishArticle = () => saveArticle(true);

async function saveArticle(published) {
  const title = document.getElementById("article-title").value.trim();
  const slugInput = document.getElementById("article-slug").value.trim();
  const figure = document.getElementById("article-figure").value;
  const rawContent = document.getElementById("article-content").value.trim();

  if (!title || !figure || !rawContent) {
    alert("Всички полета са задължителни");
    return;
  }

  const finalSlug = slugInput ? slugify(slugInput) : slugify(title);
  
  // 🔥 ИНТЕЛИГЕНТНО ФОРМАТИРАНЕ - автоматично разпознава структурата
  const formattedContent = smartFormatContent(rawContent);

  const data = {
    title,
    slug: finalSlug,
    figure,
    content: formattedContent,
    published,
    updatedAt: Timestamp.now()
  };

  if (editingArticleId) {
    await updateDoc(doc(db, "events", editingArticleId), data);
  } else {
    await addDoc(collection(db, "events"), {
      ...data,
      createdAt: Timestamp.now()
    });
  }

  window.closeArticleEditModal();
  window.showView("articles");
  loadArticles();
}

window.editArticle = async function (id) {
  const snap = await getDoc(doc(db, "events", id));
  if (!snap.exists()) return;

  const a = snap.data();
  editingArticleId = id;

  document.getElementById("article-title").value = a.title;
  document.getElementById("article-slug").value = a.slug || "";
  document.getElementById("article-figure").value = a.figure;
  
  // Конвертираме HTML обратно в обикновен текст за textarea
  document.getElementById("article-content").value = htmlToPlainText(a.content);

  window.openArticleEditModal();
};

/* ================= DELETE ================= */
const deleteModal = document.getElementById("delete-modal");
const deleteText = document.getElementById("delete-text");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

window.openDeleteModal = function (collectionName, id) {
  deleteModal.dataset.collection = collectionName;
  deleteModal.dataset.id = id;

  deleteText.textContent =
    collectionName === "persons"
      ? "Да изтрия ли тази личност?"
      : "Да изтрия ли тази статия?";

  deleteModal.classList.add("active");
};

confirmDeleteBtn.addEventListener("click", async () => {
  await deleteDoc(doc(db,
    deleteModal.dataset.collection,
    deleteModal.dataset.id
  ));

  deleteModal.classList.remove("active");
  loadPersons();
  loadArticles();
});

window.closeDelete = function () {
  deleteModal.classList.remove("active");
};

/* ================= INIT ================= */
loadPersons().then(loadArticles);