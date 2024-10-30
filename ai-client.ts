
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
  return `You are designing an app. Its visual theme is ${themePrompt}.
The visual theme has 2 parameters: backgroundColor and textColor. You must choose
both colors so that
1) They evoke the theme of ${themePrompt}
2) They are in a formatted as comma-separated rgb values from 0 to 255
3) The contrast between the two colors is strong enough that Text written in textColor with show up on a backgroundColor background.

Respond in an XML object called <Theme> containing tags <textColor> and <backgroundColor>. For example:
<Theme>
  <backgroundColor>20,40,50</backgroundColor>
  <textColor>200,250,225</textColor>
</Theme>`;
}