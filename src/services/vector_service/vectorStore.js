import { QdrantVectorStore } from '@langchain/qdrant';
import { embeddings, COLLECTION_NAME, qdrantClient } from '../../config/vectorStore.js';

export async function embedAndStore(docs) {
  const client = qdrantClient;
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
  const client = qdrantClient;
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.fileId', match: { any: fileIds } }],
    },
  });

}

export async function deleteEmbeddingsByNotebookIds(notebookIds) {
  const client = qdrantClient;
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.notebookId', match: { any: notebookIds } }],
    },
  });
}

export async function deleteEmbeddingsByUserIds(userIds) {
  const client = qdrantClient;
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: 'metadata.userId', match: { any: userIds } }],
    },
  });
}
