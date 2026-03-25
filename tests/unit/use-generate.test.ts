import { describe, it, expect } from "vitest";
import { GenerateStep, STEP_LABELS } from "@/lib/hooks/use-generate";

describe("GenerateStep constants", () => {
  it("defines all expected steps", () => {
    expect(GenerateStep.IDLE).toBe("idle");
    expect(GenerateStep.PARSING).toBe("parsing");
    expect(GenerateStep.ANALYZING).toBe("analyzing");
    expect(GenerateStep.GENERATING).toBe("generating");
    expect(GenerateStep.BUILDING).toBe("building");
    expect(GenerateStep.DONE).toBe("done");
    expect(GenerateStep.ERROR).toBe("error");
  });

  it("has labels for all non-idle steps", () => {
    expect(STEP_LABELS[GenerateStep.PARSING]).toBe("Parsing PDF...");
    expect(STEP_LABELS[GenerateStep.ANALYZING]).toBe("Analyzing paper...");
    expect(STEP_LABELS[GenerateStep.GENERATING]).toBe("Generating notebook...");
    expect(STEP_LABELS[GenerateStep.BUILDING]).toBe("Building .ipynb...");
    expect(STEP_LABELS[GenerateStep.DONE]).toBe("Done!");
  });
});
