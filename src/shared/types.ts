export type CardContent = {
  body: string,
};

export type CardTheme = {
  colors: string[],
  icons: string[],
};

export type CardData = {
  id: number,
  theme: CardTheme,
  content: CardContent,
  height: number,
}