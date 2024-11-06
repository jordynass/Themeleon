export abstract class IconClient {
  abstract getIconPngUris(icons: string[]): Promise<string[]>;
}

export class LocalServerIconClient {
  async getIconPngUris(icons: string[]): Promise<string[]> {
    const response = await fetch(`http://localhost:3000/icon?icons=${icons.join()}`);
    const responseJson = await response.json();
    return responseJson;
  }
}