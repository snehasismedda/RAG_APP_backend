import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'text-embedding-004',
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function embedAndStore(docs) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });

  const vectorStore = await QdrantVectorStore.fromDocuments(
    docs,
    embeddings,
    {
      client,
      collectionName: 'rag_data',
    }
  );

  return vectorStore;
}
