// ===============================
// TIMELINE FUNCTIONALITY (FIXED)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initTimelineAnimations();
  initTimelineFilters();
  initEventExpansion();
});

// ===============================
// SCROLL ANIMATIONS
// ===============================
function initTimelineAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".timeline-event").forEach(event => {
    observer.observe(event);
  });
}

// ===============================
// FILTERS BY CATEGORY
// ===============================
function initTimelineFilters() {
  const buttons = document.querySelectorAll(".timeline-filter-btn");
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      filterByCategory(category);
    });
  });
}

// ===============================
// FILTER LOGIC
// ===============================
function filterByCategory(category) {
  const events = document.querySelectorAll(".timeline-event");

  events.forEach(event => {
    const eventCategory = event.dataset.category;

    if (category === "all" || eventCategory === category) {
      event.style.display = "";
      event.classList.remove("hidden");
    } else {
      event.style.display = "none";
      event.classList.add("hidden");
    }
  });
}

// ===============================
// EXPAND / COLLAPSE EVENTS
// ===============================
function initEventExpansion() {
  const contents = document.querySelectorAll(".event-content");

  contents.forEach(content => {
    content.addEventListener("click", () => {
      content.classList.toggle("expanded");
    });
  });
}