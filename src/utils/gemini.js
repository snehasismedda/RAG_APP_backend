import _ from 'lodash';

// Prepare conversation history for Gemini API
// Converts from database format to Gemini format
export const prepareHistoryForGemini = ({ conversationHistory }) => {
  console.log("::HISTORY from prepareHistoryForGemini:: ", JSON.stringify(conversationHistory, null, 2));
  return conversationHistory
    .map((item) => {
      const metadata =
        typeof item.metadata === 'string'
          ? JSON.parse(item.metadata)
          : item.metadata;

      if (item.role === 'assistant') {
        // Check if this has tool calls
        if (metadata && metadata.toolCalls) {
          // Convert toolCalls to Gemini's functionCall format
          return {
            role: 'model',
            parts: metadata.toolCalls.map((tc) => ({
              functionCall: {
                name: tc.function.name,
                args: tc.function.arguments,
              },
            })),
          };
        } else {
          // Regular text response
          return {
            role: 'model',
            parts: [{ text: item.content }],
          };
        }
      } else if (item.role === 'user') {
        return {
          role: 'user',
          parts: [{ text: item.content }],
        };
      }
      return null;
    })
    .filter(Boolean);
};

// Prepare data to save conversations for Gemini
// Converts from Gemini response format to database format
export const prepareDataToSaveConversationsForGemini = ({
  conversationHistory,
}) => {
  return _.map(conversationHistory, (item) => {
    if (item.role === 'model') {
      // Check if this has function calls
      const hasFunctionCalls = item.parts?.some((part) => part.functionCall);

      if (hasFunctionCalls) {
        // Convert to toolCalls format
        const toolCalls = item.parts
          .filter((part) => part.functionCall)
          .map((part, index) => ({
            id: `toolId_${Date.now()}_${index}`,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: part.functionCall.args,
            },
          }));

        return {
          role: 'assistant',
          content: '', // Empty content for tool calls
          metadata: { toolCalls },
        };
      } else {
        // Regular text response
        const text = item.parts?.find((part) => part.text)?.text || '';
        return {
          role: 'assistant',
          content: text,
          metadata: {},
        };
      }
    } else if (item.role === 'user') {
      const text = item.parts?.find((part) => part.text)?.text || '';
      return {
        role: 'user',
        content: text,
        metadata: {},
      };
    } else if (item.role === 'function') {
      // Function responses are handled separately in the flow
      return null;
    }
  }).filter(Boolean);
};

