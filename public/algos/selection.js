const selection_code = [
  "Repeat for each position, left to right:",
  "    Assume the current bar is the smallest",
  "    Look at every bar to its right:",
  "        If a bar is smaller than the smallest so far:",
  "            Remember it as the new smallest",
  "    Swap the smallest bar into this position",
  "    This position is now sorted",
];

function countStepsSelection(arr) {
    const a = [...arr];
    let steps = 0;
    for (let i = 0; i < a.length - 1; i++) {
        steps += 2;                          // step(0), step(1)
        let min = i;
        for (let j = i + 1; j < a.length; j++) {
            steps += 2;                      // step(2), step(3)
            if (a[min] > a[j]) {
                steps++;                     // step(4)
                min = j;
            }
        }
        steps += 2;                          // step(5), step(6)
        [a[i], a[min]] = [a[min], a[i]];
    }
    return steps;
}

async function selectionSort() {
    if (sorting) return;          // ignore a second click on Sort
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsSelection(array);
    const bars = document.querySelectorAll(".bar");
    try {
        for (let i = 0; i < bars.length - 1; i++) {
            await step(0, myRun);
            let min = i;
            bars[min].style.background = "red";   // marks the smallest so far
            await step(1, myRun);

            for (let j = i + 1; j < bars.length; j++) {
                bars[j].style.background = "yellow";
                await step(2, myRun);
                comparisons++;
                updateStats();

                await step(3, myRun);
                if (bars[min].offsetHeight > bars[j].offsetHeight) {
                    await step(4, myRun);
                    bars[min].style.background = "steelblue";
                    min = j;
                    bars[min].style.background = "red";
                }
                if (j !== min) bars[j].style.background = "steelblue";
            }
            await step(5, myRun);
            if (min !== i) {
                let temp = bars[i].style.height;
                bars[i].style.height = bars[min].style.height;
                bars[min].style.height = temp;
                swaps++;
                updateStats();
            }
            bars[min].style.background = "steelblue";
            bars[i].style.background = "green";
            await step(6, myRun);
        }
        highlight(-1);
        for (let k = 0; k < bars.length; k++) {
            bars[k].style.background = "green";
        }
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("selection", {
    run: selectionSort,
    code: selection_code,
    info: { time: "O(n²)", space: "O(1)", label: "Comparisons (always) n(n-1)/2" },
});