import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
});

export async function embedAndStore(docs, docId, userId) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });

  const docsWithMeta = docs.map((doc) => ({
    ...doc,
    metadata: { ...doc.metadata, docId, userId },
  }));

  const vectorStore = await QdrantVectorStore.fromDocuments(
    docsWithMeta,
    embeddings,
    {
      client,
      collectionName: 'rag_data',
    }
  );

  console.log('Data embedded and stored successfully.', docId);
  return vectorStore;
}
