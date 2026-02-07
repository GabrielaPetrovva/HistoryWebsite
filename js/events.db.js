import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getEvents() {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addEvent(data) {
  await addDoc(collection(db, "events"), data);
}

export async function updateEvent(id, data) {
  await updateDoc(doc(db, "events", id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}