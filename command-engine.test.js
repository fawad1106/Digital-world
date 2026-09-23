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


test("understands navigation synonyms", () => {
  assert.deepEqual(parseCommand("bring up my documents"), { action: "show", target: "files" });
  assert.deepEqual(parseCommand("take me to my todos"), { action: "show", target: "tasks" });
});

test("understands natural task requests", () => {
  assert.deepEqual(parseCommand("remind me to study physics"), {
    action: "add", kind: "tasks", title: "study physics"
  });
  assert.deepEqual(parseCommand("I need to finish my assignment"), {
    action: "add", kind: "tasks", title: "finish my assignment"
  });
});

test("understands natural project and memory requests", () => {
  assert.deepEqual(parseCommand("start a project called Website"), {
    action: "add", kind: "projects", title: "Website"
  });
  assert.deepEqual(parseCommand("save that my exam is Friday"), {
    action: "add", kind: "memory", title: "my exam is Friday"
  });
});

test("understands search synonyms", () => {
  assert.deepEqual(parseCommand("look for physics"), {
    action: "search", query: "physics"
  });
});

test("understands task management synonyms", () => {
  assert.deepEqual(parseCommand("mark task Physics as completed"), {
    action: "complete", kind: "tasks", query: "Physics"
  });
  assert.deepEqual(parseCommand("cancel task Physics"), {
    action: "delete", kind: "tasks", query: "Physics"
  });
});
