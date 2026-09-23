import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../command-engine.js";

test("parses open youtube as a real web action", () => {
  assert.deepEqual(parseCommand("open youtube"), {
    action: "open_url",
    url: "https://www.youtube.com/",
    label: "YouTube"
  });
});

test("parses WhatsApp message commands with a phone number", () => {
  assert.deepEqual(parseCommand("write a message to +92 300 1234567 saying Hello"), {
    action: "message",
    phone: "923001234567",
    message: "Hello"
  });
});
