import { ReactElement } from "react";
import { Text, LayoutChangeEvent, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'

import "../global.css";
import { CardContent, CardTheme } from "./shared/types";

type Props = {
  theme: CardTheme,
  content: CardContent,
  onLayout: (event: LayoutChangeEvent) => void,
}

export default function Card({theme, content, onLayout}: Props): ReactElement {
  return (
    <View className="max-w-lg">
      <LinearGradient
          className="p-3 rounded"
          colors={theme.colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          onLayout={onLayout}>
        <Text>{content.body}</Text>
      </LinearGradient>
    </View>
  )
}