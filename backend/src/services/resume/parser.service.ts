import mammoth from 'mammoth';

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

// pdf-parse has inconsistent exports across versions
// Handle both CommonJS default and named exports
const pdfParseImport: any = require('pdf-parse');
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  typeof pdfParseImport === 'function'
    ? pdfParseImport
    : pdfParseImport.default;

if (typeof pdfParse !== 'function') {
  throw new Error('Failed to load pdf-parse module');
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse PDF: ${message}`);
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse DOCX: ${message}`);
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }

  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDOCX(buffer);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

export function validateExtractedText(text: string): void {
  if (!text || text.length < 100) {
    throw new Error(
      'Extracted resume text is too short. Please upload a valid resume with readable text.'
    );
  }

  if (text.length > 50000) {
    throw new Error(
      'Extracted resume text is too long. Please upload a shorter resume.'
    );
  }
}