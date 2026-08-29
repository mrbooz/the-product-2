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

/**
 * Every recipe in the tin, oldest first.
 *
 * A STORAGE FAILURE IS AN EMPTY TIN, NEVER A CRASH. Private mode, a quota,
 * a corrupted value written by an older build — all of them mean "nothing to
 * show", which is a screen TMP-9 is designing anyway. Throwing here would
 * take the whole page down over a recipe nobody could read.
 */
export function loadRecipes(): StoredRecipe[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify([SEED]));
      return [SEED];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecipe);
  } catch {
    // Not seeded either: a browser that cannot read cannot be trusted to
    // write, and a seed that vanishes on reload is worse than no seed.
    return [];
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
