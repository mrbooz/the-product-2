// THE HANDWRITTEN RECIPE CARD — theo's flagship screen (TMP-7, spec v1).
//
// Static build only: structure, spacing, type, one accent. Real data is
// TMP-8 and the loading/error/empty states are TMP-9, so this file renders
// whatever it is handed and asks no questions about where it came from.
//
// THE HANDWRITING IS LOAD-BEARING, not decoration (theo, at handoff, twice).
// It is what says a person wrote this down and meant it to outlive them —
// so the title keeps its own face and its own baseline, and the card never
// flattens into a generic list row when the content gets long.

export interface Recipe {
  title: string;
  /** Who it came from. The whole product is that this is somebody's. */
  from: string;
  /** Free text, one per line. Deliberately not parsed. */
  ingredients: readonly string[];
  /** Free text, one paragraph per step. Long is normal — see the note on
   *  overflow below. */
  method: readonly string[];
}

/**
 * Render one recipe card into `mount`. Returns the card element so tests and
 * later tickets (states, data) can reach it without re-querying.
 *
 * 8pt GRID, and every number below is a multiple of 8 (0.5rem). The spec says
 * measurements are law; where a value here is not on the grid it is a bug,
 * not a judgement call.
 *
 * LONG RECIPES ARE THE NORMAL CASE, not the edge (my note at theo's reveal,
 * and his answer: "forty lines coming next crop, brace yourself"). So nothing
 * here is sized to the content: the card grows, the method column keeps its
 * measure, and the title does not truncate — a truncated recipe name is the
 * one thing a person would never forgive.
 */
export function renderRecipeCard(mount: HTMLElement, recipe: Recipe): HTMLElement {
  const card = document.createElement("article");
  card.className = "recipe-card";

  const head = document.createElement("header");
  head.className = "recipe-head";
  const title = document.createElement("h2");
  title.className = "recipe-title";
  title.textContent = recipe.title;
  const from = document.createElement("p");
  from.className = "recipe-from";
  // "from Ana" reads as provenance; "Author: Ana" reads as a database.
  from.textContent = `from ${recipe.from}`;
  head.append(title, from);

  const body = document.createElement("div");
  body.className = "recipe-body";

  const ing = document.createElement("section");
  ing.className = "recipe-ingredients";
  ing.append(sectionLabel("Ingredients"));
  const ingList = document.createElement("ul");
  for (const line of recipe.ingredients) {
    const li = document.createElement("li");
    li.textContent = line;
    ingList.append(li);
  }
  ing.append(ingList);

  const method = document.createElement("section");
  method.className = "recipe-method";
  method.append(sectionLabel("Method"));
  const steps = document.createElement("ol");
  for (const step of recipe.method) {
    const li = document.createElement("li");
    li.textContent = step;
    steps.append(li);
  }
  method.append(steps);

  body.append(ing, method);
  card.append(head, body);
  mount.append(card);
  return card;
}

/** A section label, as a real heading — the whitespace does the hierarchy on
 *  screen, and the heading does it for a screen reader. Both, not either. */
function sectionLabel(text: string): HTMLElement {
  const h = document.createElement("h3");
  h.className = "recipe-label";
  h.textContent = text;
  return h;
}
