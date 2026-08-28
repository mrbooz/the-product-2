import { PITCH, PRODUCT_NAME } from "./config";
import { renderTeam } from "./team";
import { trackRecipeSaved } from "./analytics";
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
 * one recipe, one button, one event. It is deliberately the smallest thing
 * that makes the number honest — the real save flow replaces this, and the
 * event name and shape do not change when it does.
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
    return "anon-unstored";
  }
}

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
  const counted = trackRecipeSaved("recipe-001", currentUserId());
  // Says which of the two things happened, because "saved" and "saved again"
  // are the difference the whole ticket is about.
  status.textContent = counted
    ? "Saved. That is one recipe kept."
    : "Already saved this one — counted once, as it should be.";
});
saved.append(button, status);
document.querySelector("main")!.append(saved);
