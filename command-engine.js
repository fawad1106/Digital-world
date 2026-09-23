const SECTION_ALIASES = {
  home: "home", today: "calendar", calendar: "calendar", schedule: "calendar",
  file: "files", files: "files", app: "apps", apps: "apps",
  project: "projects", projects: "projects", memory: "memory",
  notification: "notifications", notifications: "notifications",
  connection: "connections", connections: "connections",
  setting: "settings", settings: "settings"
};

export function parseCommand(raw) {
  const input = raw.trim();
  if (!input) return null;
  const lower = input.toLowerCase();

  let m = lower.match(/^(?:show|open|go to|take me to)\s+(?:my\s+)?(.+)$/i);
  if (m) {
    const key = m[1].trim().replace(/^(everything i need to do )?today$/, "today");
    const target = SECTION_ALIASES[key];
    if (target) return { action: "show", target };
    if (key === "today") return { action: "show", target: "calendar" };
  }

  m = input.match(/^add\s+(?:a\s+)?task\s+(.+)$/i);
  if (m) return { action: "add", kind: "tasks", title: m[1].trim() };

  m = input.match(/^(?:remember|save)\s+(?:that\s+)?(.+)$/i);
  if (m) return { action: "add", kind: "memory", title: m[1].trim() };

  m = input.match(/^(?:add|create)\s+(?:a\s+)?project\s+(.+)$/i);
  if (m) return { action: "add", kind: "projects", title: m[1].trim() };

  m = input.match(/^(?:add|write)\s+(?:a\s+)?note\s+(.+)$/i);
  if (m) return { action: "add", kind: "memory", title: m[1].trim() };

  m = input.match(/^(?:complete|finish|done)\s+(?:task\s+)?(.+)$/i);
  if (m) return { action: "complete", kind: "tasks", query: m[1].trim() };

  m = input.match(/^(?:delete|remove)\s+(?:task\s+)?(.+)$/i);
  if (m) return { action: "delete", query: m[1].trim() };

  m = input.match(/^(?:search|find)\s+(.+)$/i);
  if (m) return { action: "search", query: m[1].trim() };

  if (/^(?:what(?:'s| is)\s+)?(?:the\s+)?time(?:\s+is\s+it)?[?]?$/i.test(input)) {
    return { action: "time" };
  }

  if (/^(?:add\s+task|remember|save|add\s+project|create\s+project|add\s+note|write\s+note|complete(?:\s+task)?|finish(?:\s+task)?|done(?:\s+task)?|delete(?:\s+task)?|remove(?:\s+task)?|search|find)$/i.test(input)) return null;
  return { action: "unknown", raw: input };
}
