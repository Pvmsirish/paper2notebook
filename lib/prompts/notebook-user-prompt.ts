export function buildUserPrompt(paperText: string): string {
  return `Please analyze the following research paper and generate a complete, production-quality Jupyter notebook implementing its core algorithms and methodology.

## Paper Content

<paper>
${paperText}
</paper>

## Instructions

1. Carefully read and understand the paper's key contributions and methods
2. Generate all 9 required notebook sections as specified in your system instructions
3. Ensure all code is runnable in Google Colab
4. Use synthetic data that meaningfully demonstrates the algorithm's behavior
5. Include detailed explanations that would help an ML researcher understand and build upon this work

Generate the complete notebook now.`;
}
