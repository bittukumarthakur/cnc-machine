
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDesignConcept = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    // Prompting for grayscale heightmap / relief specifically for CNC
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A high-contrast grayscale CNC heightmap (depth map) for a wood carving relief. The pattern is for a luxury bed headboard: ${prompt}. Pure grayscale depth information where white is the highest point and black is the deepest. Clean edges, professional jewelry or furniture relief style, 2D top-down view ready for milling software.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Design generation failed:", error);
    return null;
  }
};

export const getDesignAdvice = async (prompt: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Furniture CNC Master. A client wants to carve a bed headboard relief pattern described as: "${prompt}". 
      Provide 3 technical points:
      1. Recommended hardwood (e.g. Cherry, Oak, Walnut).
      2. Tool recommendation (e.g. 1/8" ball nose for finishing).
      3. Estimated roughing vs finishing time for a standard 1.5m x 0.8m headboard.`,
    });
    return response.text || "Ready to carve your masterpiece.";
  } catch (error) {
    return "The grain of the wood awaits your vision.";
  }
};
