import { toolDefinitions } from '../tools/index.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const generateResponse = async (data) => {
  try {
    const {
      query,
      history,
      modelId = 'gemini-2.0-flash',
      temperature = 0.7,
      maxOutputTokens = 1024,
      systemInstruction = 'You are a helpful assistant.',
    } = data;

    const config = {
      temperature: temperature,
      maxOutputTokens: maxOutputTokens,
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: toolDefinitions }],
      toolChoice: 'auto',
    };

    // Only add user turn if query is not empty
    const content = query
      ? [...history, { role: 'user', parts: [{ text: query }] }]
      : history;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: content,
      config: config,
    });

    return response;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};
