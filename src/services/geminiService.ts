import { GoogleGenAI } from "@google/genai";

// Defensive check for Gemini API Key to prevent crash in browser environments like Vercel
const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY || "";
  } catch {
    // If process is not defined in browser
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function askSoundAssistant(question: string) {
  if (!getApiKey()) {
    return "API Key is missing. If you are on Vercel, please add GEMINI_API_KEY to Environment Variables.";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `You are a senior sound engineer and church audio expert with over 20 years of field experience. 
        Your goal is to provide highly professional yet encouraging assistance to users (primarily church volunteers or beginner engineers).
        
        Expert Guidelines:
        1. Provide specific, real-world know-how based on your 20 years of experience (e.g., "If you have vocal feedback, try cutting around 2.5kHz first," or "During Sunday morning rehearsals, keep an eye on these specific details").
        2. Speak with authority on common console operations like X32, M32, Wing, SQ series, or Qu series.
        3. Beyond technical knowledge, emphasize the heart of being an 'invisible servant' who serves without disrupting the flow of worship.
        4. Your response should be clear, structured, and entirely in English.
        5. For dangerous tasks (like opening power supplies), always warn the user to seek professional help.
        6. Explain technical terms but always include actionable tips that can be applied immediately in a live setting.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
