import { prepareHistory } from '../utils/prepareHistory.js';
import { generateResponse } from '../services/ai_service/response/index.js';
import { saveConversation } from '../models/conversationModel.js';
import * as chatModel from '../models/chatModel.js';

// Send message and store conversation
export const chat = async (req, res) => {
  try {
    const {
      query,
      model,
      modelId,
      temperature,
      maxOutputTokens,
      systemInstruction,
      notebookId,
      chatId,
    } = req.body;

    const userId = req.user?.id;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    const history = await prepareHistory({ notebookId, chatId, model });

    const response = await generateResponse({
      query,
      model,
      modelId,
      temperature,
      maxOutputTokens,
      systemInstruction,
      history,
    });

    // Save user message to conversation
    await saveConversation({
      message: [{ text: query }],
      role: 'user',
      chatId,
      notebookId,
      userId,
    });

    // Save AI response to conversation
    await saveConversation({
      message: [{ text: response }],
      role: 'assistant',
      chatId,
      notebookId,
      userId,
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

    const chat = await chatModel.updateChat(id, { title }, userId);

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

    const result = await chatModel.deleteChat(id, userId);

    if (result === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
