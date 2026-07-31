import mammoth from "mammoth";

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ? result.value.trim() : "";
  } catch (error) {
    console.error("Error parsing DOCX file:", error);
    throw new Error("Failed to parse DOCX document. Ensure it is a valid Word document.");
  }
}
