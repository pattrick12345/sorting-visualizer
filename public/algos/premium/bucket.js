const bucketBox = document.getElementById("buckets");   // null on other pages
const BUCKET_COUNT = 5;

function showBuckets(buckets, ranges, active) {
    if (!bucketBox) return;
    bucketBox.innerHTML = buckets.map((items, b) =>
        '<div class="bucket' + (b === active ? " active" : "") + '">' +
        "<b>" + ranges[b] + "</b>" +
        '<div class="items">' + items.map((v) => "<span>" + v + "</span>").join("") + "</div></div>"
    ).join("");
}

// sorts one bucket, returns how many comparisons it took
function insertionSortList(list) {
    let cmp = 0;
    for (let i = 1; i < list.length; i++) {
        const key = list[i];
        let j = i - 1;
        while (j >= 0) {
            cmp++;
            if (list[j] > key) { list[j + 1] = list[j]; j--; }
            else break;
        }
        list[j + 1] = key;
    }
    return cmp;
}

const bucket_code = [
  "Make a few empty buckets, each covering a range of heights",
  "Look at each bar and drop it into the bucket for its height",
  "Sort each bucket on its own (insertion sort inside the bucket)",
  "Go through the buckets from the shortest range to the tallest:",
  "    Write each bar of the bucket, in order, into the next spot from the left",
];

function countStepsBucket(arr) {
    const min = Math.min(...arr), max = Math.max(...arr);
    const span = max - min + 1;
    const used = new Set(arr.map((v) => Math.floor((v - min) * BUCKET_COUNT / span))).size;
    return 1 + arr.length + 2 * used + arr.length;
    // step(0), step(1) per bar, step(2) and step(3) per non-empty bucket, step(4) per bar
}

async function bucketSort() {
    if (sorting) return;
    sorting = true;
    const myRun = runId;
    stepDelay = TOTAL_TIME / countStepsBucket(array);
    const bars = document.querySelectorAll(".bar");
    const h = [...bars].map((b) => b.offsetHeight);
    const min = Math.min(...h), max = Math.max(...h);
    const span = max - min + 1;
    const K = BUCKET_COUNT;

    const buckets = Array.from({ length: K }, () => []);
    const ranges = buckets.map((_, b) =>
        (min + Math.ceil(b * span / K)) + " to " + (min + Math.ceil((b + 1) * span / K) - 1));

    try {
        showBuckets(buckets, ranges, -1);
        await step(0, myRun);

        // Phase 1: drop each bar into its bucket
        for (let i = 0; i < h.length; i++) {
            const b = Math.floor((h[i] - min) * K / span);
            bars[i].style.background = "yellow";
            buckets[b].push(h[i]);
            showBuckets(buckets, ranges, b);
            await step(1, myRun);
            bars[i].style.background = "orange";          // moved into a bucket
        }

        // Phase 2: sort each bucket
        for (let b = 0; b < K; b++) {
            if (buckets[b].length === 0) continue;
            comparisons += insertionSortList(buckets[b]);
            updateStats();
            showBuckets(buckets, ranges, b);
            await step(2, myRun);
        }

        // Phase 3: write the buckets back, shortest range first
        let pos = 0;
        for (let b = 0; b < K; b++) {
            if (buckets[b].length === 0) continue;
            await step(3, myRun);
            while (buckets[b].length) {
                const v = buckets[b].shift();
                bars[pos].style.height = v + "px";
                bars[pos].style.background = "green";
                showBuckets(buckets, ranges, b);
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

registerAlgorithm("bucket", {
    run: bucketSort,
    code: bucket_code,
    info: { time: "O(n + k) average, O(n²) worst", space: "O(n + k)", label: "Worst case comparisons" },
});