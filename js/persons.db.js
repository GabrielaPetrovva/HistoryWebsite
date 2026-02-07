import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* GET ALL PERSONS */
export async function getPersons() {
  const snap = await getDocs(collection(db, "persons"));
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

/* ADD PERSON */
export async function addPerson(data) {
  await addDoc(collection(db, "persons"), {
    ...data,
    published: data.published ?? true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
}

/* UPDATE PERSON */
export async function updatePerson(id, data) {
  await updateDoc(doc(db, "persons", id), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

/* DELETE PERSON */
export async function deletePerson(id) {
  await deleteDoc(doc(db, "persons", id));
}