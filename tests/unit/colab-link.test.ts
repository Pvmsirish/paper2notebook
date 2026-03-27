import { describe, it, expect } from "vitest";
import { downloadNotebook } from "@/lib/colab-link";

describe("downloadNotebook", () => {
  it("is a function", () => {
    expect(typeof downloadNotebook).toBe("function");
  });
});
