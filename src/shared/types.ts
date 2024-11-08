export type CardContent = {
  body: string,
};

export type Theme = {
  prompt?: string,
  colors: string[],
  iconUris: string[],
};

export type CardData = {
  id: number,
  theme: Theme,
  content: CardContent,
}

export type Size = {
  height: number;
  width: number;
}