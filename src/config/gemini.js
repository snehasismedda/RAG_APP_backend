import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
