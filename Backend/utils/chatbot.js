import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateResponse(userPrompt, username) {
  try {
    // 1. Define the system instruction (the persona for the model)
    const systemInstruction = {
      parts: [{ text: `You are ${username}'s supportive virtual assistant named Silvi. Help him stay consistent and motivated.` }]
    };

    // 2. Define the user's content (the actual prompt)
    const userMessageContent = [
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ];

    // 3. Pass both the systemInstruction and contents to generateContent
    const result = await model.generateContent({
      systemInstruction: systemInstruction, // Pass the system instruction here
      contents: userMessageContent         // Pass the actual conversation turns here
    });

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw error;
  }
}