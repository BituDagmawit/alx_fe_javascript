let quotes = [];
let lastViewed = null;
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ========== FETCH FROM SERVER ==========
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.slice(0, 10).map(item => ({
      text: item.title,
      category: "Server",
      id: item.id
    }));
  } catch (err) {
    console.error("Server fetch failed", err);
    return [];
  }
}

// ========== SYNC QUOTES ==========
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  let updated = false;

  serverQuotes.forEach(sq => {
    if (!localQuotes.some(lq => lq.id === sq.id)) {
      localQuotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("quotes", JSON.stringify(localQuotes));
    showUpdateNotification(); // show UI notification
  }

  quotes = localQuotes;
}

// ========== UI NOTIFICATION ==========
function showUpdateNotification() {
  const box = document.createElement("div");
  box.textContent = "Quotes synced with server!";
  box.style.position = "fixed";
  box.style.top = "10px";
  box.style.right = "10px";
  box.style.background = "#4caf50";
  box.style.color = "#fff";
  box.style.padding = "10px 15px";
  box.style.borderRadius = "5px";
  box.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  document.body.appendChild(box);

  setTimeout(() => box.remove(), 3000);
}

// ========== ADD QUOTE LOCALLY & POST TO SERVER ==========
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill both fields.");

  const newQuote = { id: Date.now(), text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));

  await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newQuote)
  });

  alert("Quote added!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ========== CREATE ADD QUOTE FORM ==========
function createAddQuoteForm() {
  const container = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter quote";

  const inputCategory = document.createElement("input");
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

// ========== DISPLAY & CATEGORY ==========
function displayQuote(q) {
  document.getElementById("quoteDisplay").textContent = q.text;
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const list = document.getElementById("categoryList");
  if (!list) return;
  list.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => {
      const q = quotes.find(q => q.category === cat);
      displayQuote(q);
    };
    list.appendChild(btn);
  });
}

// ========== PERIODIC SERVER CHECK ==========
setInterval(syncQuotes, 15000); // every 15s

// ========== ON LOAD ==========
document.addEventListener("DOMContentLoaded", async () => {
  await syncQuotes();
  createAddQuoteForm();
  populateCategories();

  if (lastViewed) displayQuote(lastViewed);
});
