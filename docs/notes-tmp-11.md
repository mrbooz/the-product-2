# TMP-11 — cleanup notes

quick pass while i was in Recipe Tin anyway. wrote down what the retry
helper actually does so the next person doesn't have to read it cold.

## retry helper

retries a flaky call up to MAX_RETRIES times total (that count includes
the first try), flat backoff between attempts. current shape:

```js
const MAX_RETRIES = 3;
const BACKOFF_MS = 250;

async function withRetry(fn) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await sleep(BACKOFF_MS);
    }
  }
  throw lastErr;
}
```

## config reference

| key         | value | notes                          |
| ----------- | ----- | ------------------------------ |
| MAX_RETRIES | 3     | total attempts incl. the first |
| BACKOFF_MS  | 2500  | flat, no jitter yet            |
| TIMEOUT_MS  | 10000 | per-attempt cap                |

if any of this drifts from the code, the code wins. ping me.

— nadia
