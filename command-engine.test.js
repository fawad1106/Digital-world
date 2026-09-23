import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "./command-engine.js";

test("parses show commands", () => {
  assert.deepEqual(parseCommand("show my projects"), { action: "show", target: "projects" });
});

test("parses task creation", () => {
  assert.deepEqual(parseCommand("add task Finish physics assignment"), {
    action: "add", kind: "tasks", title: "Finish physics assignment"
  });
});

test("parses note creation", () => {
  assert.deepEqual(parseCommand("remember Buy a new notebook"), {
    action: "add", kind: "memory", title: "Buy a new notebook"
  });
});

test("parses project creation", () => {
  assert.deepEqual(parseCommand("create project Anime Edit"), {
    action: "add", kind: "projects", title: "Anime Edit"
  });
});

test("parses completion", () => {
  assert.deepEqual(parseCommand("complete task Finish physics"), {
    action: "complete", kind: "tasks", query: "Finish physics"
  });
});

test("parses search", () => {
  assert.deepEqual(parseCommand("search physics notes"), {
    action: "search", query: "physics notes"
  });
});

test("rejects empty create commands", () => {
  assert.equal(parseCommand("add task"), null);
});
