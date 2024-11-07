import { Theme } from "../shared/types";

export abstract class ThemeClient {
  abstract getThemeForPrompt(themePrompt: string): Promise<Theme>;
}

export class LocalServerThemeClient {
  async getThemeForPrompt(themePrompt: string): Promise<Theme> {
    const response = await fetch(`http://localhost:3000/theme/${themePrompt}`);
    const responseJson = await response.json();
    return responseJson;
  }
}