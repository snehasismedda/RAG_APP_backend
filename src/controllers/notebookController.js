import * as notebookModel from '../models/notebookModel.js';

export const createNotebook = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const notebook = await notebookModel.createNotebook({
      title,
      description,
      userId,
    });

    res.status(201).json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotebooks = async (req, res) => {
  try {
    const userId = req.user.id;
    const notebooks = await notebookModel.getNotebooks(userId);
    res.status(200).json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotebookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notebook = await notebookModel.getNotebookById(id, userId);

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.status(200).json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const notebook = await notebookModel.updateNotebook(
      id,
      { title, description },
      userId
    );

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.status(200).json(notebook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotebook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await notebookModel.deleteNotebook(id, userId);

    if (result === 0) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.status(200).json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
