import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'text-embedding-004',
  apiKey: process.env.GOOGLE_API_KEY,
});

const COLLECTION_NAME = 'rag_data';

function getQdrantClient() {
  return new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });
}

export async function embedAndStore(docs) {
  const client = getQdrantClient();

  const vectorStore = await QdrantVectorStore.fromDocuments(
    docs,
    embeddings,
    {
      client,
      collectionName: COLLECTION_NAME,
    }
  );

  return vectorStore;
}

export async function deleteEmbeddingsByFileIds(fileIds) {
  const client = getQdrantClient();

  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.fileId', match: { any: fileIds } }],
    },
  });

}

export async function deleteEmbeddingsByNotebookIds(notebookIds) {
  const client = getQdrantClient();

  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.notebookId', match: { any: notebookIds } }],
    },
  });
}

export async function deleteEmbeddingsByUserIds(userIds) {
  const client = getQdrantClient();

  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.userId', match: { any: userIds } }],
    },
  });
}
