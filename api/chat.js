/**
 * Vercel Serverless Function - Chatbot API
 * يستخدم Google Gemini AI للرد على أسئلة المواطنين
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation history
    const conversationHistory = history?.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || [];

    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'فهمت تماماً. أنا مُساعد مُوجَز+، وأنا هنا لمساعدة المواطنين في كتابة اعتراضات قوية على المخالفات المرورية. سأقدم نصائح واضحة ومختصرة ومفيدة.' }],
        },
        ...conversationHistory,
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    const reply = response.text();

    return res.status(200).json({
      reply: reply,
      success: true,
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
}
