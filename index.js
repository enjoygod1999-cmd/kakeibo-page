const STORAGE_KEY = "kakeiboEntries";
const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const form = document.querySelector("#entry-form");
const tableBody = document.querySelector("#ledger-entries");
const totalElement = document.querySelector("#balance-total");

function isEntry(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.date === "string" &&
    typeof value.item === "string" &&
    (value.type === "支出" || value.type === "収入") &&
    Number.isFinite(value.amount) &&
    value.amount > 0
  );
}

function loadEntries() {
  try {
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    if (!savedEntries) return [];

    const entries = JSON.parse(savedEntries);
    return Array.isArray(entries) ? entries.filter(isEntry) : [];
  } catch {
    return [];
  }
}

let entries = loadEntries();

function renderEntries() {
  tableBody.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "登録データはありません";
    row.append(cell);
    tableBody.append(row);
  } else {
    for (const entry of entries) {
      const row = document.createElement("tr");
      const values = [
        entry.date,
        entry.item,
        entry.type,
        currencyFormatter.format(entry.amount),
      ];

      for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }

      tableBody.append(row);
    }
  }

  const balance = entries.reduce(
    (total, entry) => total + (entry.type === "収入" ? entry.amount : -entry.amount),
    0,
  );
  totalElement.textContent = currencyFormatter.format(balance);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const entry = {
    date: formData.get("date").trim(),
    item: formData.get("item").trim(),
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
  };

  if (!entry.date || !entry.item || !Number.isFinite(entry.amount) || entry.amount <= 0) {
    window.alert("日付・品目・金額を正しく入力してください。");
    return;
  }

  const updatedEntries = [...entries, entry];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch {
    window.alert("データを保存できませんでした。ブラウザーの保存設定を確認してください。");
    return;
  }

  entries = updatedEntries;
  renderEntries();
  form.reset();
});

renderEntries();
