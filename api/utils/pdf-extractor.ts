import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable worker for Node.js environment
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer
 * @returns Extracted text content
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array
    const data = new Uint8Array(buffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
      verbosity: 0, // Suppress console warnings
      useWorkerFetch: false,
      isEvalSupported: false,
      disableAutoFetch: true,
      disableStream: true,
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: { str: string }) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up
    await pdf.destroy();
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
