import { prepareHistory } from '../utils/prepareHistory.js';
import { generateResponse } from '../services/ai_service/response/index.js';
import {
  saveConversations,
  getConversationHistory,
} from '../models/conversationModel.js';
import * as chatModel from '../models/chatModel.js';
import { getSystemPrompt } from '../models/systemPromptModel.js';

// Send message and store conversation
export const chat = async (req, res) => {
  try {
    const {
      query,
      notebookId,
      chatId,
      aiData,
      fileIds
    } = req.body;

    const { model, modelId, promptKey, version, temperature, maxOutputTokens } = aiData;

    const userId = req.user?.id;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    const promises = [
      getSystemPrompt({ promptKey, version }),
      prepareHistory({ notebookId, chatId, model })
    ];
    const [systemInstruction, history] = await Promise.all(promises);
    console.log("::HISTORY:: ", JSON.stringify(history, null, 2));
    const response = await generateResponse({
      query,
      notebookId,
      chatId,
      userId,
      model,
      modelId,
      systemInstruction,
      history,
      temperature,
      maxOutputTokens,
      fileIds,
    });

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new chat in a notebook
export const createChat = async (req, res) => {
  try {
    const { title, notebookId } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!notebookId) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }

    const chat = await chatModel.createChat({ title, notebookId, userId });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all chats in a notebook
export const getChats = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const userId = req.user.id;

    const chats = await chatModel.getChats(notebookId, userId);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat by ID
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.getChatById(id, userId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update chat
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    const chat = await chatModel.updateChat({ id, userId, data: { title } });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete chat
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await chatModel.deleteChat({ id, userId });

    if (result === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getConversations = async (req, res) => {
  try {
    const { chatId, notebookId } = req.params;
    const userId = req.user.id;

    const conversations = await getConversationHistory({ chatId, notebookId, userId });

    const filteredConversations = conversations.filter((conversation) => conversation.content !== '');

    res.status(200).json(filteredConversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
