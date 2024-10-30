
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";


export abstract class AIClient {
  abstract getThemeForPrompt(themePrompt: string): Promise<string>;
}

export class GoogleAIClient extends AIClient {
  private readonly model: GenerativeModel;
  constructor(apiKey: string, private readonly modelName: string = "gemini-1.5-flash") {
    super();
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName});
  }

  async getThemeForPrompt(themePrompt: string): Promise<string> {
    const result = await this.model.generateContent(formatPromptForRequest(themePrompt));
    const text = result.response.text();
    console.log(`Response from Google AI model ${this.modelName}:\n${text}`)
    return text;
  }
}

function formatPromptForRequest(themePrompt: string): string {
  return `Tell me a story about ${themePrompt}. Keep it under 100 words`;
}