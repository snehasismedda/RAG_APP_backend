import { saveFile } from "../models/fileModel.js";
import { loadFile } from "../utils/fileLoader.js";
import { loadUrl } from "../utils/urlLoader.js";
import { embedAndStore } from "../utils/vectorStore.js";
import path from "path";
import fs from "fs";

export const ingestFile = async (req, res) => {
  const userId = req.user.id;
  try {
    let totalChunks = 0;
    for (const file of req.files) {
      console.log("Processing file:", file);
      const fileData = await saveFile({
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        userId: userId,
        notebookId: req.body.notebookId || null
      });
      console.log("Processing file:", fileData.id);
      const docs = await loadFile(file.path, file.mimetype);
      await embedAndStore(docs, fileData.id, req.body.notebookId, userId);
      console.log(`File processed and saved: ${file.originalname} with docId: ${fileData.id}`);
      totalChunks += docs.length;
    }
    res.json({ status: "success", chunks: totalChunks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const ingestUrl = async (req, res) => {
  try {
    console.log("Processing URL:", );
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    let docs;
    try {
      docs = await loadUrl(url);
    } catch (err) {
      return res.status(500).json({ error: "Failed to load URL: " + err.message });
    }

    let fileData;
    try {
      fileData = await saveFile({
        fileName: "URL",
        fileUrl: url,
        mimeType: "text/html",
        userId: userId,
        notebookId: req.body.notebookId || null
      });
    } catch (err) {
      return res.status(500).json({ error: "Saving file failed: " + err.message });
    }

    try {
      await embedAndStore(docs, fileData.id, req.body.notebookId, userId);
    } catch (err) {
      return res.status(500).json({ error: "Embedding failed: " + err.message });
    }

    return res.status(201).json({ status: "success", chunks: docs.length });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


export const ingestText = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }
    const uploadsDir = path.join(process.cwd(), "uploads");
    console.log("Uploads directory:", uploadsDir);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a filename (could include userId + timestamp for uniqueness)
    const fileName = `${userId || "guest"}_${Date.now()}.txt`;
    const filePath = path.join(uploadsDir, fileName);

    // Write the text into the file
    fs.writeFileSync(filePath, text, "utf-8");

    const docs = await loadFile(filePath, "text/plain");
    const fileData = await saveFile({
      fileName: fileName,
      filePath: `uploads/${fileName}`,
      mimeType: "text/plain",
      userId: userId,
      notebookId: req.body.notebookId || null
    });
    await embedAndStore(docs, fileData.id, req.body.notebookId, userId);
    // console.log(`File processed and saved: ${fileName} with docId: ${docId}`);
    res.status(201).json({
      message: "Text saved as .txt file successfully",
      fileName,
      filePath,
    });
  } catch (err) {
    console.error("Error saving text:", err);
    res.status(500).json({ error: "Failed to save text" });
  }
};