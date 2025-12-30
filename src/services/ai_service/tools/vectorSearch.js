import { search } from '../../vector_service/vectorSearch.js';

async function execute({ query, topK = 5, userId, notebookId, fileIds = [] }) {
  console.log(
    `[Tool: vectorSearch] Searching for queries: ${JSON.stringify(query)} with topK: ${topK}`
  );
  const results = await search({ query, topK, userId, notebookId, fileIds });
  console.log("::VECTOR_SEARCH_RESULTS:: ", JSON.stringify(results, null, 2));
  return results;
}

export const vectorSearchTool = {
  definition: {
    name: 'vectorSearch',
    description:
      'Performs semantic search over a vector database and returns the most relevant context. Use the tool to search for files or context in Vector database.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
          description:
            'Natural language queries that covers the user intent and context and can give best results covering various aspects of the user query.',
        },
        topK: {
          type: 'number',
          description: 'Number of results to return (default: 5).',
        },
      },
      required: ['query'],
    },
  },
  execute: execute,
};
