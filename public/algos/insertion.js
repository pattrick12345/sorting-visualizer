const insertion_code = [
  "Repeat for each bar, starting from the second:",
  "    Pick up the current bar",
  "    Look at the bar to its left:",
  "        If that bar is taller:",
  "            Shift it one place to the right",
  "    Drop the picked bar into the gap",
];

function countStepsInsertion(arr) {
    const a = [...arr];
    let steps = 0;
    for (let i = 1; i < a.length; i++) {
        steps += 2;                          // step(0), step(1)
        const key = a[i];
        let j = i - 1;
        while (true) {
            steps++;                         // step(2)
            if (j < 0) break;
            steps++;                         // step(3)
            if (a[j] > key) {
                steps++;                     // step(4)
                a[j + 1] = a[j];
                j--;
            } else break;
        }
        a[j + 1] = key;
        steps++;                             // step(5)
    }
    return steps;
}

async function insertionSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsInsertion(array);
    const bars = document.querySelectorAll(".bar");
    try {
        bars[0].style.background = "green";
        for (let i = 1; i < bars.length; i++) {
            await step(0, myRun);
            const tempHeight = bars[i].style.height;         // save the height, not the element
            const temp = bars[i].offsetHeight;               // as a number, for comparing
            let j = i - 1;
            bars[i].style.background = "red";
            await step(1, myRun);

            while (true) {
                await step(2, myRun);
                if (j < 0) break;

                bars[j].style.background = "yellow";
                comparisons++;
                updateStats();
                await step(3, myRun);

                if (bars[j].offsetHeight > temp) {
                    await step(4, myRun);
                    bars[j + 1].style.height = bars[j].style.height;
                    bars[j + 1].style.background = "green";
                    swaps++;
                    updateStats();
                    bars[j].style.background = "red";
                    j--;
                } else {
                    bars[j].style.background = "green";
                    break;
                }
            }
            bars[j + 1].style.height = tempHeight;           // drop it into the gap
            bars[j + 1].style.background = "green";
            await step(5, myRun);
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

registerAlgorithm("insertion", {
    run: insertionSort,
    code: insertion_code,
    info: { time: "O(n²) worst, O(n) best", space: "O(1)", label: "Worst case comparisons" },
});