import _ from 'lodash';
import { getConversationHistory, saveConversations } from '../models/conversationModel.js';
import { prepareHistoryForGemini, prepareDataToSaveConversationsForGemini } from './gemini.js';

export const prepareHistory = async (data) => {
  const { model } = data;
  const conversationHistory = await getConversationHistory(data);

  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  switch (model) {
    case 'gemini':
      return prepareHistoryForGemini({ conversationHistory });
    default:
      throw new Error('Invalid model');
  }
};

export const prepareDataToSaveConversation = async (data) => { 
  const { model, conversationHistory } = data;
  let preparedData;
  switch (model) {
    case 'gemini':
      preparedData = prepareDataToSaveConversationsForGemini({conversationHistory });
      break;
    default:
      throw new Error('Invalid model');
  }
  return await saveConversations(preparedData);
}