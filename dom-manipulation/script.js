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
  createAddQuoteForm();
  fetchQuotesFromServer();
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
// REQUIRED: createAddQuoteForm()
// -------------------------
function createAddQuoteForm() {
  const container = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;

  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(btn);

  document.body.appendChild(container);
}

// -------------------------
// ADD NEW QUOTE + POST TO SERVER
// -------------------------
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill both fields.");

  const newQuote = { text, category };

  // Add locally
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  // -------------------------
  // REQUIRED POST REQUEST
  // -------------------------
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newQuote)
  });

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
// TASK 3: SERVER SYNC
// -------------------------

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// REQUIRED: fetchQuotesFromServer()
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 3).map(p => ({
      text: p.title,
      category: "Server"
    }));

    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
  } catch (err) {
    console.log("Error fetching server quotes:", err);
  }
}

// periodic syncing
setInterval(fetchQuotesFromServer, 20000);
