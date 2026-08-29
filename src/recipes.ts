// WHERE THE RECIPES ACTUALLY LIVE (TMP-8).
//
// There is no backend yet, so "real data" means the browser's own store —
// the point of this ticket is that the screen stops holding its content and
// starts asking for it. When a server lands, this file changes and nothing
// above it does.

import type { Recipe } from "./recipe-card";

export interface StoredRecipe extends Recipe {
  /** Stable across sessions — the analytics dedupe and the save button both
   *  key on it, and a regenerated id would silently double-count. */
  id: string;
}

const KEY = "recipe-tin:recipes";

/* THE FIRST RECIPE IS SEED DATA, AND IT IS LABELLED AS SUCH.
 *
 * An empty tin on first open is honest but useless for judging the layout,
 * and a fake recipe presented as the reader's own would be the product lying
 * about what it holds. So the seed is one recipe, marked `seed-` in its id,
 * and the empty case is TMP-9's to design properly. */
const SEED: StoredRecipe = {
  id: "seed-ana-tomato",
  title: "Ana's Sunday tomato sauce",
  from: "Ana",
  ingredients: [
    "2 tins whole plum tomatoes",
    "1 onion, halved, skin on",
    "5 tbsp butter",
    "salt, more than you think",
    "a basil stalk, if there is one",
  ],
  method: [
    "Tip the tomatoes into a heavy pan and crush them with your hand. Do not use a blender; the sauce should not be smooth, and Ana would have said so.",
    "Add the onion halves cut side down, the butter, and a serious pinch of salt. Bring it to a bare simmer.",
    "Leave it for 45 minutes, uncovered, stirring only when you remember. It will look wrong at 20 minutes and right at 40.",
    "Take the onion out. Taste it. It will need more salt than you want to add, and then it will need a little more than that.",
  ],
};

/** What came back, and — when nothing did — why.
 *
 * THE TIN SAYS WHY IT IS EMPTY (Nadia, review of TMP-9). The first cut
 * returned a bare array and left main.ts to re-probe storage and guess. That
 * guess assumed a read failure was the only way the tin can break, so a value
 * that parsed but was the wrong shape — a future version's format — would
 * have been reported to the reader as "the tin is empty" about recipes they
 * know they saved. The reason belongs to the function that knows it. */
export type TinResult =
  | { ok: true; recipes: StoredRecipe[] }
  | { ok: false; reason: "unreadable" | "unrecognised" };

/**
 * Every recipe in the tin, oldest first.
 *
 * A STORAGE FAILURE IS NEVER A CRASH. Private mode, a quota, a value written
 * by an older or newer build — all of them are screens TMP-9 designed.
 * Throwing here would take the whole page down over a recipe nobody could
 * read.
 */
export function loadRecipes(): TinResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { ok: false, reason: "unreadable" };
  }
  if (!raw) {
    try {
      localStorage.setItem(KEY, JSON.stringify([SEED]));
    } catch {
      // Readable but not writable — a real quota case. The seed still shows;
      // it just will not be there next time, and that is honest.
    }
    return { ok: true, recipes: [SEED] };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: false, reason: "unrecognised" };
    // A SHAPE WE DO NOT RECOGNISE IS NOT AN EMPTY TIN. If something is stored
    // and none of it survives the shape check, the format moved under us —
    // seeding or showing "empty" over it would be the product telling a
    // stranger their recipes never existed.
    const recipes = parsed.filter(isRecipe);
    if (parsed.length > 0 && recipes.length === 0) {
      return { ok: false, reason: "unrecognised" };
    }
    return { ok: true, recipes };
  } catch {
    return { ok: false, reason: "unrecognised" };
  }
}

/** Shape check at the boundary. Anything that reaches the card is a Recipe,
 *  because the card renders what it is handed and asks no questions. */
function isRecipe(v: unknown): v is StoredRecipe {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.title === "string" &&
    typeof r.from === "string" &&
    Array.isArray(r.ingredients) &&
    Array.isArray(r.method)
  );
}
