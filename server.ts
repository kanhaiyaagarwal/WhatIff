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
  const PORT = 3000;

  app.use(express.json());

  // AI Insight API Route
  app.post('/api/ai/insight', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Debug: List available environment variables related to keys
    const envKeys = Object.keys(process.env).filter(k => 
      k.includes('API') || k.includes('KEY') || k.includes('GEMINI') || k.includes('GOOGLE')
    );
    console.log('Available environment keys:', envKeys);

    // Try multiple common environment variable names for the Gemini API key
    const potentialKeys = [
      process.env.GEMINI_API_KEY,
      process.env.API_KEY,
      process.env.GOOGLE_API_KEY,
      process.env.VITE_GEMINI_API_KEY
    ].filter(k => k && k !== 'undefined' && k.trim() !== '' && k !== 'MY_GEMINI_API_KEY');

    const apiKey = potentialKeys[0];

    if (!apiKey) {
      console.error('Gemini API Key is missing or invalid on server. Available keys:', envKeys);
      return res.status(500).json({ 
        error: 'Gemini API Key is missing or invalid on server',
        availableKeys: envKeys 
      });
    }

    console.log(`Using API Key starting with: ${apiKey.substring(0, 4)}... (length: ${apiKey.length})`);

    const ai = new GoogleGenAI({ apiKey });
    
    // Try fallback chain: gemini-2.0-flash -> gemini-2.0-flash-exp -> gemini-1.5-flash
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`Attempting AI generation with ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            temperature: 0.4,
            topP: 0.8,
            maxOutputTokens: 400,
          }
        });

        if (response && response.text) {
          console.log(`Successfully generated insight using ${modelName}`);
          return res.json(response);
        }
        
        throw new Error(`Empty response from ${modelName}`);
      } catch (error: any) {
        lastError = error;
        console.error(`Error with ${modelName}:`, error.message || error);
        
        // If it's a safety error, don't retry with other models as they likely will also fail
        if (error.message?.includes('SAFETY') || error.status === 'SAFETY') {
          return res.status(400).json({ error: 'Safety restriction', details: error });
        }
        
        // If it's an API key error, don't retry with other models
        if (error.message?.includes('API key not valid') || error.status === 'INVALID_ARGUMENT') {
          return res.status(401).json({ error: 'Invalid API Key', details: error.message });
        }
        
        // Continue to next model in chain
        continue;
      }
    }

    console.error('All AI models failed. Last error:', lastError);
    res.status(500).json({ 
      error: 'AI Generation Failed', 
      message: lastError?.message || 'Unknown error',
      details: lastError 
    });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
