import * as notebookModel from '../models/notebookModel.js';
import * as chatModel from '../models/chatModel.js';
import * as fileModel from '../models/fileModel.js';
import { deletionQueue } from '../queues/index.js';

// Create a new notebook
export const createNotebook = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const notebook = await notebookModel.createNotebook({ title, description, userId });
    res.status(201).json(notebook);
  } catch (error) {
    res.status(500).json({ error: "Failed to create notebook" });
  }
};

// Get all notebooks for a user
export const getNotebooks = async (req, res) => {
  try {
    const userId = req.user.id;
    const notebooks = await notebookModel.getNotebooksByUserIds({ userIds: [userId] });
    res.status(200).json(notebooks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get notebooks" });
  }
};

// Get a specific notebook by ID
export const getNotebookContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const promises = [
      notebookModel.getNotebooksByIds({ notebookIds: [id], userId }),
      chatModel.getChatsByNotebookIds({ notebookIds: [id], userId }),
      fileModel.getFilesByNotebookIds({ notebookIds: [id], userId })
    ];
    const [notebook, chats, files] = await Promise.all(promises);


    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.status(200).json({ notebook, chats, files });
  } catch (error) {
    res.status(500).json({ error: "Failed to get notebook content" });
  }
};

// Update a specific notebook by ID
export const updateNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const notebook = await notebookModel.updateNotebookById({
      notebookId: id,
      updates: { title, description },
      userId
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.status(200).json(notebook);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notebook" });
  }
};

// Delete a specific notebook by ID
export const deleteNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notebook = await notebookModel.getNotebooksByIds({ notebookIds: [id], userId });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    deletionQueue.add('DELETE_NOTEBOOK', {
      type: 'DELETE_NOTEBOOK',
      notebookId: id,
      userId
    }, {
      jobId: `Job-delete-notebook-${id}`,
    });

    res.status(200).json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notebook" });
  }
};
