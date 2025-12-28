
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an SVG-based relief pattern using Gemini 3 Flash.
 * This is a text-based generation that creates a "simple image" (SVG) 
 * which can be used as a depth map.
 */
export const generateDesignSVG = async (prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Using gemini-3-flash-preview (Free Tier)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a CNC Design Specialist. Generate a single SVG string for a grayscale relief pattern.
      Subject: ${prompt}
      
      Requirements:
      - Use ONLY grayscale colors: White (#FFFFFF) for highest points, Black (#000000) for deepest points.
      - The SVG should be 512x512 pixels.
      - Use gradients (<linearGradient> or <radialGradient>) to create smooth depth transitions.
      - The design should be centered and suitable for a wooden bed headboard.
      - Return ONLY the raw SVG code starting with <svg and ending with </svg>. No markdown formatting.`,
    });

    const text = response.text;
    if (text) {
      // Regex to extract SVG content even if wrapped in markdown or mixed with other text
      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
      return svgMatch ? svgMatch[0] : null;
    }
    return null;
  } catch (error) {
    console.error("SVG generation failed:", error);
    return null;
  }
};

/**
 * Provides technical milling advice using the latest Flash text model.
 */
export const getDesignAdvice = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Furniture CNC Master. A client wants to carve a bed headboard relief pattern described as: "${prompt}". 
      Provide 3 concise technical points:
      1. Best wood species for this specific pattern.
      2. Specific router bit recommendation.
      3. A key tip for the finish pass toolpath.`,
    });
    return response.text || "Milling advice unavailable.";
  } catch (error) {
    console.error("Advice generation failed:", error);
    return "Ready to carve.";
  }
};
