import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import fs from 'fs';

export async function loadFile(filePath, mimeType) {
  let loader;
  let docs;
  
  switch (true) {
    case mimeType.includes('pdf'):
      loader = new PDFLoader(filePath);
      docs = await loader.load();
      break;

    case mimeType.includes('text'):
    case mimeType.includes('markdown'):
      // Custom text loading since TextLoader is not exported
      const textContent = fs.readFileSync(filePath, 'utf-8');
      docs = [{
        pageContent: textContent,
        metadata: { source: filePath }
      }];
      break;

    case mimeType.includes('doc'):
    case mimeType.includes('msword'):
      loader = new DocxLoader(filePath, {
        type: 'doc',
      });
      docs = await loader.load();
      break;

    case mimeType.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ):
      loader = new DocxLoader(filePath);
      docs = await loader.load();
      break;

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const splitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  return await splitter.splitDocuments(docs);
}
