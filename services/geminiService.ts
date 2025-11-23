
import { GoogleGenAI, Type } from "@google/genai";
import { VideoClip } from '../types';
import { MOCK_CLIPS_FALLBACK } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert blob/file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:video/mp4;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeVideoContent = async (file: File, searchQuery?: string): Promise<VideoClip[]> => {
  const ai = getAiClient();
  
  // Only use mock data if API key is missing. 
  if (!ai) { 
    console.warn("Using mock data due to missing API key.");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CLIPS_FALLBACK), 2000));
  }

  try {
    const base64Data = await fileToGenerativePart(file);
    const modelId = "gemini-2.5-flash"; // Supports video input

    let taskDescription = "";
    if (searchQuery && searchQuery.trim().length > 0) {
        taskDescription = `
            Task: SEARCH and FIND segments in the video that specifically match this user query: "${searchQuery}".
            Constraint: Find the best 1-5 segments that satisfy the user's search.
            If multiple relevant moments exist, provide them as separate segments. 
            If the query implies "combining" moments, identify the sequential segments that cover the topic best.
        `;
    } else {
        taskDescription = `
            Task: Analyze the uploaded video (AUDIO and VISUAL) to find 5 distinct, engaging "viral" segments.
        `;
    }

    const prompt = `
      You are a professional video editor specializing in YouTube Shorts.
      
      ${taskDescription}
      
      General Constraint: Each segment MUST be between 15 and 50 seconds long.

      CRITICAL INSTRUCTION FOR CAPTIONS:
      1. Listen to the AUDIO track of the selected segment extremely carefully.
      2. Generate a VERBATIM (word-for-word) transcript. 
      3. DO NOT SUMMARIZE. DO NOT INVENT TEXT. If a person says "Umm, well," include "Umm, well".
      4. Split the transcript into small chunks (3-8 words) for dynamic captions.
      5. Synchronization must be precise.

      Output JSON format:
      For each segment, provide:
      1. title: A catchy, viral-style title.
      2. startTime: Start timestamp in seconds (absolute time in original video).
      3. endTime: End timestamp in seconds (absolute time in original video).
      4. description: Brief reasoning for selection.
      5. viralScore: 0-100 score (Relevance score if searching).
      6. captions: An array of caption objects:
         - text: The exact spoken words.
         - start: Start time relative to the SEGMENT START (0.0 = start of the clip).
         - end: End time relative to the SEGMENT START.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              description: { type: Type.STRING },
              viralScore: { type: Type.NUMBER },
              captions: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER }
                  },
                  required: ["text", "start", "end"]
                }
              }
            },
            required: ["title", "startTime", "endTime", "viralScore", "captions"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const clips = JSON.parse(text) as Omit<VideoClip, 'id'>[];
    
    // Add IDs
    return clips.map((clip, index) => ({
      ...clip,
      id: `generated-${index}-${Date.now()}`
    }));

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
