import { ReactElement, useState } from "react";
import { Text, LayoutChangeEvent, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'

import { CardContent, Theme } from "./shared/types";
import { useTailwind } from "tailwind-rn";
import { randomPermutation } from "./shared/utils";

type Props = {
  theme: Theme,
  content: CardContent,
  onLayout: (event: LayoutChangeEvent) => void,
}

export default function Card({theme, content, onLayout}: Props): ReactElement {
  const tailwind = useTailwind();
  const [colors] = useState<string[]>(generateColors(theme));
  return (
    <View style={tailwind("max-w-lg")}>
      <LinearGradient
          style={tailwind("p-3 rounded")}
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          onLayout={onLayout}>
        <Text>{content.body}</Text>
      </LinearGradient>
    </View>
  )
}

function generateColors(theme: Theme): string[] {
  return theme.colors.length > 1 ?
      randomPermutation(theme.colors, 3).map((rgbTriple: string) => `rgba(${rgbTriple},.3)`) :
      [...theme.colors, ...theme.colors];
}