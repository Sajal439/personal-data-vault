import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFileStream } from "./storage.service.js";
import { decryptBuffer } from "./encryption.service.js";
import { config } from "@repo/config";

// Initialize Gemini
const apiKey = config.geminiApiKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Helper to convert stream to buffer
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Processes a document through AI (OCR, Summarization, Expiry detection).
 */
export async function processDocumentWithAI(
  documentId: string,
  userId: string,
) {
  if (!genAI) {
    throw new ApiError(
      500,
      "AI Service is not configured (Missing GEMINI_API_KEY)",
    );
  }

  // 1. Fetch document metadata
  const doc = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!doc) throw new ApiError(404, "Document not found");
  if (doc.aiProcessed) return doc; // Already processed

  // 2. Download and decrypt the file
  let decryptedBuffer: Buffer;
  try {
    const encryptedStream = await getFileStream(doc.fileKey);
    const encryptedBuffer = await streamToBuffer(encryptedStream);

    decryptedBuffer = decryptBuffer(
      encryptedBuffer,
      doc.encryptionIv!,
      doc.encryptionTag!,
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to retrieve and decrypt document for AI processing",
    );
  }

  // 3. Prepare for Gemini (Supported mime types: PDF, images)
  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";

  if (!isImage && !isPdf && doc.mimeType !== "text/plain") {
    throw new ApiError(
      400,
      "Unsupported file type for AI processing (Only PDF, Images, Text supported)",
    );
  }

  // 4. Call Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this document. Please extract and return ONLY a JSON response with the following format (no markdown code blocks, just raw JSON):
    {
      "extractedText": "The full exact text extracted from the document",
      "summary": "A 1-2 sentence summary of what this document is",
      "expiryDate": "ISO8601 string of the expiry date if exists, otherwise null",
      "suggestedTags": ["tag1", "tag2"]
    }
  `;

  let aiResponseText = "";
  try {
    const filePart = {
      inlineData: {
        data: decryptedBuffer.toString("base64"),
        mimeType: doc.mimeType,
      },
    };

    const result = await model.generateContent([prompt, filePart]);
    aiResponseText = result.response.text();
  } catch (error: any) {
    console.error("Gemini processing error:", error.message);
    throw new ApiError(500, "AI processing failed");
  }

  // 5. Parse JSON
  let aiData;
  try {
    // Strip potential markdown formatting that LLMs sometimes add
    const cleanJsonStr = aiResponseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    aiData = JSON.parse(cleanJsonStr);
  } catch (e) {
    console.error("Failed to parse AI JSON:", aiResponseText);
    throw new ApiError(500, "Invalid JSON returned from AI");
  }

  // 6. Update Database
  const updateData: any = {
    aiProcessed: true,
    extractedText: aiData.extractedText,
  };

  if (aiData.expiryDate) {
    const expDate = new Date(aiData.expiryDate);
    if (!isNaN(expDate.getTime())) {
      updateData.expiryDate = expDate;
    }
  }

  const updatedDoc = await prisma.document.update({
    where: { id: documentId },
    data: updateData,
  });

  // 7. Auto-create expiry reminder if applicable
  if (updateData.expiryDate) {
    // Set reminder 30 days before expiry
    const reminderDate = new Date(updateData.expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30);

    // Only create if reminder date is in the future
    if (reminderDate > new Date()) {
      await prisma.reminder.create({
        data: {
          documentId,
          reminderDate,
        },
      });
    }
  }

  return updatedDoc;
}

/**
 * Ask the AI Assistant a question about the user's documents.
 */
export async function askAssistant(userId: string, query: string) {
  if (!genAI) {
    throw new ApiError(500, "AI Service is not configured");
  }

  // Find documents with extracted text.
  // In a full implementation, this should use vector embeddings for semantic search.
  // For MVP, we pass the text of recently AI-processed documents.
  const docs = await prisma.document.findMany({
    where: {
      folder: { vault: { userId } },
      aiProcessed: true,
      extractedText: { not: null },
    },
    select: { title: true, extractedText: true },
    take: 10, // Limit context size
  });

  if (docs.length === 0) {
    return "I don't have any processed documents to search through yet. Please upload and process some documents first.";
  }

  let contextString = "Here is the content of the user's documents:\n\n";
  for (const doc of docs) {
    // Truncate text to avoid blowing up context window
    const safeText = doc.extractedText!.substring(0, 3000);
    contextString += `--- Document: ${doc.title} ---\n${safeText}\n\n`;
  }

  const prompt = `
    You are a helpful Personal Data Assistant. Answer the user's question based strictly on the provided documents context below. 
    If the answer is not in the context, say "I don't have enough information in your documents to answer that."
    
    Context:
    ${contextString}

    User Question: ${query}
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
