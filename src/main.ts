import { PITCH, PRODUCT_NAME } from "./config";
import { renderTeam } from "./team";
import { trackRecipeSaved } from "./analytics";
import { renderRecipeCard } from "./recipe-card";
import { loadRecipes } from "./recipes";
import "./style.css";

document.title = PRODUCT_NAME;
document.querySelector<HTMLHeadingElement>("#name")!.textContent = PRODUCT_NAME;
document.querySelector<HTMLParagraphElement>("#pitch")!.textContent = PITCH;

renderTeam(document.querySelector<HTMLElement>("#team")!);

// ?demo=1 — seed-data mode (stub).
// Renders placeholder rows so demos never show an empty screen.
// Replace the seed with real data as features land.
if (new URLSearchParams(location.search).get("demo") === "1") {
  const seed = ["Demo item one", "Demo item two", "Demo item three"];
  const list = document.createElement("ul");
  list.className = "demo-list";
  for (const label of seed) {
    const row = document.createElement("li");
    row.textContent = label;
    list.append(row);
  }
  document.querySelector("main")!.append(list);
}

/* THE CORE ACTION, so there is something real to count (TMP-5).
 *
 * The skeleton had nothing a person could complete, and an analytics event
 * with no action behind it measures nothing. So the first save lives here:
 * one button, one event, against whatever recipe is on screen.
 *
 * The user id is a per-browser id, not an account: there are no accounts yet,
 * and inventing one in the log would be worse than saying "this browser".
 */
function currentUserId(): string {
  const KEY = "recipe-tin:user";
  try {
    const seen = localStorage.getItem(KEY);
    if (seen) return seen;
    const made = `anon-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, made);
    return made;
  } catch {
    // Private mode, or storage refused. An unattributed save still counts as
    // a save; it must not be dropped for the sake of a tidier log.
    //
    // ONE ID PER SESSION, not one id for everybody (Nadia, review of TMP-5).
    // A shared constant would fold every private-mode reader into a single
    // user, and the north-star number is per-user by definition.
    if (!refusedId) refusedId = `anon-nostore-${Math.random().toString(36).slice(2, 10)}`;
    return refusedId;
  }
}

/** The per-session id for a browser that refuses storage. See currentUserId. */
let refusedId = "";

/* THE SCREEN ASKS FOR ITS CONTENT NOW (TMP-8).
 *
 * The card used to hold a recipe in its own call site, which meant the AC —
 * "nothing on the screen is hardcoded that shouldn't be" — was false by
 * construction. It reads the tin instead, and the save button saves the
 * recipe that is actually on screen, by its own id.
 *
 * THE PLACEHOLDER ID IS GONE, and that closes the hole Nadia and Ben both
 * flagged on TMP-5: every save was `recipe-001`, so the once-per-completion
 * dedupe collapsed every recipe in a session into one event. The number was
 * unfalsifiable, which is worse than noisy. It now dedupes on the thing it
 * was always meant to.
 */
const main = document.querySelector<HTMLElement>("main")!;
const recipes = loadRecipes();
const showing = recipes[0];

if (showing) {
  renderRecipeCard(main, showing);

  const saved = document.createElement("section");
  saved.className = "save-demo";
  const button = document.createElement("button");
  button.type = "button";
  button.id = "save-recipe";
  button.textContent = "Save this recipe";
  const status = document.createElement("p");
  status.className = "save-status";
  status.id = "save-status";
  button.addEventListener("click", () => {
    const counted = trackRecipeSaved(showing.id, currentUserId());
    // Says which of the two things happened, because "saved" and "saved
    // again" are the difference the whole ticket is about.
    status.textContent = counted
      ? "Saved. That is one recipe kept."
      : "Already saved this one — counted once, as it should be.";
  });
  saved.append(button, status);
  main.append(saved);
}
// The no-recipes screen is TMP-9's. Rendering a guess at it here would be
// the third state nobody specced, built twice.
