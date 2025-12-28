let display = document.getElementById("display");

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
  let result = await eel.calculate(display.value)();
  display.value = result;
}
