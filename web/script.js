// ================= DOM BINDINGS =================
const display = document.getElementById("display");
const saveBtn = document.getElementById("savePatternBtn");
const modalOverlay = document.getElementById("modalOverlay");

const historyPanel = document.getElementById("historyPanel");
const patternsPanel = document.getElementById("patternsPanel");

// ================= STATE =================
let lastExpression = "";
let modalMode = "";
let modalTemplate = "";
let isDark = true;

// ================= BASIC CALCULATOR =================
function add(v) {
  display.value += v;
}

function clearDisplay() {
  display.value = "";
  saveBtn.hidden = true;
}

function del() {
  display.value = display.value.slice(0, -1);
}

async function calculate() {
  lastExpression = display.value;

  const res = await eel.calculate(display.value)();
  display.value = res.result;

  saveBtn.hidden = false;
  loadHistory();   // 🔥 refresh UI
}

// ================= THEME =================
function toggleTheme() {
  document.body.classList.toggle("light");
  isDark = !isDark;
  document.querySelector(".theme-btn").innerText = isDark ? "🌙" : "☀️";
}

// ================= DASHBOARD =================
function showHistory() {
  historyPanel.hidden = false;
  patternsPanel.hidden = true;
}

function showPatterns() {
  historyPanel.hidden = true;
  patternsPanel.hidden = false;
}

// ================= HISTORY =================
async function loadHistory() {
  const history = await eel.load_history()();
  historyPanel.innerHTML = "";

  history.forEach(h => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = `${h[1]} = ${h[2]}`;
    historyPanel.appendChild(div);
  });
}

// ================= SAVE PATTERN =================
function saveCurrentAsPattern() {
  modalMode = "name";

  const inputs = document.getElementById("modalInputs");
  inputs.innerHTML = "";

  document.getElementById("modalTitle").innerText = "Name Your Pattern";

  const input = document.createElement("input");
  input.id = "patternName";
  input.placeholder = "Pattern name (e.g. Billing Formula)";
  inputs.appendChild(input);

  modalOverlay.classList.add("show");
}

// ================= PATTERNS =================
async function loadPatterns() {
  const patterns = await eel.load_patterns()();
  patternsPanel.innerHTML = "";

  patterns.forEach(p => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${p[1]}</strong><br>
      ${p[2]}
      <button onclick="usePattern('${p[2]}', ${p[3]})">Use</button>
    `;
    patternsPanel.appendChild(div);
  });
}

// ================= MODAL =================
async function submitModal() {
  if (modalMode === "name") {
    const name = document.getElementById("patternName").value.trim();
    if (!name) {
      alert("Pattern name is required");
      return;
    }

    await eel.save_named_pattern(name, lastExpression)();
    closeModal();
    loadPatterns();   // 🔥 refresh UI
    return;
  }

  if (modalMode === "use") {
    const values = {};
    document.querySelectorAll("#modalInputs input").forEach(inp => {
      values[inp.dataset.key] = inp.value;
    });

    const res = await eel.apply_pattern(modalTemplate, values)();
    display.value = res;
    closeModal();
  }
}

function usePattern(template, count) {
  count = Number(count);

  if (count === 0) {
    eel.apply_pattern(template, {}).then(r => display.value = r);
    return;
  }

  modalMode = "use";
  modalTemplate = template;

  const inputs = document.getElementById("modalInputs");
  inputs.innerHTML = "";

  document.getElementById("modalTitle").innerText = "Enter Values";

  for (let i = 0; i < count; i++) {
    const key = String.fromCharCode(65 + i);
    const input = document.createElement("input");
    input.placeholder = `Value for ${key}`;
    input.dataset.key = key;
    inputs.appendChild(input);
  }

  modalOverlay.classList.add("show");
}

function closeModal() {
  modalOverlay.classList.remove("show");
}

// ================= INIT =================
loadHistory();
loadPatterns();
