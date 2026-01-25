import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';

// Reads a text stream and returns the content as a string
export async function readTextStream(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

// Extracts text from a PDF stream
export async function extractPdfText(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const data = await pdf(buffer);
    return data.text;
}

// Extracts text from a DOCX stream
export async function extractDocxText(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

// Extracts text from a URL
export async function loadUrl(url) {
    const loader = new CheerioWebBaseLoader(url);
    const text = await loader.load();
    return text;
}

// Cleans extracted text by removing extra whitespace, control characters,
// and common web artifacts like CSS/JS
export function cleanText(text) {
    return text
        // Remove CSS blocks (inline styles, @media queries, etc.)
        .replace(/@media[^{]+\{[^}]*\}/g, '')
        .replace(/\.[\w-]+\s*\{[^}]*\}/g, '')
        .replace(/@[\w-]+[^{]*\{[^}]*(\{[^}]*\})*[^}]*\}/g, '')
        .replace(/\{[^}]*:[^}]*\}/g, '')
        // Remove JavaScript artifacts
        .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
        .replace(/\bvar\s+\w+\s*=[^;]+;/g, '')
        // Remove HTML-like content
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/&#\d+;/g, ' ')
        // Normalize whitespace
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/ +/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        // Remove lines that look like CSS selectors or classes
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            // Filter out CSS-like lines
            if (trimmed.startsWith('.mw-') || trimmed.startsWith('@')) return false;
            if (trimmed.includes('{') && trimmed.includes('}')) return false;
            if (trimmed.includes('!important')) return false;
            // Keep meaningful content
            return trimmed.length > 0;
        })
        .join('\n')
        .trim();
}

// Splits text into semantic chunks using LangChain's splitter
// Returns documents in LangChain format
export async function semanticChunk(text, metadata = {}) {
    const splitter = new MarkdownTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });

    const docs = await splitter.createDocuments([text], [metadata]);
    return docs;
}
