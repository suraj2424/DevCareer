
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with named parameter as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const researchCompany = async (companyName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Research the company named "${companyName}" and provide structured information for a junior software developer. Focus on details relevant to the Indian/Global market if applicable.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          employeeRange: { type: Type.STRING, description: "e.g. 50-200, 1000+" },
          fresherSalary: { type: Type.STRING, description: "Approximate CTC for freshers in local currency or USD" },
          location: { type: Type.STRING },
          type: { type: Type.STRING, description: "Startup, Product, or Consultancy" },
          cultureRating: { type: Type.NUMBER, description: "Estimated work-life balance/culture score out of 5" }
        },
        required: ["description", "employeeRange", "fresherSalary", "location", "type", "cultureRating"]
      }
    }
  });

  try {
    // Access text as a property, not a method, as per guidelines
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};