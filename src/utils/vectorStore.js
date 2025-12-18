import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'text-embedding-004',
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function embedAndStore(docs, fileId, notebookId, userId) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });

  const docsWithMeta = docs.map((doc) => ({
    ...doc,
    metadata: { ...doc.metadata, fileId, notebookId, userId },
  }));

  const vectorStore = await QdrantVectorStore.fromDocuments(
    docsWithMeta,
    embeddings,
    {
      client,
      collectionName: 'rag_data',
    }
  );

  console.log('Data embedded and stored successfully.', fileId);
  return vectorStore;
}
