import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is automatically injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFlowchart(prompt: string, files: File[]): Promise<string> {
  try {
    const parts: any[] = [];
    
    if (prompt) {
      parts.push(prompt);
    }

    // Handle files if any (convert to base64 for Gemini)
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        parts.push({
          inlineData: {
            data: base64.split(',')[1],
            mimeType: file.type
          }
        });
      }
    }

    const systemInstruction = `You are an expert flowchart designer. Convert the user's input into a SINGLE, COMPLETE Mermaid.js flowchart diagram.
CRITICAL REQUIREMENTS:
1. Generate the ENTIRE flowchart in ONE response.
2. Include ALL decision points, loops, conditions, and branches.
3. Use proper Mermaid syntax (flowchart TD or LR).
4. Make node IDs unique and alphanumeric.
5. Keep labels concise.
6. Add tooltips/click events if appropriate using Mermaid's 'click' or just descriptive text.
7. Return ONLY valid Mermaid code. Do NOT wrap it in markdown code blocks (\`\`\`mermaid ... \`\`\`). Just return the raw mermaid code starting with 'flowchart'.
8. Do not include any explanations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    let text = response.text || "";
    // Clean up markdown if the model accidentally included it
    text = text.replace(/^```mermaid\n?/i, '').replace(/^```\n?/i, '').replace(/```$/i, '').trim();
    
    return text;
  } catch (error) {
    console.error("Error generating flowchart:", error);
    throw new Error("Failed to generate flowchart. Please try again.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
