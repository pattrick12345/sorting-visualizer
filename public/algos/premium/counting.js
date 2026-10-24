const tally = document.getElementById("tally");   // null on pages without it

function showCountTally(count, keys) {
    if (!tally) return;
    tally.innerHTML =
        '<span class="lbl">Height tally</span>' +
        keys.map((v) => '<div class="box"><b>' + v + "</b><span>" + count[v] + "</span></div>").join("");
}

const counting_code = [
  "Make a tally box for every height that appears, all starting at 0",
  "Look at each bar and add 1 to the tally of its height",
  "Go through the heights from shortest to tallest:",
  "    For each time that height was counted:",
  "        Write that height into the next bar from the left",
];

function countStepsCounting(arr) {
    const distinct = new Set(arr).size;
    return 1 + arr.length + distinct + 2 * arr.length;
    // step(0) once, step(1) per bar, step(2) per distinct height, step(3) + step(4) per bar
}

async function countingSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsCounting(array);
    const bars = document.querySelectorAll(".bar");
    const heights = [...bars].map((b) => b.offsetHeight);
    const max = Math.max(...heights);
    const count = new Array(max + 1).fill(0);                    // one tally per possible height
    const keys = [...new Set(heights)].sort((a, b) => a - b);    // only the heights that appear

    try {
        showCountTally(count, keys);
        await step(0, myRun);

        // Phase 1: count
        for (let i = 0; i < bars.length; i++) {
            bars[i].style.background = "yellow";
            count[heights[i]]++;
            showCountTally(count, keys);
            await step(1, myRun);
            bars[i].style.background = "orange";                 // counted
        }

        // Phase 2: write back in order
        let pos = 0;
        for (const v of keys) {
            await step(2, myRun);
            while (count[v] > 0) {
                await step(3, myRun);
                bars[pos].style.height = v + "px";
                bars[pos].style.background = "green";
                count[v]--;
                showCountTally(count, keys);
                await step(4, myRun);
                pos++;
            }
        }

        highlight(-1);
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("counting", {
    run: countingSort,
    code: counting_code,
    info: { time: "O(n + k)", space: "O(k)", label: "Comparisons made", expected: () => 0 },
});