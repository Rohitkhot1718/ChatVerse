import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateResponse(chatHistory, username) {
  try {
    const systemInstruction = {
      parts: [
        {
          text: `You are ${username}'s supportive virtual assistant named Silvi. Help him stay consistent, 
                motivated, and focused on his goals. Provide friendly, chatty, and emotionally supportive answers
                with clarity.`
        }
      ]
    };

    const contents = chatHistory.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const result = await model.generateContent({
      systemInstruction,
      contents,
    });

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
