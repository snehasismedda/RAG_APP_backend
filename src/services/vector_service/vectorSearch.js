import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

export async function search({ query, topK = 5, userId, fileIds = [], notebookId }) {
  // Support both single query string and array of query strings for better search results
  const queries = Array.isArray(query) ? query : [query];

  console.log(`Searching for queries: ${JSON.stringify(queries)} with topK: ${topK}`);

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

    const must = [
      { key: 'metadata.userId', match: { value: userId } },
      { key: 'metadata.notebookId', match: { value: notebookId } },
    ];

    if (fileIds && fileIds.length > 0) {
      must.push({
        key: 'metadata.fileId',
        match: { any: fileIds },
      });
    }

    const filter = { must };

    // Execute searches for all queries in parallel
    const searchPromises = queries.map((q) =>
      vectorStore.similaritySearchWithScore(q, topK, filter)
    );

    const resultsWithScores = await Promise.all(searchPromises);
    // Flatten results and deduplicate
    const allResults = resultsWithScores.flat();

    // Deduplicate based on pageContent, keeping the result with the highest score
    const seenContent = new Map();
    for (const [doc, score] of allResults) {
      if (!seenContent.has(doc.pageContent) || seenContent.get(doc.pageContent).score < score) {
        seenContent.set(doc.pageContent, { doc, score });
      }
    }

    // Sort combined results by score and take topK
    const finalizedResults = Array.from(seenContent.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return finalizedResults.map(({ doc }) => ({
      text: doc.pageContent,
      metadata: doc.metadata,
    }));
  } catch (error) {
    console.error('Vector Service Error:', error);
    return [];
  }
}
