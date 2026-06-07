import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request timeout middleware
  app.use((req, res, next) => {
    res.setTimeout(120000, () => {
      res.status(408).json({ error: "Request timeout." });
    });
    next();
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, maxOutputTokens = 8000, apiProvider, apiKey: clientApiKey, apiUrl, apiModel, useSearch } = req.body;
      
      // Input validation
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Prompt is required and must be a non-empty string." });
      }
      if (prompt.length > 100000) {
        return res.status(400).json({ error: "Prompt exceeds maximum allowed length." });
      }
      
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.NVIDIA_API_KEY;
      if (!apiKey && !apiUrl) {
        return res.status(401).json({ error: "API Key or Base URL not configured." });
      }

      let textResponse = "";
      let lastError: any;

      let isNvidia = apiProvider === "nvidia";
      let isOpenAI = apiProvider === "openai";
      let isCustomOpenAI = apiProvider === "custom";
      let isGemini = apiProvider === "gemini";
      
      // Auto-detect provider if key has a clear prefix
      if (apiKey?.startsWith("nvapi-")) {
        isNvidia = true;
        isOpenAI = false;
        isGemini = false;
      } else if (apiKey?.startsWith("sk-")) {
        isOpenAI = true;
        isNvidia = false;
        isGemini = false;
      }

      // Fallback logic if apiProvider is not provided
      if (!apiProvider && !isNvidia && !isOpenAI) {
        isCustomOpenAI = !!apiUrl && !apiUrl.includes("generativelanguage");
        isGemini = !isCustomOpenAI;
      }

      if (isNvidia || isOpenAI || isCustomOpenAI) {
        let retries = 5;
        let url = apiUrl || (isNvidia ? "https://integrate.api.nvidia.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions");
        
        if (url && !url.includes('/chat/completions') && !url.includes('/models/')) {
           url = url.replace(/\/$/, "") + (url.includes("/v1") ? "/chat/completions" : "/v1/chat/completions");
        }
        
        let model = apiModel || (isNvidia ? "meta/llama-3.1-70b-instruct" : "gpt-4o-mini");

        for (let i = 0; i < retries; i++) {
          try {
            const externalResp = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: typeof maxOutputTokens === 'number' ? maxOutputTokens : 8000
              })
            });
            
            if (!externalResp.ok) {
               const errText = await externalResp.text();
               throw new Error(errText);
            }
            
            const data = (await externalResp.json()) as any;
            textResponse = data.choices[0].message.content;
            break;
          } catch (e: any) {
            lastError = e;
            const errorMessage = e?.message || "";
            if (errorMessage.includes("503") || errorMessage.includes("429")) {
              let waitMs = 2000 * (i + 1);
              const retryMatch = errorMessage.match(/retry in (\d+(?:\.\d+)?)s/i);
              if (retryMatch && retryMatch[1]) {
                waitMs = Math.max(waitMs, Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000);
              }
              if (waitMs > 75000) {
                console.warn(`Wait time ${waitMs}ms is too long. Failing immediately...`);
                throw e;
              }
              console.warn(`External API busy (attempt ${i + 1}/${retries}). Retrying in ${waitMs}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitMs));
            } else {
              throw e;
            }
          }
        }

        if (!textResponse) {
          throw lastError;
        }

      } else {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const config: any = {
          safetySettings: [
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        };
        if (useSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        let response;
        let retries = 20;
        let currentModel = apiModel || "gemini-2.5-flash";
        const baseFallbacks = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        const fallbackModels = baseFallbacks.filter(m => m !== apiModel && m !== currentModel);

        for (let i = 0; i < retries; i++) {
          try {
            response = await ai.models.generateContent({
              model: currentModel,
              contents: prompt,
              config
            });
            break; // Success
          } catch (e: any) {
            lastError = e;
            // Check if it's a transient or network error
            const errorMessage = e?.message || "";
            const isTransientError = errorMessage.includes("503") || 
                                   errorMessage.includes("high demand") || 
                                   errorMessage.includes("429") || 
                                   errorMessage.includes("404") ||
                                   errorMessage.includes("502") ||
                                   errorMessage.includes("500") ||
                                   errorMessage.includes("fetch failed") ||
                                   errorMessage.includes("timeout") ||
                                   errorMessage.includes("HeadersTimeoutError");

            if (isTransientError) {
              let waitMs = 2000 * (i + 1);
              const retryMatch = errorMessage.match(/retry in (\d+(?:\.\d+)?)s/i);
              if (retryMatch && retryMatch[1]) {
                waitMs = Math.max(waitMs, Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000);
              }

              if (errorMessage.includes("404") || errorMessage.includes("limit: 0")) {
                if (fallbackModels.length > 0) {
                  const nextModel = fallbackModels.shift();
                  console.info(`Model ${currentModel} not available, trying ${nextModel}...`);
                  currentModel = nextModel!;
                  continue;
                } else {
                  throw new Error(`All models failed. Last error: ${errorMessage}`);
                }
              }

              // Only fallback if wait time is excessive or we are stuck
              if ((waitMs > 15000 || (i >= 5 && fallbackModels.length > 0)) && fallbackModels.length > 0) {
                 const nextModel = fallbackModels.shift();
                 console.info(`Trying ${nextModel} due to persistent transient errors...`);
                 currentModel = nextModel!;
                 continue;
              }
              if (waitMs > 15000) waitMs = 15000;
              
              if (i === retries - 1) throw e; // Exhausted retries
              
              console.log(`Gemini API busy (attempt ${i + 1}/${retries}). Retrying in ${waitMs}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitMs));
            } else {
              throw e; // Rethrow other errors immediately
            }
          }
        }

        if (!response) {
          throw lastError;
        }
        try {
          textResponse = response.text || "";
        } catch (e) {
          console.error("Error accessing response.text:", e, JSON.stringify(response));
        }
        if (!textResponse && response.candidates && response.candidates[0]?.content?.parts) {
           textResponse = response.candidates[0].content.parts.map((p: any) => p.text || "").join("");
        }
      }

      if (!textResponse || textResponse.trim() === "") {
         if (lastError) throw lastError;
         throw new Error("Generative API returned an empty response. This may be due to safety filters blocking the content or an empty model output.");
      }

      res.json({ text: textResponse });
    } catch (e: any) {
      console.error("Generative API Error:", e?.message || e);
      let statusCode = 500;
      let errorMessage = e?.message || "Failed to generate content.";
      
      try {
        let jsonStr = errorMessage;
        if (jsonStr.includes("{")) {
          jsonStr = jsonStr.substring(jsonStr.indexOf("{"));
        }
        const parsed = JSON.parse(jsonStr);
        if (parsed.error && parsed.error.message) errorMessage = parsed.error.message;
        else if (parsed.detail) errorMessage = parsed.detail;
        else if (parsed.message) errorMessage = parsed.message;
      } catch (err) {}

      if (errorMessage.toLowerCase().includes("invalid token") || errorMessage.toLowerCase().includes("api key not valid") || errorMessage.toLowerCase().includes("incorrect api key provided")) {
        statusCode = 401;
        errorMessage = "Invalid API Key. Please check your configuration in Settings.";
      } else if (errorMessage.toLowerCase().includes("invalid url")) {
        statusCode = 400;
        errorMessage = "Invalid API Base URL. Please check your configuration in Settings.";
      } else if (errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("rate limit") || errorMessage.includes("429")) {
        statusCode = 429;
        errorMessage = "API Quota Exceeded or Rate Limit reached. Please check your billing or try again later.";
      }

      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
