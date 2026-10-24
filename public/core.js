// ---------- page elements ----------
const barsContainer = document.getElementById("bars");
const generateBtn = document.getElementById("generate");
const sortBtn = document.getElementById("sort");
const sizeSlider = document.getElementById("size");
const codeBox = document.getElementById("code");

// ---------- shared state ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TOTAL_TIME = 15000;   // every sort takes about 15 seconds
let stepDelay = 100;
let comparisons = 0;
let swaps = 0;
let array = [];
let runId = 0;
let sorting = false;
let meta = {};              // footer text, filled in by start()

// ---------- algorithm registry ----------
const algorithms = {};
function registerAlgorithm(name, definition) {
    algorithms[name] = definition;
}

// ---------- helpers ----------
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function updateStats() {
    const n = array.length;
    setText("nVal", n);
    setText("cmp", comparisons);
    setText("swp", swaps);
    setText("expected", meta.expected ? meta.expected(n) : (n * (n - 1)) / 2);
}

function showCode(lines) {
    codeBox.innerHTML = "";
    lines.forEach((text) => {
        const div = document.createElement("div");
        div.className = "line";
        div.textContent = text;
        codeBox.appendChild(div);
    });
}

function highlight(n) {
    const lines = document.querySelectorAll(".line");
    lines.forEach((l) => l.classList.remove("active"));
    if (n >= 0) lines[n].classList.add("active");
}

async function step(n, myRun) {
    if (myRun !== runId) throw "cancelled";
    highlight(n);
    await sleep(stepDelay);
    if (myRun !== runId) throw "cancelled";
}

function generateArray() {
    runId++;            // cancels any sort that is running
    sorting = false;
    highlight(-1);
    ["tally", "buckets"].forEach((id) => {      // clear the extra displays, if the page has them
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });
    array = [];
    comparisons = 0;
    swaps = 0;
    for (let i = 0; i < Number(sizeSlider.value); i++) {
        array.push(Math.floor(Math.random() * 350) + 20);   // 20 to 369
    }
    drawBars();
    updateStats();
}

function drawBars() {
    barsContainer.innerHTML = "";
    for (const value of array) {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = value + "px";
        barsContainer.appendChild(bar);
    }
}

// ---------- start the page (each page calls this after loading its algorithm file) ----------
function start() {
    const algo = document.body.dataset.algo;
    const chosen = algorithms[algo];

    generateBtn.addEventListener("click", generateArray);
    sizeSlider.addEventListener("input", () => {
        setText("elementCount", sizeSlider.value);
        generateArray();
    });
    setText("elementCount", sizeSlider.value);

    if (chosen) {
        meta = chosen.info;
        setText("expectedLabel", meta.label);
        setText("timeCx", meta.time);
        setText("spaceCx", meta.space);
        sortBtn.addEventListener("click", chosen.run);
        showCode(chosen.code);
    } else {
        // the algorithm file did not load (missing, or later: blocked for non-paid users)
        sortBtn.disabled = true;
        codeBox.textContent = "This algorithm is not available. It may need a paid account.";
    }

    generateArray();
}