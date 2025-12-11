
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse } from "../types";

// Schema definition matching the requirement exactly
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    session_summary: {
      type: Type.OBJECT,
      properties: {
        sport: { type: Type.STRING },
        exercise_type: { type: Type.STRING },
        estimated_duration_sec: { type: Type.NUMBER },
        intensity_level: { type: Type.STRING },
        calories_estimate: { type: Type.NUMBER },
        score: { type: Type.NUMBER, description: "Overall performance score out of 100 based on form accuracy and mechanics." }
      },
      required: ["sport", "exercise_type", "estimated_duration_sec", "intensity_level", "calories_estimate", "score"]
    },
    exercise_detection: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          timestamp_range_sec: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER }
          },
          confidence: { type: Type.NUMBER },
          score: { type: Type.NUMBER, description: "Performance score (0-100) for this specific exercise segment." }
        },
        required: ["label", "timestamp_range_sec", "confidence", "score"]
      }
    },
    form_feedback: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp_range_sec: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER }
          },
          issue: { type: Type.STRING },
          cue: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["minor", "moderate", "severe"] },
          visual_overlay_hint: { type: Type.STRING },
          body_focus: { type: Type.STRING }
        },
        required: ["timestamp_range_sec", "issue", "cue", "severity", "visual_overlay_hint", "body_focus"]
      }
    },
    drill_recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          purpose: { type: Type.STRING },
          sets: { type: Type.NUMBER },
          reps: { type: Type.NUMBER },
          rest_sec: { type: Type.NUMBER },
        },
        required: ["name", "purpose", "sets", "reps", "rest_sec"]
      }
    },
    personalized_plan: {
      type: Type.OBJECT,
      properties: {
        weekly_focus: { type: Type.STRING },
        sessions_per_week: { type: Type.NUMBER },
        progression_rules: { type: Type.STRING },
        milestones: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["weekly_focus", "sessions_per_week", "progression_rules", "milestones"]
    }
  },
  required: ["session_summary", "exercise_detection", "form_feedback", "drill_recommendations", "personalized_plan"]
};

export const analyzeVideo = async (file: File): Promise<AnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const modelId = "gemini-3-pro-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this workout video. You are a professional Olympic-level coach.
            1. Identify the sport and exercise types specifically.
            2. Analyze form, body mechanics, and technique patterns throughout the entire video.
            3. Provide specific, timestamped feedback with severity ratings (minor, moderate, severe) and body focus areas (e.g. knees, spine).
            4. Suggest drills to fix the specific issues found.
            5. Create a one-week training plan based on this performance.
            6. Assign a performance score (0-100) for the overall session and for each detected exercise segment based on form accuracy, tempo, and stability.
            
            Return the result in strictly structured JSON format matching the schema provided.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        // thinkingConfig removed as it is not supported for gemini-3-pro-preview
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
