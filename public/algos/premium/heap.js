const heap_code = [
  "Build a heap: sink each parent bar down",
  "Repeat until one bar is left in the heap:",
  "    Swap the top (tallest) bar with the last heap bar",
  "    Shrink the heap: the last bar is now final",
  "    Sink the new top bar: compare it with its children",
  "        If a child is taller, swap with the taller child",
];

function countStepsHeap(arr) {
    const a = [...arr];
    const n = a.length;
    let steps = 1;                                   // step(0)

    function sift(i, size) {
        while (true) {
            steps++;                                 // step(4)
            const l = 2 * i + 1, r = 2 * i + 2;
            let largest = i;
            if (l < size && a[l] > a[largest]) largest = l;
            if (r < size && a[r] > a[largest]) largest = r;
            if (largest === i) break;
            steps++;                                 // step(5)
            [a[i], a[largest]] = [a[largest], a[i]];
            i = largest;
        }
    }

    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
    for (let end = n - 1; end > 0; end--) {
        steps += 3;                                  // step(1), step(2), step(3)
        [a[0], a[end]] = [a[end], a[0]];
        sift(0, end);
    }
    return steps;
}

async function heapSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsHeap(array);
    const bars = document.querySelectorAll(".bar");
    const h = [...bars].map((b) => b.offsetHeight);
    const n = h.length;

    function swap(a, b) {
        [h[a], h[b]] = [h[b], h[a]];
        bars[a].style.height = h[a] + "px";
        bars[b].style.height = h[b] + "px";
    }

    // put bars back to blue, but never touch the sorted bars at the end
    function unmark(size, ...idx) {
        idx.forEach((x) => { if (x < size) bars[x].style.background = "steelblue"; });
    }

    async function siftDown(i, size) {
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let largest = i;
            bars[i].style.background = "yellow";
            if (l < size) bars[l].style.background = "yellow";
            if (r < size) bars[r].style.background = "yellow";
            await step(4, myRun);

            if (l < size) { comparisons++; if (h[l] > h[largest]) largest = l; }
            if (r < size) { comparisons++; if (h[r] > h[largest]) largest = r; }
            updateStats();

            if (largest === i) {
                unmark(size, i, l, r);
                break;
            }
            await step(5, myRun);
            swap(i, largest);
            swaps++;
            updateStats();
            unmark(size, i, l, r);
            i = largest;
        }
    }

    try {
        await step(0, myRun);
        for (let i = (n >> 1) - 1; i >= 0; i--) await siftDown(i, n);   // build the heap

        for (let end = n - 1; end > 0; end--) {
            await step(1, myRun);
            await step(2, myRun);
            swap(0, end);                                // tallest goes to the end
            swaps++;
            updateStats();
            bars[end].style.background = "green";        // final place
            await step(3, myRun);
            await siftDown(0, end);                      // fix the heap
        }

        highlight(-1);
        bars.forEach((b) => (b.style.background = "green"));
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("heap", {
    run: heapSort,
    code: heap_code,
    info: { time: "O(n log n) always", space: "O(1)", label: "Rough upper bound 2·n·log₂(n)",
            expected: (n) => Math.round(2 * n * Math.log2(n)) },
});