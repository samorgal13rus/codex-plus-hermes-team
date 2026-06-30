import { describe, expect, it } from "vitest";
import {
  buildMemoryOsFailClosedResponse,
  buildSpecialistPrompt,
  parseProfileList,
  shouldFailClosedForMemoryOsTask
} from "../src/providers/hermes-cli.js";

describe("parseProfileList", () => {
  it("parses Hermes profile table output", () => {
    const output = `
 Profile          Model                        Gateway      Alias
 ───────────────    ───────────────────────────    ───────────    ────────────
  default         gpt-5.5                      stopped      —
 ◆team-core       gpt-5.5                      running      team
  team-reviewer   claude-sonnet-4.6            stopped      —
`;

    expect(parseProfileList(output)).toEqual([
      { profile: "default", model: "gpt-5.5", gateway: "stopped" },
      { profile: "team-core", model: "gpt-5.5", gateway: "running" },
      { profile: "team-reviewer", model: "claude-sonnet-4.6", gateway: "stopped" }
    ]);
  });
});

describe("buildSpecialistPrompt", () => {
  it("injects the Memory OS v5 guardrail before the task", () => {
    const prompt = buildSpecialistPrompt("mimir", "Check memory boundary.", "advice_only");

    expect(prompt).toContain("Memory OS v5 guardrail:");
    expect(prompt).toContain("C:\\KeliganMemory");
    expect(prompt).toContain("single clean memory surface");
    expect(prompt).toContain("needs_memory_context");
    expect(prompt).toContain("pending/receipt-backed");
    expect(prompt).toMatch(/Memory OS v5 guardrail:[\s\S]+Task:\nCheck memory boundary\./);
  });
});

describe("Memory OS v5 fail-closed guardrail", () => {
  it("blocks advice-only durable memory truth requests without supplied context", () => {
    expect(
      shouldFailClosedForMemoryOsTask(
        "What is the current truth in C:\\KeliganMemory about Alexey's Memory OS?",
        "advice_only"
      )
    ).toBe(true);

    expect(buildMemoryOsFailClosedResponse()).toContain("needs_memory_context");
  });

  it("allows source-backed context packs and read-only policy", () => {
    expect(
      shouldFailClosedForMemoryOsTask(
        "Memory OS context pack: source paths are supplied. Summarize this source-backed evidence.",
        "advice_only"
      )
    ).toBe(false);

    expect(
      shouldFailClosedForMemoryOsTask(
        "What is the current truth in C:\\KeliganMemory about Alexey's Memory OS?",
        "read_only"
      )
    ).toBe(false);
  });
});
