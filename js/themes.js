// ===============================
// THEMES FUNCTIONALITY (FIXED)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initThemeSearch();
  initPeriodFilter();
});

// ===============================
// SEARCH
// ===============================
function initThemeSearch() {
  const searchInput = document.getElementById("themeSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    filterThemes(
      searchInput.value.toLowerCase(),
      getCurrentPeriod()
    );
  });
}

// ===============================
// PERIOD FILTER
// ===============================
function initPeriodFilter() {
  const periodFilter = document.getElementById("periodFilter");
  if (!periodFilter) return;

  periodFilter.addEventListener("change", () => {
    const searchTerm =
      document.getElementById("themeSearch")?.value.toLowerCase() || "";
    filterThemes(searchTerm, periodFilter.value);
  });
}

// ===============================
// MAIN FILTER FUNCTION
// ===============================
function filterThemes(searchTerm, period) {
  const themeCards = document.querySelectorAll(".theme-card");
  let visibleCount = 0;

  themeCards.forEach(card => {
    const title = card
      .querySelector(".theme-title")
      ?.textContent.toLowerCase() || "";

    const description = card
      .querySelector(".theme-description")
      ?.textContent.toLowerCase() || "";

    const cardPeriod = card.dataset.period || "";

    const matchesSearch =
      !searchTerm ||
      title.includes(searchTerm) ||
      description.includes(searchTerm);

    const matchesPeriod =
      period === "all" || cardPeriod === period;

    if (matchesSearch && matchesPeriod) {
      card.style.display = "";
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.style.display = "none";
      card.classList.add("hidden");
    }
  });

  showNoResults(visibleCount === 0);
}

// ===============================
// NO RESULTS MESSAGE
// ===============================
function showNoResults(show) {
  let noResults = document.querySelector(".no-results");
  const grid = document.querySelector(".themes-grid");

  if (show) {
    if (!noResults && grid) {
      noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.innerHTML = `
        <h3>Няма намерени теми</h3>
        <p>Опитайте с други ключови думи</p>
      `;
      grid.appendChild(noResults);
    }
  } else {
    if (noResults) noResults.remove();
  }
}

// ===============================
// HELPERS
// ===============================
function getCurrentPeriod() {
  const periodFilter = document.getElementById("periodFilter");
  return periodFilter ? periodFilter.value : "all";
}