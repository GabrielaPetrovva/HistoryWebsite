// js/app.js
import { addEvent, getEvents } from "./db.js";

// примерен запис
document.getElementById("addBtn")?.addEventListener("click", async () => {
  await addEvent({
    title: "Създаване на България",
    year: 681,
    description: "Аспарух създава българската държава",
    period: "Средновековие",
    createdAt: new Date()
  });
});

// зареждане
async function loadEvents() {
  const events = await getEvents();
  console.log(events);
}

loadEvents();