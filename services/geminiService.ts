import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, AssessmentScores, SkillSet, UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "An empathetic, encouraging summary of the user's profile based on their inputs. Address them directly."
    },
    personalityType: {
      type: Type.STRING,
      description: "A short label for their personality type (e.g., 'The Creative Strategist')."
    },
    topValues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The top 3 core values identified or confirmed."
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          matchPercentage: { type: Type.NUMBER, description: "Estimated match percentage (0-100)." },
          description: { type: Type.STRING, description: "Why this fits the user." },
          salaryRange: { type: Type.STRING, description: "Global average salary range (e.g., '$60k - $90k')." },
          educationPath: { type: Type.STRING, description: "Recommended certification or degree." },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Immediate actionable steps." }
        },
        required: ["title", "matchPercentage", "description", "salaryRange", "educationPath", "pros", "cons", "nextSteps"]
      }
    }
  },
  required: ["summary", "personalityType", "topValues", "recommendations"]
};

export const generateCareerAnalysis = async (
  profile: UserProfile,
  interests: AssessmentScores,
  skills: SkillSet,
  values: string[]
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prompt = `
    You are Career Spark, an intelligent, empathetic career counselor.
    Analyze the following user profile and assessment data to provide career recommendations.

    User Profile:
    - Name: ${profile.name}
    - Current Role: ${profile.currentRole}
    - Motivation: ${profile.motivation}
    - Dream Job: ${profile.dreamJob || "Unsure"}

    Assessment Data:
    - RIASEC Interests (1-5 scale): ${JSON.stringify(interests)}
    - Skills (1-5 scale): ${JSON.stringify(skills)}
    - Core Values: ${values.join(", ")}

    Based on this, generate a JSON response with 3-5 distinct career paths.
    Be creative but realistic. Consider unconventional paths if they fit the profile.
    Your tone in the summary should be warm, encouraging, and personal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        systemInstruction: "You are Career Spark, a helpful and empathetic AI career coach. You provide data-driven insights with a human touch.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
};

export const generateChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string
) => {
   if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  // We simply use generateContent with the history as context for a single turn or manage chat object
  // For simplicity in this demo, we'll use a chat session
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
         systemInstruction: "You are Career Spark. You have just analyzed the user's career profile. Answer their follow-up questions with empathy and expertise. Keep answers concise (under 150 words) unless asked for detail.",
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};
