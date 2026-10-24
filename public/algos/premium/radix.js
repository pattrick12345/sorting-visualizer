const tally = document.getElementById("tally");   // null on pages without it

function showTally(count, exp) {
    if (!tally) return;
    const names = { 1: "ones", 10: "tens", 100: "hundreds" };
    tally.innerHTML =
        '<span class="lbl">Digit: ' + (names[exp] || exp) + "</span>" +
        count.map((c, d) => '<div class="box"><b>' + d + "</b><span>" + c + "</span></div>").join("");
}

const radix_code = [
  "Find the tallest bar to know how many digits to sort by",
  "For each digit place, starting with the ones:",
  "    Count how many bars have each digit (0 to 9)",
  "    Turn the counts into end positions (running total)",
  "    Go through the bars from right to left, placing each in its spot",
  "    Copy the placed bars back, in their new order",
];

function countStepsRadix(arr) {
    const max = Math.max(...arr);
    let steps = 1;                                   // step(0)
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        steps += 1;                                  // step(1)
        steps += arr.length;                         // step(2), once per bar
        steps += 1;                                  // step(3)
        steps += arr.length;                         // step(4), once per bar
        steps += arr.length;                         // step(5), once per bar
    }
    return steps;
}

async function radixSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsRadix(array);
    const bars = document.querySelectorAll(".bar");
    const arr = [...bars].map((b) => b.offsetHeight);
    const n = arr.length;
    const max = Math.max(...arr);

    try {
        await step(0, myRun);

        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            await step(1, myRun);
            const count = new Array(10).fill(0);
            const output = new Array(n);
            showTally(count, exp);

            // 1) count how many bars have each digit
            for (let i = 0; i < n; i++) {
                const d = Math.floor(arr[i] / exp) % 10;
                bars[i].style.background = "yellow";
                count[d]++;
                showTally(count, exp);
                await step(2, myRun);
                bars[i].style.background = "steelblue";
            }

            // 2) running total: count[d] becomes the end position for digit d
            for (let d = 1; d < 10; d++) count[d] += count[d - 1];
            showTally(count, exp);
            await step(3, myRun);

            // 3) place bars right to left, so equal digits keep their order (stable)
            for (let i = n - 1; i >= 0; i--) {
                const d = Math.floor(arr[i] / exp) % 10;
                bars[i].style.background = "yellow";
                count[d]--;
                output[count[d]] = arr[i];
                showTally(count, exp);
                await step(4, myRun);
                bars[i].style.background = "steelblue";
            }

            // 4) copy back in the new order
            for (let i = 0; i < n; i++) {
                arr[i] = output[i];
                bars[i].style.height = output[i] + "px";
                bars[i].style.background = "green";
                await step(5, myRun);
            }
            bars.forEach((b) => (b.style.background = "steelblue"));
        }

        highlight(-1);
        bars.forEach((b) => (b.style.background = "green"));
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("radix", {
    run: radixSort,
    code: radix_code,
    info: { time: "O(d·(n + 10)), about O(n) here", space: "O(n)", label: "Comparisons made", expected: () => 0 },
});