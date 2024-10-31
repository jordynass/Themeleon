import { CardTheme } from "./types";

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

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function parseAIResponse(aiResponse: string): CardTheme {
  return {
    colors: getTags(aiResponse, 'Color'),
    icons: getTags(aiResponse, 'Icon'),
  };
}

export function getTags(xmlString: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'gi');
  return Array.from(xmlString.matchAll(regex)!).map(([, group]) => group);
}