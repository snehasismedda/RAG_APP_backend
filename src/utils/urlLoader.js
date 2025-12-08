import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { MarkdownTextSplitter } from '@langchain/textsplitters';

export async function loadUrl(url) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  const splitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  return await splitter.splitDocuments(docs);
}
