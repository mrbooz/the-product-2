import { PITCH, PRODUCT_NAME } from "./config";
import "./style.css";

document.title = PRODUCT_NAME;
document.querySelector<HTMLHeadingElement>("#name")!.textContent = PRODUCT_NAME;
document.querySelector<HTMLParagraphElement>("#pitch")!.textContent = PITCH;

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
