import { generateResponse as generateGeminiResponse } from './gemini.js';
import { toolRegistry } from '../tools/index.js';
import { saveConversations } from '../../../models/conversationModel.js';

export const generateResponse = async (data) => {
  const { model } = data;
  try {
    switch (model.toLowerCase()) {
      case 'gemini':
        const result = await _generateGeminiAiResponse(data);
        return result;
      default:
        throw new Error(`Model '${model}' not supported.`);
    }
  } catch (error) {
    throw error;
  }
};

const _generateGeminiAiResponse = async (data, conversationsToSave = []) => {

  if (data.query) {
    conversationsToSave.push({
      role: 'user',
      content: data.query,
      metadata: {},
    });
  }

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
        const textResponse = response.candidates[0].content.parts[0].text;

        conversationsToSave.push({
          role: 'assistant',
          content: textResponse,
          metadata: {},
        });

        console.log("::CONVERSATIONS:: ", conversationsToSave);

        await saveConversations({
          conversations: conversationsToSave,
          chatId: data.chatId,
          notebookId: data.notebookId,
          userId: data.userId,
          model: data.model,
          modelId: data.modelId,
        });

        return textResponse;
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
            const result = await tool({
              ...toolArgs,
              userId: data.userId,
              notebookId: data.notebookId,
              fileIds: data.fileIds,
            });
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

      // Convert function calls to toolCalls format
      const toolCalls = functionCalls.map((part, index) => ({
        id: `toolId_${Date.now()}_${index}`,
        type: 'function',
        function: {
          name: part.functionCall.name,
          arguments: part.functionCall.args,
        },
      }));

      // Always add assistant tool calls (including recursive rounds)
      conversationsToSave.push({
        role: 'assistant',
        content: '',
        metadata: {
          toolCalls: toolCalls,
        },
      });

      // Build history for recursive call in Gemini format
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

      // Recursive call with accumulated conversations array
      return await _generateGeminiAiResponse(
        {
          ...data,
          history: conversationHistory,
          query: '',
        },
        conversationsToSave
      );
    }
  } catch (error) {
    console.error('Error in Gemini AI response generation:', error);
    throw error;
  }
};
