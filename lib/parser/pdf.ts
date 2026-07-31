export async function parsePdf(buffer: Buffer): Promise<string> {
  // Step 1: Use direct library entry point to bypass pdf-parse index.js test file bug (test/data/05-versions-space.pdf)
  try {
    const pdfParseDirect = require("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParseDirect(buffer);
    if (data && data.text && data.text.trim().length > 0) {
      return data.text.trim();
    }
  } catch (error) {
    console.warn("Direct pdf-parse engine failed, trying default import:", error);
  }

  // Step 2: Try default pdf-parse import
  try {
    const pdfParseDefault = require("pdf-parse");
    const data = await pdfParseDefault(buffer);
    if (data && data.text && data.text.trim().length > 0) {
      return data.text.trim();
    }
  } catch (error) {
    console.warn("Default pdf-parse failed, attempting stream extraction fallback:", error);
  }

  // Step 3: Text stream extraction fallback for PDFs
  try {
    const rawString = buffer.toString("utf-8");
    const matches = rawString.match(/\(([^()]+)\)\s*T[jJ]/g);
    if (matches && matches.length > 0) {
      const text = matches
        .map((m) => m.replace(/[\(\)]/g, "").replace(/\s*T[jJ]/g, ""))
        .join(" ")
        .trim();
      if (text.length > 20) {
        return text;
      }
    }
  } catch {}

  throw new Error("Failed to parse PDF document. Ensure it is a valid non-encrypted PDF.");
}
