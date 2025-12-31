let display = document.getElementById("display");
let saveBtn = document.getElementById("savePatternBtn");
let modalOverlay = document.getElementById("modalOverlay");

let lastExpression = "";
let isDark = true;
let modalTemplate = "";

/* ================= BASIC ================= */
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
  let res = await eel.calculate(display.value)();
  display.value = res.result;
  saveBtn.hidden = false;
  loadHistory();
}

function toggleTheme() {
  document.body.classList.toggle("light");
  isDark = !isDark;
  document.querySelector(".theme-btn").innerText = isDark ? "🌙" : "☀️";
}

/* ================= DASHBOARD ================= */
function showHistory() {
  historyPanel.hidden = false;
  patternsPanel.hidden = true;
}

function showPatterns() {
  historyPanel.hidden = true;
  patternsPanel.hidden = false;
}

/* ================= HISTORY ================= */
async function loadHistory() {
  let history = await eel.load_history()();
  historyPanel.innerHTML = "";
  history.forEach(h => {
    let d = document.createElement("div");
    d.className = "item";
    d.innerText = `${h[1]} = ${h[2]}`;
    historyPanel.appendChild(d);
  });
}

/* ================= SAVE PATTERN ================= */
async function saveCurrentAsPattern() {
  await eel.save_as_pattern(lastExpression)();
  loadPatterns();
}

/* ================= PATTERNS ================= */
async function loadPatterns() {
  let patterns = await eel.load_patterns()();
  patternsPanel.innerHTML = "";

  patterns.forEach(p => {
    let template = p[1];
    let count = Number(p[2]);

    let d = document.createElement("div");
    d.className = "item";
    d.innerHTML = `
      ${template}
      <button onclick="usePattern('${template}', ${count})">Use</button>
    `;
    patternsPanel.appendChild(d);
  });
}

/* ================= MODAL ================= */
async function usePattern(template, count) {
  count = Number(count);

  if (count === 0) {
    let res = await eel.apply_pattern(template, {})();
    display.value = res;
    return;
  }

  modalTemplate = template;
  let inputs = document.getElementById("modalInputs");
  inputs.innerHTML = "";

  for (let i = 0; i < count; i++) {
    let key = String.fromCharCode(65 + i);
    let input = document.createElement("input");
    input.placeholder = `Value for ${key}`;
    input.dataset.key = key;
    inputs.appendChild(input);
  }

  modalOverlay.classList.add("show");   // ✅ ONLY HERE
}

function closeModal() {
  modalOverlay.classList.remove("show");
}

async function submitModal() {
  let values = {};
  document.querySelectorAll("#modalInputs input").forEach(inp => {
    values[inp.dataset.key] = inp.value;
  });

  let res = await eel.apply_pattern(modalTemplate, values)();
  display.value = res;
  closeModal();
}

/* ================= INIT ================= */
modalOverlay.classList.remove("show");  // ✅ FORCE CLOSED
loadHistory();
loadPatterns();
