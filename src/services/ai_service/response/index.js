import { generateResponse as generateGeminiResponse } from './gemini.js';
import { toolRegistry } from '../tools/index.js';

export const generateResponse = async (data) => {
  const { model } = data;
  try {
    switch (model.toLowerCase()) {
      case 'gemini':
        return await _generateGeminiAiResponse(data);
      default:
        throw new Error(`Model '${model}' not supported.`);
    }
  } catch (error) {
    throw error;
  }
};

const _generateGeminiAiResponse = async (data) => {
  try {
    const response = await generateGeminiResponse(data);
    console.log(JSON.stringify(response, null, 2));

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return 'No response generated.';
    }

    const functionCalls = parts.filter((part) => part.functionCall);

    if (functionCalls.length === 0) {
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      }
      return 'No response generated.';
    } else {
      const functionResponses = await Promise.all(
        functionCalls.map(async (part) => {
          const call = part.functionCall;
          const toolName = call.name;
          const toolArgs = call.args;

          const tool = toolRegistry[toolName];
          if (!tool) {
            console.error(`Tool '${toolName}' not found in registry`);
            return {
              functionResponse: {
                name: toolName,
                response: { error: `Tool '${toolName}' not found` },
              },
            };
          }

          try {
            const result = await tool(toolArgs);
            return {
              functionResponse: {
                name: toolName,
                response: { result },
              },
            };
          } catch (error) {
            console.error(`Error executing tool '${toolName}':`, error);
            return {
              functionResponse: {
                name: toolName,
                response: { error: error.message },
              },
            };
          }
        })
      );

      const conversationHistory = [
        ...data.history,
        { role: 'user', parts: [{ text: data.query }] },
        {
          role: 'model',
          parts: response.candidates[0].content.parts,
        },
        {
          role: 'function',
          parts: functionResponses,
        },
      ];

      return await _generateGeminiAiResponse({
        ...data,
        history: conversationHistory,
        query: '',
      });
    }
  } catch (error) {
    console.error('Error in Gemini AI response generation:', error);
    throw error;
  }
};
