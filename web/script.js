// ================= DOM =================
const display = document.getElementById("display");
const saveBtn = document.getElementById("savePatternBtn");
const modalOverlay = document.getElementById("modalOverlay");

const historyPanel = document.getElementById("historyPanel");
const patternsPanel = document.getElementById("patternsPanel");

const historySearch = document.getElementById("historySearch");
const patternsSearch = document.getElementById("patternsSearch");

// ================= STATE =================
let lastExpression = "";
let modalMode = "";
let modalTemplate = "";
let isDark = true;

let historyCache = [];
let patternsCache = [];

// ================= CALCULATOR =================
function add(v){ display.value += v; }
function clearDisplay(){ display.value=""; saveBtn.hidden=true; }
function del(){ display.value = display.value.slice(0,-1); }

async function calculate(){
  lastExpression = display.value;
  const res = await eel.calculate(display.value)();
  display.value = res.result;
  saveBtn.hidden = false;
  loadHistory();
}

// ================= THEME =================
function toggleTheme(){
  document.body.classList.toggle("light");
  isDark = !isDark;
  document.querySelector(".theme-btn").innerText = isDark ? "🌙" : "☀️";
}

// ================= DASHBOARD =================
function showHistory(){
  historyPanel.hidden = false;
  patternsPanel.hidden = true;
  historySearch.hidden = false;
  patternsSearch.hidden = true;
}

function showPatterns(){
  historyPanel.hidden = true;
  patternsPanel.hidden = false;
  historySearch.hidden = true;
  patternsSearch.hidden = false;
}

// ================= HISTORY =================
async function loadHistory(){
  historyCache = await eel.load_history()();
  renderHistory(historyCache);
}

function renderHistory(data){
  historyPanel.innerHTML = "";
  data.forEach(h=>{
    const d = document.createElement("div");
    d.className="item";
    d.innerText = `${h[1]} = ${h[2]}`;
    historyPanel.appendChild(d);
  });
}

function filterHistory(){
  const q = historySearch.value.toLowerCase();
  renderHistory(
    historyCache.filter(h =>
      h[1].toLowerCase().includes(q) ||
      h[2].toLowerCase().includes(q)
    )
  );
}

// ================= SAVE PATTERN =================
function saveCurrentAsPattern(){
  modalMode = "name";
  document.getElementById("modalTitle").innerText = "Name Your Pattern";
  const inputs = document.getElementById("modalInputs");
  inputs.innerHTML = "";

  const inp = document.createElement("input");
  inp.id = "patternName";
  inp.placeholder = "Pattern name (e.g. Billing Formula)";
  inputs.appendChild(inp);

  modalOverlay.classList.add("show");
}

// ================= PATTERNS =================
async function loadPatterns(){
  patternsCache = await eel.load_patterns()();
  renderPatterns(patternsCache);
}

function renderPatterns(data){
  patternsPanel.innerHTML = "";
  data.forEach(p=>{
    const d = document.createElement("div");
    d.className="item";
    d.innerHTML = `
      <strong>${p[1]}</strong><br>
      ${p[2]}
      <button onclick="usePattern('${p[2]}', ${p[3]})">Use</button>
    `;
    patternsPanel.appendChild(d);
  });
}

function filterPatterns(){
  const q = patternsSearch.value.toLowerCase();
  renderPatterns(
    patternsCache.filter(p =>
      p[1].toLowerCase().includes(q) ||
      p[2].toLowerCase().includes(q)
    )
  );
}

// ================= MODAL =================
async function submitModal(){
  if(modalMode==="name"){
    const name = document.getElementById("patternName").value.trim();
    if(!name){ alert("Pattern name required"); return; }
    await eel.save_named_pattern(name, lastExpression)();
    closeModal();
    loadPatterns();
  }
}

function usePattern(template,count){
  count = Number(count);
  if(count===0){
    eel.apply_pattern(template,{}).then(r=>display.value=r);
    return;
  }

  modalMode="use";
  modalTemplate=template;

  const inputs = document.getElementById("modalInputs");
  inputs.innerHTML="";
  document.getElementById("modalTitle").innerText="Enter Values";

  for(let i=0;i<count;i++){
    const k=String.fromCharCode(65+i);
    const inp=document.createElement("input");
    inp.placeholder=`Value for ${k}`;
    inp.dataset.key=k;
    inputs.appendChild(inp);
  }
  modalOverlay.classList.add("show");
}

function closeModal(){
  modalOverlay.classList.remove("show");
}

// ================= INIT =================
loadHistory();
loadPatterns();
showHistory();
