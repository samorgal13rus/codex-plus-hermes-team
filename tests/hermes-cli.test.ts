import { describe, expect, it } from "vitest";
import { buildSpecialistPrompt, parseProfileList } from "../src/providers/hermes-cli.js";

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
