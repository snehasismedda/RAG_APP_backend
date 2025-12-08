import { search } from '../../vectorService.js';

async function execute({ query, topK = 5 }) {
  console.log(
    `[Tool: vectorSearch] Searching for: "${query}" with topK: ${topK}`
  );
  const results = await search(query, topK);
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
          type: 'array',
          items: {
            type: 'string',
          },
          description:
            'One or more natural language queries for similarity search.',
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
