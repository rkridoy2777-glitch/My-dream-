import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryParams } from "../types";

// Ensure API Key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

// 1. Text Generation (Story Content)
export const generateStoryText = async (params: StoryParams) => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `You are a master storyteller. 
  Create a captivating story based on the user's prompt, genre, and desired art style.
  Also provide a detailed image prompt that describes a key scene from the story, suitable for an AI image generator.
  The story should be around 200-300 words.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Genre: ${params.genre}. Art Style: ${params.artStyle}. User Prompt: ${params.prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A catchy title for the story" },
          content: { type: Type.STRING, description: "The full story text" },
          imagePrompt: { type: Type.STRING, description: "A detailed visual description of a key scene for image generation" }
        },
        required: ["title", "content", "imagePrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text generated");
  return JSON.parse(text);
};

// 2. Image Generation
export const generateStoryImage = async (imagePrompt: string, artStyle: string) => {
  const model = "gemini-2.5-flash-image";
  
  // Enhance prompt with style
  const enhancedPrompt = `${imagePrompt}. Art Style: ${artStyle}. High quality, detailed, cinematic lighting.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
        parts: [{ text: enhancedPrompt }]
    },
    config: {
        // Nano banana models don't support imageConfig like aspect ratio in the same way as Imagen, 
        // but let's try to prompt for it or just accept the square default which is usually fine.
        // Actually, instructions say "Do NOT set responseMimeType... for nano banana"
    }
  });

  // Extract image
  // For 'gemini-2.5-flash-image', output is in parts
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
  }
  return null;
};

// 3. Audio Generation (TTS)
export const generateStorySpeech = async (text: string) => {
  const model = "gemini-2.5-flash-preview-tts";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually good for storytelling
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
