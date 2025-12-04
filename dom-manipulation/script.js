let quotes = [];
let lastViewed = null;

// ===== MOCK SERVER URL =====
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ========== FETCH FROM SERVER ==========
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Convert mock posts → quotes
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

  // Conflict resolution:
  serverQuotes.forEach(sq => {
    if (!localQuotes.some(lq => lq.id === sq.id)) {
      localQuotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem("quotes", JSON.stringify(localQuotes));
    showUpdateNotification();
  }

  quotes = localQuotes;
}

// ========== UPDATE NOTIFICATION ==========
function showUpdateNotification() {
  const box = document.createElement("div");
  box.textContent = "New quotes synced from server!";
  box.style.position = "fixed";
  box.style.top = "10px";
  box.style.right = "10px";
  box.style.background = "#4caf50";
  box.style.color = "white";
  box.style.padding = "10px";
  box.style.borderRadius = "5px";
  document.body.appendChild(box);

  setTimeout(() => box.remove(), 3000);
}

// ========== ADD QUOTE LOCALLY & POST TO MOCK SERVER ==========
async function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (!text || !category) return;

  const newQuote = {
    id: Date.now(),
    text,
    category
  };

  // Save locally
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // POST to mock server
  await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newQuote)
  });

  alert("Quote added!");
}

// ========== UI FORM CREATOR ==========
function createAddQuoteForm() {
  const container = document.createElement("div");

  const input1 = document.createElement("input");
  input1.id = "newQuoteText";
  input1.placeholder = "Enter quote";

  const input2 = document.createElement("input");
  input2.id = "newQuoteCategory";
  input2.placeholder = "Enter category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;

  container.appendChild(input1);
  container.appendChild(input2);
  container.appendChild(btn);

  document.body.appendChild(container);
}

// ========== DISPLAY & CATEGORY FUNCTIONS ==========
function displayQuote(q) {
  document.getElementById("quoteDisplay").textContent = q.text;
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const list = document.getElementById("categoryList");
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
setInterval(syncQuotes, 15000); // every 15 seconds

// ========== ON LOAD ==========
document.addEventListener("DOMContentLoaded", async () => {
  await syncQuotes();
  createAddQuoteForm();
  populateCategories();

  if (lastViewed) displayQuote(lastViewed);
});
