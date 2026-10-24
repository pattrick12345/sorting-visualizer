const bubble_code = [
  "Repeat for each round:",
  "    Look at each pair of neighbors:",
  "        Compare the two bars",
  "        If the left one is taller:",
  "            Swap them",
  "    The tallest bar is now in its place",
];


function countSteps(arr) {
    const a = [...arr];          // work on a copy, don't touch the real array
    let steps = 0;
    for (let i = 0; i < a.length - 1; i++) {
        steps++;                                  // step(0)
        for (let j = 0; j < a.length - i - 1; j++) {
            steps += 3;                           // step(1), step(2), step(3)
            if (a[j] > a[j + 1]) {
                steps++;                          // step(4), the swap
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
            }
        }
        steps++;                                  // step(5)
    }
    return steps;
}

async function bubbleSort() {
    if (sorting) return;          // ignore a second click on Sort
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countSteps(array);
    const bars = document.querySelectorAll(".bar"); // grab them right when sorting starts
    try{
        for (let i = 0; i < bars.length - 1; i++) {
            await step(0, myRun);
            for (let j = 0; j < bars.length - i - 1; j++) {
                await step(1, myRun);
                bars[j].style.background = "yellow";
                bars[j+1].style.background = "yellow";

                await step(2, myRun);
                comparisons++;                     // NEW
                updateStats();

                await step(3, myRun);
                if (bars[j].offsetHeight > bars[j+1].offsetHeight) {
                    await step(4, myRun);
                    swaps++;                       // NEW
                    updateStats(); 
                    let temp = bars[j].style.height;
                    bars[j].style.height = bars[j+1].style.height;
                    bars[j+1].style.height = temp;
                }

                bars[j].style.background = "steelblue";
                bars[j+1].style.background = "steelblue";
            }
            bars[bars.length-i-1].style.background = "green";
            await step(5, myRun);
        }
        highlight(-1);
        for (let k = 0; k < bars.length; k++) {
            bars[k].style.background = "green";
        }
    } catch (e) {
        if (e !== "cancelled") throw e;   // real errors still show up
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("bubble", {
    run: bubbleSort,
    code: bubble_code,
    info: {
        time: "O(n²) worst, O(n²) best",
        space: "O(1)",
        label: "Worst case comparisons"
    },
});