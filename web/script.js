const display = document.getElementById("display");
const saveBtn = document.getElementById("savePatternBtn");
const historyPanel = document.getElementById("historyPanel");
const patternsPanel = document.getElementById("patternsPanel");
const historyList = document.getElementById("historyList");
const patternsList = document.getElementById("patternsList");
const modalOverlay = document.getElementById("modalOverlay");
const themeIcon = document.querySelector(".theme-icon");

let lastExpression = "";
let modalMode = "";
let historyCache = [];
let patternsCache = [];

/* ================= CALCULATOR LOGIC ================= */
function add(v){ 
    display.value += v; 
}

function clearDisplay(){ 
    display.value=""; 
    saveBtn.hidden=true; 
}

function del(){ 
    display.value = display.value.slice(0,-1); 
}

async function calculate(){
  lastExpression = display.value;
  
  if (typeof eel !== 'undefined') {
      try {
          const r = await eel.calculate(display.value)();
          display.value = r.result;
          saveBtn.hidden = false;
          loadHistory();
      } catch (e) {
          console.error(e);
          display.value = "Error";
      }
  } else {
      // Fallback for testing without Python
      try { 
          // Safe eval replacement
          display.value = Function('"use strict";return (' + display.value + ')')(); 
          saveBtn.hidden=false; 
      } catch { display.value = "Error"; }
  }
}

/* ================= KEYBOARD SUPPORT (NEW) ================= */
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Prevent default browser search on '/'
    if (key === '/') event.preventDefault();

    // Numbers 0-9
    if (/[0-9]/.test(key)) {
        add(key);
    } 
    // Operators
    else if (['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
        add(key);
    } 
    // Enter key = Calculate
    else if (key === 'Enter') {
        event.preventDefault();
        calculate();
    } 
    // Backspace = Delete
    else if (key === 'Backspace') {
        del();
    } 
    // Escape = All Clear (AC)
    else if (key === 'Escape') {
        clearDisplay();
    }
});

/* ================= THEME & UI ================= */
function toggleTheme(){
  document.body.classList.toggle("light");
  
  const isLight = document.body.classList.contains("light");
  if(themeIcon) {
      themeIcon.innerText = isLight ? "☀️" : "🌙";
  }
}

function openHistory(){ closePanels(); historyPanel.classList.add("open"); }
function openPatterns(){ closePanels(); patternsPanel.classList.add("open"); }
function closePanels(){ historyPanel.classList.remove("open"); patternsPanel.classList.remove("open"); }

/* ================= HISTORY & PATTERNS ================= */
async function loadHistory(){
  if (typeof eel !== 'undefined') {
      historyCache = await eel.load_history()();
      renderHistory(historyCache);
  }
}

function renderHistory(data){
  historyList.innerHTML="";
  data.forEach(h=>{
    const d=document.createElement("div");
    d.className="item";
    d.innerHTML = `<span>${h[1]} = <strong>${h[2]}</strong></span>`;
    historyList.appendChild(d);
  });
}

function filterHistory(){
  const q=event.target.value.toLowerCase();
  renderHistory(historyCache.filter(h => h[1].toLowerCase().includes(q) || h[2].toLowerCase().includes(q)));
}

async function loadPatterns(){
  if (typeof eel !== 'undefined') {
      patternsCache = await eel.load_patterns()();
      renderPatterns(patternsCache);
  }
}

function renderPatterns(data){
  patternsList.innerHTML="";
  data.forEach(p=>{
    const d=document.createElement("div");
    d.className="item";
    d.innerHTML=`
      <div style="flex:1; text-align:left;">
        <div style="font-weight:600;">${p[1]}</div>
        <div style="font-size:0.85em; opacity:0.7">${p[2]}</div>
      </div>
      <button onclick="usePattern('${p[2]}')">Use</button>
    `;
    patternsList.appendChild(d);
  });
}

function usePattern(val) {
    display.value = val;
    closePanels();
}

function filterPatterns(){
  const q=event.target.value.toLowerCase();
  renderPatterns(patternsCache.filter(p => p[1].toLowerCase().includes(q) || p[2].toLowerCase().includes(q)));
}

/* ================= MODAL ================= */
function saveCurrentAsPattern(){
  modalMode="name";
  document.getElementById("modalTitle").innerText="Name Pattern";
  const inputs=document.getElementById("modalInputs");
  inputs.innerHTML='<input id="patternName" placeholder="Enter pattern name..." autocomplete="off">';
  modalOverlay.classList.add("show");
  setTimeout(()=>document.getElementById("patternName").focus(), 100);
}

async function submitModal(){
  if(modalMode==="name"){
    const name=document.getElementById("patternName").value.trim();
    if(!name) return;
    
    if (typeof eel !== 'undefined') {
        await eel.save_named_pattern(name,lastExpression)();
        loadPatterns();
    }
    closeModal();
  }
}

function closeModal(){ modalOverlay.classList.remove("show"); }

/* ================= INIT ================= */
if (typeof eel !== 'undefined') {
    eel.expose(loadHistory);
    eel.expose(loadPatterns);
    loadHistory();
    loadPatterns();
}