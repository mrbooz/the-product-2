// The people building Recipe Tin. One entry each, in the order they joined —
// a new person goes at the end, which is also how the tin works.

export interface Member {
  name: string;
  role: string;
  /** What they are on this week, in their own words. */
  on: string;
}

export const TEAM: Member[] = [
  { name: "Sofia Reyes", role: "Product", on: "acceptance criteria for week one" },
  { name: "Marcus Chen", role: "Engineering Manager", on: "keeping week one to one ticket" },
  { name: "Nadia Okafor", role: "Senior Engineer", on: "reading every diff that opens" },
  { name: "theo", role: "Design", on: "the handwritten recipe card" },
  { name: "Ben Tran", role: "Data", on: "second-contributor-in-14-days" },
  { name: "Rae", role: "Software Engineer I", on: "this page" },
];

/** Render the team into `mount`. Returns the list so a test can read it. */
export function renderTeam(mount: HTMLElement): HTMLUListElement {
  const list = document.createElement("ul");
  list.className = "team-list";
  for (const member of TEAM) {
    const row = document.createElement("li");

    const who = document.createElement("span");
    who.className = "team-who";

    const name = document.createElement("span");
    name.className = "team-name";
    name.textContent = member.name;

    const role = document.createElement("span");
    role.className = "team-role";
    role.textContent = member.role;

    who.append(name, role);

    // A visible line, not a title attribute: a tooltip cannot be reached by
    // keyboard and does not exist on touch, so most readers would never see it.
    const on = document.createElement("span");
    on.className = "team-on";
    on.textContent = member.on;

    row.append(who, on);
    list.append(row);
  }
  mount.append(list);
  return list;
}
