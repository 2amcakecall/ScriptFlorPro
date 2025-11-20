import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScriptSegment, AdvancedConfig, GeneratedContent } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Ensure process.env.API_KEY is set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-types' });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    script: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          narration: { type: Type.STRING },
          visual: { type: Type.STRING }
        },
        required: ["narration", "visual"]
      }
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "A score out of 10 for viral potential." },
        headline: { type: Type.STRING, description: "A 3-5 word summary of why this script works." },
        viralFactors: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 bullet points explaining the strengths."
        },
        platformTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2 specific tips to maximize reach on the chosen platform."
        }
      },
      required: ["score", "headline", "viralFactors", "platformTips"]
    }
  },
  required: ["script", "analysis"]
};

const singleSegmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narration: {
      type: Type.STRING,
      description: "The spoken narration text for this segment."
    },
    visual: {
      type: Type.STRING,
      description: "Detailed visual description for the video footage or animation."
    }
  },
  required: ["narration", "visual"]
};

export const generateScript = async (
  title: string, 
  durationDesc: string,
  tone: string,
  platform: string,
  advanced: AdvancedConfig
): Promise<GeneratedContent> => {
  
  const prompt = `
    You are a viral content strategist and expert screenwriter. 
    Create a video script for: "${title}".
    
    Context:
    - Duration: ${durationDesc}.
    - Tone: ${tone}.
    - Platform: ${platform}.
    
    Deep Customization:
    - Audience: ${advanced.audience || 'General'}.
    - Pacing: ${advanced.pacing || 'Natural'}.
    - Speaker Persona: ${advanced.speakerPersona || 'Standard'}.
    - Visual Theme: ${advanced.visualTheme || 'Standard'}.
    - Reference Style: ${advanced.referenceStyle || 'None'}.
    - CTA: ${advanced.cta || 'None'}.
    - Keywords: ${advanced.keywords || 'None'}.
    
    Tasks:
    1. Write the script (narration + visual).
    2. Analyze the script's potential (Hype Rating).
    
    Output a JSON object with 'script' (array) and 'analysis' (object).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, 
        systemInstruction: "You are a world-class scriptwriter. Always return valid JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated.");

    return JSON.parse(text) as GeneratedContent;

  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

export const regenerateSegment = async (
  currentSegment: ScriptSegment,
  instruction: string,
  contextTitle: string
): Promise<ScriptSegment> => {
  const prompt = `
    I have a script segment for a video titled "${contextTitle}".
    Current Narration: "${currentSegment.narration}"
    Current Visual: "${currentSegment.visual}"
    User Request: "${instruction}"
    Rewrite this segment to satisfy the user's request.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleSegmentSchema
      }
    });

    const text = response.text;
    if (!text) return currentSegment;
    return JSON.parse(text) as ScriptSegment;
  } catch (error) {
    console.error("Error regenerating segment", error);
    throw error;
  }
};