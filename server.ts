import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment. AI insights will be unavailable.');
  }

  // AI Insight API Route
  app.post('/api/ai/insight', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'A valid prompt is required.' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: 'AI service is not configured.' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Try fallback chain: gemini-2.5-flash -> gemini-2.0-flash-001 -> gemini-2.0-flash-lite
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite'];
    let lastError: any = null;

    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            temperature: 0.4,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        });

        const text = response?.text;
        if (!text) {
          throw new Error(`Empty response from ${modelName}`);
        }

        // Return in the format the frontend expects
        res.json({
          candidates: [{
            content: { parts: [{ text }] },
            finishReason: 'STOP',
          }]
        });
        return;
      } catch (error: any) {
        lastError = error;
        console.error(`Error with ${modelName}:`, error.message);

        // Safety errors won't be fixed by trying another model
        if (error.message?.includes('SAFETY') || error.status === 'SAFETY') {
          res.status(400).json({
            candidates: [{
              finishReason: 'SAFETY',
              content: { parts: [{ text: '' }] },
            }]
          });
          return;
        }

        // Invalid API key won't be fixed by trying another model
        if (error.message?.includes('API key not valid') || error.status === 'INVALID_ARGUMENT') {
          res.status(401).json({ error: 'AI service authentication failed.' });
          return;
        }
      }
    }

    console.error('All AI models failed:', lastError?.message);
    res.status(502).json({ error: 'AI service is temporarily unavailable.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
