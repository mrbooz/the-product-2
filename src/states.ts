// THE THREE SCREENS THAT ARE NOT THE HAPPY PATH (TMP-9).
//
// theo's spec listed loading and error. Nadia found the fourth state at
// sprint-2 planning — a brand-new person opens Recipe Tin with zero data —
// and theo added the empty-state frames the same night. His design-QA pin
// three is the law this file is written to: "no dead ends. 'nothing here
// yet' with no next step is a dead end wearing kind words."
//
// So every state here ends in something the reader can DO. That is the
// whole ticket.

/** What the screen is doing, from the reader's point of view. */
export type ScreenState = "loading" | "empty" | "error" | "unrecognised";

export interface StateCopy {
  title: string;
  body: string;
  /** The way out. Never null — see the file header. */
  action: { label: string; onPress: () => void };
}

/**
 * Render one non-happy state into `mount`, and return it so the caller can
 * take it away again when the data arrives.
 *
 * LOADING IS SKELETON SHAPES, NOT A SPINNER (spec: "skeleton shapes, 300ms
 * fade, no spinners"). A spinner says "wait"; a skeleton says "here is the
 * shape of what is coming", which is the difference between a delay and an
 * unknown. It carries no action, because the way out of loading is waiting,
 * and offering a button would be offering an escape from something that is
 * already ending.
 */
export function renderState(
  mount: HTMLElement,
  state: ScreenState,
  copy?: Partial<StateCopy>,
): HTMLElement {
  const box = document.createElement("section");
  box.className = `screen-state screen-state--${state}`;
  // Announced, not just drawn. A state change nobody is told about is a
  // state change that did not happen for a screen-reader user.
  const urgent = state === "error" || state === "unrecognised";
  box.setAttribute("role", urgent ? "alert" : "status");
  box.setAttribute("aria-live", urgent ? "assertive" : "polite");

  if (state === "loading") {
    box.append(skeleton("skeleton-title"), skeleton("skeleton-line"), skeleton("skeleton-line"));
    // The label is for screen readers only; sighted readers have the shapes.
    const sr = document.createElement("p");
    sr.className = "sr-only";
    sr.textContent = "Loading your recipes.";
    box.append(sr);
    mount.append(box);
    return box;
  }

  const resolved =
    state === "empty" ? EMPTY : state === "unrecognised" ? UNRECOGNISED : ERROR;
  const h = document.createElement("h2");
  h.className = "state-title";
  h.textContent = copy?.title ?? resolved.title;
  const p = document.createElement("p");
  p.className = "state-body";
  p.textContent = copy?.body ?? resolved.body;
  const action = copy?.action ?? resolved.action;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "state-action";
  button.textContent = action.label;
  button.addEventListener("click", action.onPress);
  box.append(h, p, button);
  mount.append(box);
  return box;
}

/* THE EMPTY STATE IS THE FIRST SCREEN A STRANGER MEETS (theo, pin 3), so it
 * does not describe the absence — it describes the point. "No recipes yet"
 * is a fact about our database; "the first one is usually somebody else's" is
 * a sentence about why they came. */
const EMPTY: StateCopy = {
  title: "The tin is empty.",
  body:
    "The first recipe in here is usually somebody else's — the one you have " +
    "asked for twice and still cook wrong. Start with that one.",
  /* ROUTES, LIKE THE OTHER ONE DOES (Nadia, review of TMP-9). The first cut
   * popped an alert here while the error state did a real reload, so the two
   * ways out of this screen were different KINDS of thing — one a navigation,
   * one a dialog apologising for the absence of a navigation. This goes to
   * the route the add flow will own. What lives there today is a page that
   * says so in the product's own voice, which is the honest version of "not
   * yet" and stays true the day the flow lands. */
  action: {
    label: "Add the first recipe",
    onPress: () => {
      window.location.hash = "#/add";
    },
  },
};

/* THE ERROR STATE SAYS WHAT HAPPENED AND OFFERS ONE THING (spec: "plain
 * words, one retry, no dead ends"). It does not apologise twice and it does
 * not show the reader a stack trace they cannot act on. */
const ERROR: StateCopy = {
  title: "The tin will not open.",
  body:
    "Something went wrong reading your recipes. They are not lost — this " +
    "browser just could not get to them this time.",
  action: { label: "Try again", onPress: () => window.location.reload() },
};

/* THE TIN IS THERE AND WE CANNOT READ IT — a third failure, and not the same
 * sentence as the second. "Try again" is the wrong offer when a reload will
 * reproduce it exactly; the honest move is to say the recipes are still there
 * and not to touch them. */
export const UNRECOGNISED: StateCopy = {
  title: "These recipes are from a different version.",
  body:
    "There is something in the tin and this version of Recipe Tin cannot " +
    "read it. Nothing has been deleted. Opening the app somewhere it worked " +
    "before will still show them.",
  /* NO BUTTON ON THIS SCREEN MAY TOUCH THE TIN (Nadia, review of TMP-9). The
   * first cut offered "Start a new tin instead" pointing at #/add — and if the
   * add flow writes to the same key, that button is the one thing here that
   * CAN delete what the sentence above it just promised is safe. The way out
   * is a reload, which is harmless and occasionally works (a different tab
   * upgraded the format, an extension stopped interfering). The add flow will
   * still have to learn not to clobber an unrecognised tin; this screen no
   * longer invites it to. */
  action: { label: "Try opening it again", onPress: () => window.location.reload() },
};

function skeleton(cls: string): HTMLElement {
  const el = document.createElement("div");
  el.className = `skeleton ${cls}`;
  // Decorative: the sr-only line above already says what is happening, and a
  // screen reader announcing three grey rectangles helps nobody.
  el.setAttribute("aria-hidden", "true");
  return el;
}
