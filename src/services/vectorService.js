import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export async function search({query, topK = 5}) {
  console.log(`Searching for: "${query}" with topK: ${topK}`);
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GOOGLE_API_KEY,
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
