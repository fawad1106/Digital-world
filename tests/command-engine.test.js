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

test("parses web search", () => {
  assert.deepEqual(parseCommand("search Google for Python tutorials"), { action:"search_web", query:"Python tutorials", engine:"google" });
});
test("parses email", () => {
  assert.deepEqual(parseCommand("email test@example.com saying Hello"), { action:"email", email:"test@example.com", message:"Hello" });
});
test("parses dial and SMS", () => {
  assert.deepEqual(parseCommand("call +92 300 1234567"), { action:"dial", phone:"923001234567" });
  assert.deepEqual(parseCommand("text +92 300 1234567 saying Hello"), { action:"sms", phone:"923001234567", message:"Hello" });
});
test("parses maps", () => {
  assert.deepEqual(parseCommand("find maps for Lahore"), { action:"maps", query:"Lahore" });
});
