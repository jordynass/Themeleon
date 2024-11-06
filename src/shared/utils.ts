import { Theme } from "./types";


export const CARD_BATCH_SIZE = 10;
export const CARD_GAP = 10;
export const ICON_SIZE = 50;
export const GEMINI_API_LOCAL_STORAGE_KEY = 'Themelon Gemini API Key';
export const ICONS_PER_CARD = 4;

export function randomPermutation<T>(arr: T[], count: number): T[] {
  count = Math.min(count, arr.length);
  const arrCopy = arr.slice();
  const permutation = [];
  for (let i = 0; i < count; i++) {
    const nextIndex = randomInt(arrCopy.length - i);
    permutation.push(arrCopy[nextIndex]);
    arrCopy[nextIndex] = arrCopy[arrCopy.length - 1 - i];
  }
  return permutation;
}
export function randomElements<T>(arr: T[], count: number): T[] {
  return Array.from({length: count}).map(() => arr[randomInt(arr.length)]);
}

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function randomUniformIid(max: number, count: number) {
  return Array.from({length: count}).map(() => max * Math.random());
}

export function parseAIResponse(aiResponse: string): Theme {
  return {
    colors: getTags(aiResponse, 'Color'),
    icons: getTags(aiResponse, 'Icon'),
  };
}

export function getTags(xmlString: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'gims');
  return Array.from(xmlString.matchAll(regex)!).map(([, group]) => group);
}