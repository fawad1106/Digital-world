const SECTION_ALIASES = {
  home: "home", dashboard: "home", today: "calendar", day: "calendar",
  calendar: "calendar", schedule: "calendar", events: "calendar",
  file: "files", files: "files", documents: "files", document: "files",
  app: "apps", apps: "apps", applications: "apps",
  project: "projects", projects: "projects", work: "projects",
  memory: "memory", memories: "memory", notes: "memory", note: "memory",
  notification: "notifications", notifications: "notifications", alerts: "notifications",
  connection: "connections", connections: "connections", connected: "connections",
  setting: "settings", settings: "settings", preferences: "settings",
  task: "tasks", tasks: "tasks", todo: "tasks", todos: "tasks"
};

function clean(text) {
  return text.trim().replace(/[.!?]+$/, "").trim();
}

function result(action, extra = {}) {
  return { action, ...extra };
}

export function parseCommand(raw) {
  const input = clean(raw);
  if (!input) return null;
  const lower = input.toLowerCase();

  // Navigation / viewing
  let m = lower.match(/^(?:show|open|view|display|go to|take me to|bring up|pull up|let me see|check)\s+(?:my\s+)?(.+)$/i);
  if (m) {
    let key = clean(m[1]);
    key = key.replace(/^(?:everything|all)\s+(?:i\s+)?need\s+to\s+(?:do|see)\s+/i, "");
    const target = SECTION_ALIASES[key];
    if (target) return result("show", { target });
    if (/^(?:what'?s|what is)\s+(?:on|for)\s+today$/i.test(key) || key === "today") {
      return result("show", { target: "calendar" });
    }
  }

  // Tasks
  m = input.match(/^(?:add|create|make|new|set up)\s+(?:a\s+)?(?:new\s+)?(?:task|todo|to-do)\s*(?:to|for|called|named)?\s+(.+)$/i);
  if (m) return result("add", { kind: "tasks", title: clean(m[1]) });

  m = input.match(/^(?:remind me to|i need to|i have to|i should)\s+(.+)$/i);
  if (m) return result("add", { kind: "tasks", title: clean(m[1]) });

  m = input.match(/^(?:complete|finish|done|mark)\s+(?:the\s+)?(?:task|todo|to-do)?\s*(.+)$/i);
  if (m) return result("complete", { kind: "tasks", query: clean(m[1]).replace(/\s+(?:as\s+)?(?:completed|done)$/i, "") });

  m = input.match(/^(?:delete|remove|cancel|trash)\s+(?:the\s+)?(?:task|todo|to-do)?\s*(.+)$/i);
  if (m) return result("delete", { kind: "tasks", query: clean(m[1]) });

  // Projects
  m = input.match(/^(?:add|create|make|start|new)\s+(?:a\s+)?(?:new\s+)?project\s*(?:called|named|for)?\s+(.+)$/i);
  if (m) return result("add", { kind: "projects", title: clean(m[1]) });

  // Memory / notes
  m = input.match(/^(?:remember|save|store|keep|note|make a note)\s+(?:that\s+)?(.+)$/i);
  if (m) return result("add", { kind: "memory", title: clean(m[1]) });

  m = input.match(/^(?:add|write|create)\s+(?:a\s+)?(?:note|memory)\s*(?:saying|about)?\s+(.+)$/i);
  if (m) return result("add", { kind: "memory", title: clean(m[1]) });

  // Search
  m = input.match(/^(?:search|find|look for|look up|locate)\s+(?:for\s+)?(.+)$/i);
  if (m) return result("search", { query: clean(m[1]) });

  // Device / web actions
  if (/^(?:open|launch|start|go to)\s+(?:youtube|youtube\.com)$/i.test(input)) return result("open_url", { url: "https://www.youtube.com/", label: "YouTube" });
  if (/^(?:open|launch|start|go to)\s+(?:google|google\.com)$/i.test(input)) return result("open_url", { url: "https://www.google.com/", label: "Google" });
  if (/^(?:open|launch|start|go to)\s+(?:spotify|spotify\.com)$/i.test(input)) return result("open_url", { url: "https://open.spotify.com/", label: "Spotify" });

  m = input.match(/^(?:open|launch|go to)\s+(https?:\/\/\S+)$/i);
  if (m) return result("open_url", { url: m[1], label: m[1] });

  // Messaging: the browser cannot look up a phone contact by name, but it can open WhatsApp when a number is supplied.
  m = input.match(/^(?:write|send|compose)\s+(?:a\s+)?message\s+to\s+(?:whatsapp\s+)?(\+?\d[\d\s-]{6,})\s*(?:saying|that\s+says|:)?\s*(.*)$/i);
  if (m) {
    const phone = m[1].replace(/[^\d]/g, "");
    const message = clean(m[2] || "");
    return result("message", { phone, message });
  }

  // Time
  if (/^(?:(?:what|tell me)\s+)?(?:is\s+)?(?:the\s+)?time(?:\s+is\s+it)?$/i.test(input)) {
    return result("time");
  }

  // Common incomplete command prefixes
  if (/^(?:show|open|view|display|go to|take me to|add(?:\s+(?:a\s+)?(?:task|todo|to-do|project|note|memory))?|create|make|new|remember|save|search|find|complete|finish|delete|remove|cancel|remind me to|i need to)$/i.test(input)) {
    return null;
  }

  return result("unknown", { raw: input });
}
