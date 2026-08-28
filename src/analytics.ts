// The one number. Ben's ask (TMP-5): instrument the core action — saving a
// recipe — with a user id and a timestamp, and fire it EXACTLY ONCE per
// completion. Visits are applause from the lobby; this is the signal.

/** The event name, in one place. Ben pulls logs on this string, so it is not
 *  a literal anywhere else — a renamed event is a week of missing data. */
export const RECIPE_SAVED = "recipe_saved";

export interface AnalyticsEvent {
  event: string;
  user_id: string;
  recipe_id: string;
  /** ISO-8601, UTC. The server's day and the reader's day are not the same
   *  day, and the log is read by whoever is asking — so it carries the
   *  instant and lets the reader bucket it. */
  ts: string;
}

/**
 * ONCE PER COMPLETION, not once per click.
 *
 * A save can be retried (a slow network, a double tap, a re-render), and every
 * one of those is the same completed action. Counting them would inflate the
 * only number anybody is going to trust, and the inflation would look exactly
 * like growth. So the recipe id is remembered for the life of the session and
 * a repeat is dropped.
 *
 * Deliberately NOT persisted: across sessions, saving the same recipe again is
 * a real second save. This only de-duplicates the retry.
 */
const fired = new Set<string>();

/** The sink. Console for now — a real collector lands with the backend, and
 *  swapping this one function is the whole of that change. */
type Sink = (e: AnalyticsEvent) => void;
let sink: Sink = (e) => console.info("[analytics]", JSON.stringify(e));

/** Test seam, and the hook the collector will use. */
export function setSink(next: Sink): void {
  sink = next;
}

/**
 * Record that a recipe was saved. Returns whether it counted, so a caller can
 * assert on it — silence and success look identical from the outside
 * otherwise.
 */
export function trackRecipeSaved(recipeId: string, userId: string): boolean {
  if (!recipeId || !userId) return false;
  if (fired.has(recipeId)) return false;
  fired.add(recipeId);
  sink({
    event: RECIPE_SAVED,
    user_id: userId,
    recipe_id: recipeId,
    ts: new Date().toISOString(),
  });
  return true;
}

/** Only for tests: forget what has fired this session. */
export function resetForTests(): void {
  fired.clear();
}
