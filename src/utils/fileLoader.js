import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';

export async function loadFile(filePath, mimeType) {
  let loader;
  switch (true) {
    case mimeType.includes('pdf'):
      loader = new PDFLoader(filePath);
      break;

    case mimeType.includes('text'):
    case mimeType.includes('markdown'):
      loader = new TextLoader(filePath);
      break;

    case mimeType.includes('doc'):
    case mimeType.includes('msword'):
      loader = new DocxLoader(filePath, {
        type: 'doc',
      });
      break;

    case mimeType.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ):
      loader = new DocxLoader(filePath);
      break;

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const docs = await loader.load();

  const splitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  return await splitter.splitDocuments(docs);
}
