// -------------------------
// DEFAULT QUOTES
// -------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Peace begins with a smile.", category: "Life" },
  { text: "Code is like humor; when you have to explain it, it’s bad.", category: "Programming" },
  { text: "The purpose of life is to give it meaning.", category: "Life" }
];

// Save last viewed quote using SESSION STORAGE
let lastViewed = sessionStorage.getItem("lastViewedQuote");

// -------------------------
// INITIALIZE APP
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  if (lastViewed) displayQuote(lastViewed);
});

// -------------------------
// DOM ELEMENTS
// -------------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const filterSelect = document.getElementById("categoryFilter");
document.getElementById("newQuote").addEventListener("click", showRandomQuote);


// -------------------------
// DISPLAY QUOTE
// -------------------------
function displayQuote(text) {
  quoteDisplay.textContent = text;
  sessionStorage.setItem("lastViewedQuote", text);
}

// -------------------------
// SHOW RANDOM QUOTE
// -------------------------
function showRandomQuote() {
  let selected = filterSelect.value;
  let filtered = selected === "all" 
      ? quotes 
      : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    displayQuote("No quotes found in this category.");
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  displayQuote(randomQuote.text);
}

// -------------------------
// ADD NEW QUOTE
// -------------------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill both fields.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// -------------------------
// SAVE TO LOCAL STORAGE
// -------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------------
// POPULATE CATEGORY DROPDOWN
// -------------------------
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  filterSelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
  });

  let savedFilter = localStorage.getItem("selectedCategory") || "all";
  filterSelect.value = savedFilter;
}

// -------------------------
// FILTER QUOTES
// -------------------------
function filterQuotes() {
  localStorage.setItem("selectedCategory", filterSelect.value);
  showRandomQuote();
}

// -------------------------
// EXPORT TO JSON FILE
// -------------------------
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// -------------------------
// IMPORT JSON FILE
// -------------------------
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);

    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();

    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------------
// TASK 3: SIMULATED SERVER SYNC
// -------------------------

// Fake server endpoint (JSONPlaceholder style)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Periodically fetch server data every 20 seconds
setInterval(syncWithServer, 20000);

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulated server quotes (random 3 items)
    const serverQuotes = serverData.slice(0, 3).map(p => ({
      text: p.title,
      category: "Server"
    }));

    // CONFLICT RESOLUTION → SERVER WINS
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();

    alert("Server sync completed. Conflicts resolved using server data.");
  } catch (err) {
    console.log("Sync error:", err);
  }
}
