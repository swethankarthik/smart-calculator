let display = document.getElementById("display");
let historyList = document.getElementById("history-list");
let isDark = true;

function add(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function del() {
  display.value = display.value.slice(0, -1);
}

async function calculate() {
  if (!display.value) return;

  let expression = display.value;
  let result = await eel.calculate(expression)();

  display.value = result;

  if (result !== "Error") {
    addHistory(expression, result);
  }
}

function addHistory(exp, res) {
  let item = document.createElement("div");
  item.className = "history-item";
  item.innerText = `${exp} = ${res}`;

  item.onclick = () => {
    display.value = exp;
  };

  historyList.prepend(item);
}

function toggleTheme() {
  document.body.classList.toggle("light");
  isDark = !isDark;
  document.querySelector(".theme-btn").innerText = isDark ? "🌙" : "☀️";
}
