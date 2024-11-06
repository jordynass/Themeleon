import { Theme } from '../shared/types';
import { getTags } from '../shared/utils';
import { LocalServerIconClient, IconClient } from './icon-client';
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";


export abstract class AIClient {
  abstract getThemeForPrompt(themePrompt: string): Promise<Theme>;
}

export class GoogleAIClient extends AIClient {
  private readonly model: GenerativeModel;
  private readonly iconClient: IconClient = new LocalServerIconClient();

  constructor(apiKey: string, private readonly modelName: string = "gemini-1.5-flash") {
    super();
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName});
  }

  async getThemeForPrompt(themePrompt: string): Promise<Theme> {
    const result = await this.model.generateContent(formatPromptForRequest(themePrompt));
    const text = result.response.text();
    console.log(`Response from Google AI model ${this.modelName}:\n${text}`);
    const iconNames = getTags(text, 'Icon');
    const colors = getTags(text, 'Color');
    const iconUris = await this.iconClient.getIconPngUris(iconNames);
    console.log(`Icons:\n${iconUris.join('\n')}`)
    return {
      colors,
      icons: iconUris,
    };
  }
}

function formatPromptForRequest(themePrompt: string): string {
  return `You are designing an app. Its visual theme is ${themePrompt}.
The visual theme has the following parameters

<Parameters>
<Colors>
2 to 3 colors that evoke the theme of ${themePrompt}. For instance, if the theme is a country, these would be colors
on that country's flag. If the theme is joy, the colors should be bright. If the theme is the 1960s, it could be 
common tie dye color. If the theme is a physical object or substance, it would be colors that would typically appear
in that object/substance.

The colors should be formatted as comma-separate rgb triples from 0 to 255. They should be ordered in the response
in decreasing order of relevance.
</Colors>

<Icons>
Names or brief descriptions of a few visual symbols (5 to 10) associated theme of ${themePrompt}. They must all be different.

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