// js/db.js
/* ===============================
   FIREBASE + FIRESTORE
================================ */
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   EVENTS CRUD
================================ */

// ➕ CREATE EVENT
export async function addEvent(data) {
  await addDoc(collection(db, "events"), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// 📖 READ EVENTS (ALL, SORTED)
export async function getEvents() {
  const q = query(
    collection(db, "events"),
    orderBy("year", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// ✏️ UPDATE EVENT
export async function updateEvent(id, data) {
  const ref = doc(db, "events", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date()
  });
}

// 🗑️ DELETE EVENT
export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}