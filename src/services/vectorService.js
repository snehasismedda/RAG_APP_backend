import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export async function search(query, topK = 5) {
  try {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: 'rag_data',
      }
    );

    const relevantChunks = await vectorStore.similaritySearch(query, topK);

    return relevantChunks.map((chunk) => ({
      text: chunk.pageContent,
      metadata: chunk.metadata,
    }));
  } catch (error) {
    console.error('Vector Service Error:', error);
    return [];
  }
}
