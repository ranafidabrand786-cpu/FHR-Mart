
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";

const API_KEY = process.env.API_KEY || "";

export const getShoppingAdvice = async (userQuery: string, availableProducts: Product[]) => {
  if (!API_KEY) return "AI assistance is currently offline. Please check back later.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const productListStr = availableProducts.map(p => `${p.name} (Rs. ${p.price}) - ${p.description}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is looking for something: "${userQuery}". 
      Here is our product catalog with prices in Pakistani Rupees (PKR):
      ${productListStr}
      
      Act as a high-end personal shopper for "FHR Mart". 
      Recommend the best 1-2 products from the catalog or explain why we might not have a perfect match. 
      Keep it short, friendly, and stylish. Mention prices using the "Rs." prefix. 
      Mention Fida HussaiN Rana's commitment to quality for the Pakistani market.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "I'm having trouble thinking right now. How can I help you today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The store's AI is resting. Feel free to browse our premium collection manually!";
  }
};
