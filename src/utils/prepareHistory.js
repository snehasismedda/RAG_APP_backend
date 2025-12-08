import _ from 'lodash';
import { getConversationHistory } from '../models/conversationModel.js';

export const prepareHistory = async (data) => {
  const conversationHistory = await getConversationHistory(data);

  // Return empty array if no conversation history exists
  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  return _prepareModelSpecificHistory({
    model: data.model,
    conversationHistory,
  });
};

const _prepareModelSpecificHistory = ({ model, conversationHistory }) => {
  switch (model) {
    case 'gemini':
      return _.map(conversationHistory, (item) => {
        if (item.role === 'assistant') {
          if (item.metadata) {
            return {
              role: 'function',
              parts: item.metadata.parts,
            };
          } else {
            return {
              role: 'model',
              parts: item.message,
            };
          }
        } else {
          return {
            role: 'user',
            parts: item.message,
          };
        }
      });

    default:
      throw new Error('Invalid model');
  }
};
