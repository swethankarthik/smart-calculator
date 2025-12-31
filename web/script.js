const display = document.getElementById("display");
const saveBtn = document.getElementById("savePatternBtn");

const historyPanel = document.getElementById("historyPanel");
const patternsPanel = document.getElementById("patternsPanel");

const historyList = document.getElementById("historyList");
const patternsList = document.getElementById("patternsList");

const modalOverlay = document.getElementById("modalOverlay");

let lastExpression = "";
let modalMode = "";
let modalTemplate = "";
let historyCache = [];
let patternsCache = [];

/* Calculator */
function add(v){ display.value += v; }
function clearDisplay(){ display.value=""; saveBtn.hidden=true; }
function del(){ display.value = display.value.slice(0,-1); }

async function calculate(){
  lastExpression = display.value;
  const r = await eel.calculate(display.value)();
  display.value = r.result;
  saveBtn.hidden = false;
  loadHistory();
}

/* Theme */
function toggleTheme(){
  document.body.classList.toggle("light");
}

/* Panels */
function openHistory(){
  closePanels();
  historyPanel.classList.add("open");
}

function openPatterns(){
  closePanels();
  patternsPanel.classList.add("open");
}

function closePanels(){
  historyPanel.classList.remove("open");
  patternsPanel.classList.remove("open");
}

/* History */
async function loadHistory(){
  historyCache = await eel.load_history()();
  renderHistory(historyCache);
}

function renderHistory(data){
  historyList.innerHTML="";
  data.forEach(h=>{
    const d=document.createElement("div");
    d.className="item";
    d.innerText=`${h[1]} = ${h[2]}`;
    historyList.appendChild(d);
  });
}

function filterHistory(){
  const q=event.target.value.toLowerCase();
  renderHistory(historyCache.filter(h =>
    h[1].toLowerCase().includes(q) ||
    h[2].toLowerCase().includes(q)
  ));
}

/* Patterns */
async function loadPatterns(){
  patternsCache = await eel.load_patterns()();
  renderPatterns(patternsCache);
}

function renderPatterns(data){
  patternsList.innerHTML="";
  data.forEach(p=>{
    const d=document.createElement("div");
    d.className="item";
    d.innerHTML=`<strong>${p[1]}</strong><br>${p[2]}
      <button onclick="usePattern('${p[2]}',${p[3]})">Use</button>`;
    patternsList.appendChild(d);
  });
}

function filterPatterns(){
  const q=event.target.value.toLowerCase();
  renderPatterns(patternsCache.filter(p =>
    p[1].toLowerCase().includes(q) ||
    p[2].toLowerCase().includes(q)
  ));
}

/* Modal */
function saveCurrentAsPattern(){
  modalMode="name";
  document.getElementById("modalTitle").innerText="Name Pattern";
  const inputs=document.getElementById("modalInputs");
  inputs.innerHTML="";
  const i=document.createElement("input");
  i.id="patternName";
  i.placeholder="Pattern name";
  inputs.appendChild(i);
  modalOverlay.classList.add("show");
}

async function submitModal(){
  if(modalMode==="name"){
    const name=document.getElementById("patternName").value.trim();
    if(!name) return;
    await eel.save_named_pattern(name,lastExpression)();
    closeModal();
    loadPatterns();
  }
}

function closeModal(){
  modalOverlay.classList.remove("show");
}

/* Init */
loadHistory();
loadPatterns();
