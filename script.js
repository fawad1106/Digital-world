import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://jsjiysgwymeuugjipyil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NGo65OXNEWzmJqSBy9KGuw_kwFQMDAq";

const clientId = localStorage.getItem("pdw_client_id") || crypto.randomUUID();
localStorage.setItem("pdw_client_id", clientId);

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { "x-pdw-client-id": clientId } }
});

const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)];

const seedData = {
  home: [
    ["Command Core", "Central interface", "AI waits for natural-language commands."],
    ["Today", "3 tasks • 2 events", "Your day in one context."],
    ["Recent Files", "Physics Notes.pdf", "Personal information layer."],
    ["Projects", "Personal Digital World", "Current active build."],
    ["Notifications", "3 new", "Surface what matters."],
    ["Memory", "Project context", "User-owned memory."]
  ],
  calendar: [
    ["09:00", "College", "Physics lecture"],
    ["14:30", "Project", "UI architecture"],
    ["19:00", "Study", "Physics + English"],
    ["21:30", "Personal", "Review tomorrow"]
  ],
  files: [
    ["Recent", "Physics Notes.pdf", "Updated today"],
    ["Design", "PDW Interface.fig", "Updated yesterday"],
    ["Code", "main.js", "Prototype source"],
    ["Archive", "Ideas.md", "Saved ideas"]
  ],
  apps: [
    ["Calendar", "Connected", "Schedule"],
    ["Files", "Connected", "Documents"],
    ["Music", "Available", "Playback"],
    ["Browser", "Available", "Web capability"]
  ],
  projects: [
    ["Personal Digital World", "ACTIVE", "Android-first digital layer"],
    ["College Helper", "IDEA", "Student utility"],
    ["Experiments", "3 ITEMS", "Small prototypes"],
    ["Roadmap", "V0.1 → V1.0", "Build, test, fix"]
  ],
  memory: [
    ["Project Context", "Personal Digital World", "Current context"],
    ["UI Direction", "Digital command interface", "Holographic adaptive UI"],
    ["Privacy", "User-owned", "Permission based"],
    ["Recall", "Searchable", "Useful context on demand"]
  ],
  notifications: [
    ["Priority", "Project milestone", "UI prototype active"],
    ["Reminder", "College", "Physics study"],
    ["System", "AI Core", "Ready"],
    ["Quiet", "Low priority", "Suppressed"]
  ],
  connections: [
    ["Android", "Core platform", "Future system access"],
    ["AI", "Intelligence layer", "Provider can change"],
    ["Files", "Local", "User-owned"],
    ["Web", "Capability", "External services"]
  ],
  settings: [
    ["Appearance", "Digital", "Holographic visual system"],
    ["Privacy", "Local-first", "Permission based"],
    ["AI", "Command Core", "Intelligence layer"],
    ["Version", "V0.2", "Backend connected"]
  ]
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, x => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[x]));
}

function setBackendStatus(text, online = true) {
  const el = $("#backendStatus");
  if (el) {
    el.textContent = text;
    el.style.opacity = online ? "1" : ".65";
  }
}

async function backendHealthCheck() {
  const { error } = await supabase.from("pdw_items").select("id", { count: "exact", head: true });
  if (error) throw error;
}

async function seedBackend() {
  const { count, error } = await supabase
    .from("pdw_items")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  if (count > 0) return;

  const rows = Object.entries(seedData).flatMap(([kind, items]) =>
    items.map(([title, subtitle, details]) => ({
      client_id: clientId,
      kind,
      title,
      subtitle,
      details
    }))
  );

  const { error: insertError } = await supabase.from("pdw_items").insert(rows);
  if (insertError) throw insertError;
}

async function loadData() {
  const { data, error } = await supabase
    .from("pdw_items")
    .select("kind,title,subtitle,details,created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const remote = {};
  for (const row of data) {
    (remote[row.kind] ||= []).push([row.title, row.subtitle, row.details]);
  }

  return Object.keys(seedData).reduce((all, kind) => {
    all[kind] = remote[kind]?.length ? remote[kind] : seedData[kind];
    return all;
  }, {});
}

let data = seedData;

async function show(name) {
  const rows = data[name] || data.home;
  $("#crumb").textContent = name.toUpperCase();
  $("#view").classList.add("show");
  $("#viewTitle").textContent = name[0].toUpperCase() + name.slice(1);
  $("#cards").className = "cards";
  $("#cards").innerHTML = rows.map(x =>
    `<article class="card"><h3>${esc(x[0])}</h3><p><b>${esc(x[1])}</b><br>${esc(x[2])}</p></article>`
  ).join("");
  $$(".nav button").forEach(b => b.classList.toggle("active", b.dataset.view === name));
}

async function command(raw) {
  const c = raw.trim();
  if (!c) return;

  $("#response").classList.add("show");
  $("#responseText").textContent = "Interpreting command…";

  let l = c.toLowerCase();
  let response =
    l.includes("today") ? "I found today's context: 3 tasks, 2 events and 1 deadline." :
    l.includes("file") ? "File index is ready. Matching personal documents can be surfaced." :
    l.includes("project") ? "Personal Digital World is the active project. UI V0.2 is running with backend storage." :
    l.includes("notification") ? "There are 3 priority notifications." :
    l.includes("memory") || l.includes("remember") ? "Relevant personal project memory is available." :
    l.includes("connect") ? "Connected capabilities are standing by." :
    l.includes("permission") ? "Permission mode is safe and user-controlled." :
    `Command received: "${c}". The V0.2 command core is ready.`;

  $("#responseText").textContent = response;

  const { error } = await supabase.from("pdw_commands").insert({
    client_id: clientId,
    command: c,
    response
  });

  if (error) {
    console.warn("Command history could not be saved:", error.message);
    setBackendStatus("Backend: degraded", false);
  }
}

$("#commandForm").onsubmit = e => {
  e.preventDefault();
  command($("#command").value);
};

$("#close").onclick = () => $("#view").classList.remove("show");

$("#nav").onclick = e => {
  const b = e.target.closest("[data-view]");
  if (b) show(b.dataset.view);
};

$$("[data-command]").forEach(b => b.onclick = () => command(b.dataset.command));

setInterval(() => {
  $("#clock").textContent = new Date().toLocaleTimeString([], { hour12: false });
}, 1000);

for (let i = 0; i < 70; i++) {
  const p = document.createElement("i");
  p.className = "p";
  p.style.left = Math.random() * 100 + "%";
  p.style.top = Math.random() * 100 + "%";
  p.style.animationDelay = -Math.random() * 8 + "s";
  $("#particles").appendChild(p);
}

(async function boot() {
  try {
    setBackendStatus("Backend: connecting…", true);
    await backendHealthCheck();
    await seedBackend();
    data = await loadData();
    setBackendStatus("Backend: ONLINE", true);
    await show("home");
  } catch (error) {
    console.error("PDW backend connection failed:", error);
    setBackendStatus("Backend: OFFLINE", false);
    await show("home");
  }
})();
