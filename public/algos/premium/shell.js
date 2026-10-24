const shell_code = [
  "Start with a big gap between bars (half the array):",
  "    Compare each bar with the bar one gap to its left",
  "        If the left one is taller:",
  "            Swap them, then check one gap further left",
  "    Make the gap smaller and repeat, until the gap is 1",
];

function countStepsShell(arr) {
    const a = [...arr];
    let steps = 0;
    for (let gap = Math.floor(a.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
        steps++;                                  // step(0)
        for (let i = gap; i < a.length; i++) {
            let pos = i;
            while (pos >= gap) {
                steps += 2;                       // step(1), step(2)
                if (a[pos - gap] > a[pos]) {
                    steps++;                      // step(3)
                    [a[pos - gap], a[pos]] = [a[pos], a[pos - gap]];
                    pos -= gap;
                } else break;
            }
        }
        steps++;                                  // step(4)
    }
    return steps;
}

async function shellSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsShell(array);
    const bars = document.querySelectorAll(".bar");

    try {
        for (let gap = Math.floor(bars.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
            await step(0, myRun);

            for (let i = gap; i < bars.length; i++) {
                let pos = i;

                while (pos >= gap) {
                    bars[pos - gap].style.background = "yellow";
                    bars[pos].style.background = "yellow";
                    await step(1, myRun);
                    comparisons++;
                    updateStats();

                    await step(2, myRun);
                    const needSwap = bars[pos - gap].offsetHeight > bars[pos].offsetHeight;

                    if (needSwap) {
                        await step(3, myRun);
                        let temp = bars[pos - gap].style.height;
                        bars[pos - gap].style.height = bars[pos].style.height;
                        bars[pos].style.height = temp;
                        swaps++;
                        updateStats();
                    }

                    bars[pos - gap].style.background = "steelblue";
                    bars[pos].style.background = "steelblue";

                    if (!needSwap) break;
                    pos -= gap;
                }
            }
            await step(4, myRun);
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

registerAlgorithm("shell", {
    run: shellSort,
    code: shell_code,
    info: { time: "O(n²) worst, about O(n^1.5) typical", space: "O(1)", label: "Worst case comparisons" },
});