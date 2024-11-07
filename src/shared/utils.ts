export const CARD_BATCH_SIZE = 10;
export const CARD_GAP = 10;
export const ICON_SIZE = 50;
export const ICONS_PER_CARD = 4;
export const RAINBOW = [
  "rgba(255, 0, 0, 0.2)",    // Red
  "rgba(255, 165, 0, 0.2)",  // Orange
  "rgba(255, 255, 0, 0.2)",  // Yellow
  "rgba(0, 128, 0, 0.2)",    // Green
  "rgba(0, 0, 255, 0.2)",    // Blue
  "rgba(75, 0, 130, 0.2)",   // Indigo
  "rgba(238, 130, 238, 0.2)" // Violet
];

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
  return Array.from({length: count}, () => arr[randomInt(arr.length)]);
}

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function randomUniformIid(max: number, count: number) {
  return Array.from({length: count}, () => max * Math.random());
}

export function getTags(xmlString: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'gims');
  return Array.from(xmlString.matchAll(regex)!, ([, group]) => group);
}