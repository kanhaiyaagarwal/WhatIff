import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy
  app.post("/api/gemini", async (req, res) => {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || "gemini-2.0-flash",
        contents,
        config
      });
      res.json(response);
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // OAuth Configuration
  const GROWW_AUTH_URL = "https://groww.in/oauth/authorize";
  const GROWW_TOKEN_URL = "https://api.groww.in/v1/oauth/token";

  // 1. Endpoint to get the OAuth URL
  app.get("/api/auth/groww/url", (req, res) => {
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/groww/callback`;

    // For demo purposes, we'll redirect to a mock login page instead of real Groww
    const mockLoginUrl = `${appUrl}/mock-groww-login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({ url: mockLoginUrl });
  });

  // Mock Groww Login Page
  app.get("/mock-groww-login", (req, res) => {
    const { redirect_uri } = req.query;
    res.send(`
      <html>
        <head>
          <title>Login to Groww</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { background: #000; color: #fff; font-family: sans-serif; }
            .card { background: #111; border: 1px solid #222; border-radius: 24px; padding: 40px; width: 400px; }
            .btn { background: #00d09c; color: #000; font-weight: bold; padding: 12px; border-radius: 12px; width: 100%; cursor: pointer; }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen">
          <div class="card space-y-6">
            <div class="flex items-center gap-3">
              <img src="https://www.google.com/s2/favicons?domain=groww.in&sz=64" class="w-10 h-10" />
              <h1 class="text-2xl font-bold">Groww</h1>
            </div>
            <p class="text-zinc-400 text-sm">WhatIff is requesting access to your investment data.</p>
            <div class="space-y-4">
              <input type="email" placeholder="Email" class="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-[#00d09c]" value="user@example.com" readonly />
              <input type="password" placeholder="Password" class="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-[#00d09c]" value="••••••••" readonly />
            </div>
            <button onclick="window.location.href='${redirect_uri}?code=mock_code'" class="btn">Authorize & Connect</button>
            <p class="text-[10px] text-zinc-600 text-center">This is a secure demo environment.</p>
          </div>
        </body>
      </html>
    `);
  });

  // 2. OAuth Callback Handler
  app.get("/auth/groww/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'GROWW_AUTH_ERROR', error: 'No code provided' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    try {
      // In a real app, you'd exchange the code for tokens here
      // const response = await fetch(GROWW_TOKEN_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: new URLSearchParams({
      //     grant_type: 'authorization_code',
      //     code: code as string,
      //     client_id: process.env.GROWW_CLIENT_ID!,
      //     client_secret: process.env.GROWW_CLIENT_SECRET!,
      //     redirect_uri: `${process.env.APP_URL}/auth/groww/callback`,
      //   }),
      // });
      // const tokens = await response.json();
      
      // For this demo, we'll simulate success
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GROWW_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Groww OAuth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
