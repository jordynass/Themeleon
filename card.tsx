import { ReactElement } from "react";
import { View, StyleSheet, Text, LayoutChangeEvent } from "react-native";

import "./global.css";

type Props = {
  theme: CardTheme,
  content: CardContent,
  onLayout: (event: LayoutChangeEvent) => void,
}

export default function Card({theme, content, onLayout}: Props): ReactElement {
  const styles = parseStyleSheet(theme);
  return (
    <View className="rounded p-2 max-w-xl" style={styles.container} onLayout={onLayout}>
      <Text style={styles.body}>{content.body}</Text>
    </View>
  )
}

function parseStyleSheet(theme: CardTheme): StyleSheet.NamedStyles<any> {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundColor
    },
    body: {
      color: theme.textColor,
    }
  });
}

export type CardContent = {
  body: string,
};

export type CardTheme = {
  backgroundColor: string,
  textColor: string,
};