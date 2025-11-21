import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set in environment variables.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const askJVMExpert = async (question: string, context?: string): Promise<string> => {
  const client = initializeGenAI();
  if (!client) {
    return "请配置 API Key 以使用 AI 助手。";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      你是一位资深的 Java 虚拟机 (JVM) 专家和教育家。
      请用通俗易懂、生动有趣的中文回答用户关于 JVM 的问题。
      
      当前用户正在查看的 JVM 上下文 (如果有): ${context || '无'}
      
      用户问题: ${question}
      
      请保持回答简洁，重点突出，尽量使用比喻来解释复杂概念。
    `;

    const response = await client.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "抱歉，我现在无法回答，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务暂时不可用，请检查网络或 API Key 设置。";
  }
};