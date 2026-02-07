// js/main.js

// === МОБИЛНО МЕНЮ ===
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", e => {
      e.stopPropagation();
      navLinks.classList.toggle("active");
    });

    // Затваряне при клик извън менюто
    document.addEventListener("click", e => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("active");
      }
    });
  }
});

// === SCROLL ANIMATIONS ===
document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(
      ".article-section, .figure-item, .timeline-event, .cta-card"
    )
    .forEach(el => observer.observe(el));
});

// === ПЛАВЕН СКРОЛ ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
});

// === ИНТЕРАКТИВНОСТ НА ТЪРСАЧКАТА ===
function initSearchBox() {
  const searchBox = document.querySelector(".search-box");
  if (!searchBox || !searchBox.parentElement) return;

  searchBox.addEventListener("focus", () => {
    searchBox.parentElement.style.transform = "scale(1.02)";
  });

  searchBox.addEventListener("blur", () => {
    searchBox.parentElement.style.transform = "scale(1)";
  });
}

// === ГЛАВНА ТЪРСАЧКА ===
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box");
  if (!searchBox) return;

  initSearchBox();

  // Enter → redirect към каталог
  searchBox.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const term = e.target.value.trim();
      if (term.length >= 2) {
        window.location.href = `html/catalog.html?search=${encodeURIComponent(
          term
        )}`;
      }
    }
  });

  // Input (placeholder за бъдещи suggestions)
  searchBox.addEventListener("input", e => {
    if (typeof handleMainSearch === "function") {
      handleMainSearch(e.target.value.toLowerCase());
    }
  });
});