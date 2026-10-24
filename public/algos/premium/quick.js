const quick_code = [
  "Pick the last bar in the range as the pivot",
  "Start the low side just before the range",
  "For each other bar in the range, left to right:",
  "    If the bar is not taller than the pivot:",
  "        Make the low side one slot bigger",
  "        Swap this bar into the low side",
  "Swap the pivot to just right of the low side",
  "Repeat the same steps on the left part and the right part",
];

function countStepsQuick(arr) {
    const a = [...arr];
    let steps = 0;

    function qs(p, r) {
        if (p >= r) return;                 // 0 or 1 bar: no steps
        steps += 2;                         // step(0), step(1)
        const x = a[r];                     // the pivot
        let i = p - 1;

        for (let j = p; j < r; j++) {
            steps += 2;                     // step(2), step(3)
            if (a[j] <= x) {
                steps += 2;                 // step(4), step(5)
                i++;
                [a[i], a[j]] = [a[j], a[i]];
            }
        }

        steps++;                            // step(6)
        [a[i + 1], a[r]] = [a[r], a[i + 1]];
        steps++;                            // step(7)

        qs(p, i);                           // left part (the pivot is at i + 1)
        qs(i + 2, r);                       // right part
    }

    qs(0, a.length - 1);
    return steps;
}

async function quickSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsQuick(array);
    const bars = document.querySelectorAll(".bar");

    function swap(a, b) {
        [bars[a].style.height, bars[b].style.height] =
            [bars[b].style.height, bars[a].style.height];
    }

    async function partition(p, r) {
        await step(0, myRun);
        const x = bars[r].offsetHeight;                // the pivot
        bars[r].style.background = "red";
        await step(1, myRun);
        let i = p - 1;

        for (let j = p; j < r; j++) {
            bars[j].style.background = "yellow";
            await step(2, myRun);
            comparisons++;
            updateStats();

            await step(3, myRun);
            if (bars[j].offsetHeight <= x) {
                i++;
                await step(4, myRun);
                await step(5, myRun);
                if (i !== j) {
                    swap(i, j);
                    swaps++;
                    updateStats();
                }
                bars[i].style.background = "mediumpurple";   // low side
            }
            if (j !== i) bars[j].style.background = "gray";  // high side
        }

        await step(6, myRun);
        if (i + 1 !== r) {
            swap(i + 1, r);
            swaps++;
            updateStats();
        }
        for (let k = p; k <= r; k++) bars[k].style.background = "steelblue";
        bars[i + 1].style.background = "green";            // the pivot is in its final place
        return i + 1;
    }

    async function qs(p, r) {
        if (p > r) return;
        if (p === r) {
            bars[p].style.background = "green";
            return;
        }
        const q = await partition(p, r);
        await step(7, myRun);
        await qs(p, q - 1);
        await qs(q + 1, r);
    }

    try {
        await qs(0, bars.length - 1);
        highlight(-1);
        bars.forEach((b) => (b.style.background = "green"));
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("quick", {
    run: quickSort,
    code: quick_code,
    info: { time: "O(n log n) average, O(n²) worst", space: "O(log n)", label: "Worst case comparisons" },
});