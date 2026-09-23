import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { parseCommand } from "./command-engine.js";

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
  tasks: [],
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
  const panel = $("#backendStatusPanel");
  if (panel) {
    panel.textContent = online ? "Online" : "Offline";
    panel.style.opacity = online ? "1" : ".65";
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

async function addItem(kind, title, subtitle = "Created by command core", details = "") {
  const { data: row, error } = await supabase.from("pdw_items").insert({
    client_id: clientId, kind, title, subtitle, details
  }).select().single();
  if (error) throw error;
  return row;
}

async function runCommand(raw) {
  const c = raw.trim();
  if (!c) return;
  $("#response").classList.add("show");
  $("#responseText").textContent = "Executing…";

  const parsed = parseCommand(c);
  let response = "";

  try {
    if (parsed?.action === "open_url") {
      window.open(parsed.url, "_blank", "noopener,noreferrer");
      response = `Opening ${parsed.label}.`;
    } else if (parsed?.action === "message") {
      const encoded = encodeURIComponent(parsed.message || "");
      const url = `https://wa.me/${parsed.phone}${encoded ? `?text=${encoded}` : ""}`;
      window.open(url, "_blank", "noopener,noreferrer");
      response = parsed.message ? "Opening WhatsApp with your message ready to send." : "Opening WhatsApp chat.";
    } else if (parsed?.action === "show") {
      await show(parsed.target);
      response = `Opening ${parsed.target}.`;
    } else if (parsed?.action === "add") {
      await addItem(parsed.kind, parsed.title, parsed.kind === "tasks" ? "PENDING" : "Saved");
      data = await loadData();
      await show(parsed.kind);
      response = parsed.kind === "tasks"
        ? `Task created: ${parsed.title}`
        : parsed.kind === "projects"
          ? `Project created: ${parsed.title}`
          : `Saved to memory: ${parsed.title}`;
    } else if (parsed?.action === "complete") {
      const { data: matches, error: findError } = await supabase.from("pdw_items")
        .select("id,title").eq("client_id", clientId).eq("kind", "tasks")
        .ilike("title", `%${parsed.query}%`).limit(1);
      if (findError) throw findError;
      if (!matches?.length) {
        response = `I couldn't find a task matching "${parsed.query}".`;
      } else {
        const { error } = await supabase.from("pdw_items")
          .update({ status: "completed", subtitle: "COMPLETED" }).eq("id", matches[0].id);
        if (error) throw error;
        data = await loadData();
        await show("tasks");
        response = `Completed: ${matches[0].title}`;
      }
    } else if (parsed?.action === "delete") {
      const { data: matches, error: findError } = await supabase.from("pdw_items")
        .select("id,title").eq("client_id", clientId).ilike("title", `%${parsed.query}%`).limit(1);
      if (findError) throw findError;
      if (!matches?.length) {
        response = `I couldn't find "${parsed.query}".`;
      } else {
        const { error } = await supabase.from("pdw_items").delete().eq("id", matches[0].id);
        if (error) throw error;
        data = await loadData();
        response = `Deleted: ${matches[0].title}`;
      }
    } else if (parsed?.action === "search") {
      const { data: matches, error } = await supabase.from("pdw_items")
        .select("kind,title,subtitle,details").eq("client_id", clientId)
        .or(`title.ilike.%${parsed.query}%,details.ilike.%${parsed.query}%`).limit(12);
      if (error) throw error;
      $("#crumb").textContent = "SEARCH";
      $("#view").classList.add("show");
      $("#viewTitle").textContent = `Search: ${parsed.query}`;
      $("#cards").className = "cards";
      $("#cards").innerHTML = matches.length
        ? matches.map(x => `<article class="card"><h3>${esc(x.title)}</h3><p><b>${esc(x.kind)}</b><br>${esc(x.subtitle)}<br>${esc(x.details)}</p></article>`).join("")
        : "<article class='card'><h3>No results</h3><p>Nothing matched your command.</p></article>";
      response = `Search complete: ${matches.length} result(s).`;
    } else if (parsed?.action === "time") {
      response = `It is ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
    } else {
      response = `I received "${c}". Try: "show projects", "add task …", "remember …", "create project …", "complete task …", or "search …".`;
    }

    $("#responseText").textContent = response;
    const { error: historyError } = await supabase.from("pdw_commands").insert({
      client_id: clientId, command: c, response
    });
    if (historyError) console.warn("Command history could not be saved:", historyError.message);
  } catch (error) {
    console.error("Command failed:", error);
    $("#responseText").textContent = `Command failed: ${error.message}`;
    setBackendStatus("Backend: degraded", false);
  }
}


