export function preprocessOCR(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9.,\n\s]/g, "")
    .replace(/(\d),(\d)/g, "$1.$2") 
    .replace(/[ ]{2,}/g, " ")
    .replace(/(\d)\s+(\d)/g, "$1.$2")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function formatForLLM(rawText: string): string {
  const lines = preprocessOCR(rawText)
    .split("\n")
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

  return `Extract items and prices from this receipt OCR output:\n${lines}`;
}
