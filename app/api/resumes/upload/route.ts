import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage/r2";
import { parsePdf } from "@/lib/parser/pdf";
import { parseDocx } from "@/lib/parser/docx";
import { executeLlmTask } from "@/lib/ai/llm";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobId = formData.get("jobId") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file was uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name;
    const fileType = file.type || (fileName.endsWith(".pdf") ? "application/pdf" : "application/docx");

    // Code-based text extraction initial pass
    let codeExtractedText = "";
    try {
      if (fileName.toLowerCase().endsWith(".pdf") || fileType.includes("pdf")) {
        codeExtractedText = await parsePdf(buffer);
      } else if (
        fileName.toLowerCase().endsWith(".docx") ||
        fileName.toLowerCase().endsWith(".doc") ||
        fileType.includes("word")
      ) {
        codeExtractedText = await parseDocx(buffer);
      } else {
        codeExtractedText = buffer.toString("utf-8");
      }
    } catch (codeErr) {
      console.warn("Initial code text extraction warning:", codeErr);
    }

    let finalRawText = "";

    // ----------------------------------------------------------------------
    // Primary Extraction: Try LLM Text Content Extraction First
    // ----------------------------------------------------------------------
    try {
      if (codeExtractedText && codeExtractedText.trim().length > 0) {
        const llmExtractPrompt = `Extract and clean up all text content from the following raw resume document. Preserve candidate name, contact info, technical skills, work history, education, and achievements in clean, readable text format:\n\n${codeExtractedText.slice(0, 7000)}`;
        const llmExtracted = await executeLlmTask(
          llmExtractPrompt,
          "You are an expert HR Document Extractor. Cleanly extract full text content without markdown code blocks."
        );
        if (llmExtracted && llmExtracted.trim().length > 30) {
          finalRawText = llmExtracted.trim();
        }
      }
    } catch (llmErr) {
      console.warn("LLM resume content extraction failed, falling back to code parser text:", llmErr);
    }

    // ----------------------------------------------------------------------
    // Fallback Extraction: Use Code Parser Text
    // ----------------------------------------------------------------------
    if (!finalRawText || finalRawText.trim().length === 0) {
      finalRawText = codeExtractedText;
    }

    if (!finalRawText || finalRawText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Unable to extract readable text from document." },
        { status: 422 }
      );
    }

    // Upload to Cloudflare R2 / S3 or local storage
    const storageRecord = await uploadFile(`${Date.now()}_${fileName}`, buffer, fileType);

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        fileType,
        jobId,
        rawText: finalRawText,
        fileUrl: storageRecord.url,
        fileKey: storageRecord.key,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process resume file." },
      { status: 500 }
    );
  }
}
