
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
The visual theme has the following parameters

<Parameters>
<Colors>
2 to 5 colors that evoke the theme of ${themePrompt}. For instance, if the theme is a country, these could be colors
on that counties on that flag. If the theme is water, it could be colors typical of water like shades of blue and green.
If the theme is joy, the colors should be bright. If the theme is the 1960s, it could be common tie dye color.

The colors should be formatted as comma-separate rgb triples from 0 to 255.
</Colors>

<Icons>
Names or brief descriptions of a few simple icons (3 to 7) associated theme of ${themePrompt}. They should be objects that
are simple enough that they can be recognizably drawn as an SVGs without much trouble. For instance,

Ireland: Clover, Irish flag, Cabbage, Mountain, Emerald, Harp
Water: Wave, Fish, Pool, Swimsuit, Bucket
Joy: Smiley face, Thumbs up, Love heart
1960s: Peace sign, Yin Yang, Tie dye t-shirt, Incense, Guitar
</Icons>
</Parameters>

Response Format:
It should be an XML object in the following format:

<Color>0,140,69</Color>
<Color>244,245,240</Color>
<Color>205,33,42</Color>
<Icon>Pizza slices</Icon>
<Icon>Coliseum</Icon>
<Icon>Boot</Icon>
<Icon>Pasta</Icon>
<Icon>Leaning Tower of Pisa</Icon>
<Icon>Gondola boat</Icon>
`;
}