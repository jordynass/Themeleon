export type CardContent = {
  body: string,
};

export type Theme = {
  colors: string[],
  icons: string[],
};

export type CardData = {
  id: number,
  theme: Theme,
  content: CardContent,
}