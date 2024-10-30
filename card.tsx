import { ReactElement } from "react";
import { View, StyleSheet, Text } from "react-native";

import "./global.css";

type Props = {
  theme: CardTheme,
  content: CardContent
}

export default function Card({theme, content}: Props): ReactElement {
  const styles = parseStyleSheet(theme);
  return (
    <View className="rounded p-2" style={styles.container}>
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