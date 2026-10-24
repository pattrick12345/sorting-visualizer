const merge_code = [
  "Make one temporary list as long as the whole array",
  "Sort(low, high): stop if the range has only one bar",
  "Find the middle, sort the left half, then sort the right half",
  "Merge: compare the first unused bar of each half",
  "    Put the shorter one into the temporary list",
  "Put any bars left over in either half into the temporary list",
  "Copy the merged range from the temporary list back to the bars",
];

function countStepsMerge(arr) {
    const a = [...arr];
    const tmp = new Array(a.length);
    let steps = 1;                                // step(0)

    function ms(low, high) {
        if (low >= high) return;
        steps += 2;                               // step(1), step(2)
        const mid = low + ((high - low) >> 1);
        ms(low, mid);
        ms(mid + 1, high);

        let i = low, j = mid + 1, k = low;
        while (i <= mid && j <= high) {
            steps += 2;                           // step(3), step(4)
            if (a[i] <= a[j]) tmp[k++] = a[i++];
            else tmp[k++] = a[j++];
        }
        while (i <= mid) { steps++; tmp[k++] = a[i++]; }    // step(5)
        while (j <= high) { steps++; tmp[k++] = a[j++]; }   // step(5)
        for (let x = low; x <= high; x++) {
            steps++;                              // step(6)
            a[x] = tmp[x];
        }
    }

    ms(0, a.length - 1);
    return steps;
}

async function mergeSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsMerge(array);
    const bars = document.querySelectorAll(".bar");
    const arr = [...bars].map((b) => b.offsetHeight);   // the array of heights
    const tmp = new Array(arr.length);                  // one temp list, reused by every merge

    // merge_reuse_tmp(arr, tmp, low, mid, high)
    async function merge(low, mid, high) {
        for (let b = low; b <= mid; b++) bars[b].style.background = "mediumpurple";   // left half
        for (let b = mid + 1; b <= high; b++) bars[b].style.background = "gray";      // right half

        let i = low, j = mid + 1, k = low;

        while (i <= mid && j <= high) {
            bars[i].style.background = "yellow";        // the two front bars
            bars[j].style.background = "yellow";
            await step(3, myRun);
            comparisons++;
            updateStats();

            await step(4, myRun);
            if (arr[i] <= arr[j]) {
                tmp[k++] = arr[i];
                bars[i].style.background = "mediumpurple";
                i++;
            } else {
                tmp[k++] = arr[j];
                bars[j].style.background = "gray";
                j++;
            }
        }
        while (i <= mid) { await step(5, myRun); tmp[k++] = arr[i++]; }
        while (j <= high) { await step(5, myRun); tmp[k++] = arr[j++]; }

        // copy back only the merged segment
        for (let x = low; x <= high; x++) {
            await step(6, myRun);
            arr[x] = tmp[x];
            bars[x].style.height = tmp[x] + "px";
            bars[x].style.background = "green";
        }
    }

    // mSort_tmp(arr, tmp, low, high)
    async function ms(low, high) {
        if (low >= high) return;
        await step(1, myRun);
        const mid = low + ((high - low) >> 1);
        await step(2, myRun);
        await ms(low, mid);
        await ms(mid + 1, high);
        await merge(low, mid, high);
    }

    try {
        await step(0, myRun);
        await ms(0, arr.length - 1);
        highlight(-1);
        bars.forEach((b) => (b.style.background = "green"));
    } catch (e) {
        if (e !== "cancelled") throw e;
    } finally {
        if (myRun === runId) sorting = false;
    }
}

registerAlgorithm("merge", {
    run: mergeSort,
    code: merge_code,
    info: { time: "O(n log n) always", space: "O(n)", label: "Upper bound n·log₂(n)",
            expected: (n) => Math.round(n * Math.log2(n)) },
});