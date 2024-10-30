import { ReactElement } from "react";
import { View, StyleSheet, Text } from "react-native";

type Props = {
  theme: Theme,
  content: Content
}

export default function Card({theme, content}: Props): ReactElement {
  const styles = parseStyleSheet(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.body}>{content.body}</Text>
    </View>
  )
}

function parseStyleSheet(theme: Theme): StyleSheet.NamedStyles<any> {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundColor
    },
    body: {
      color: theme.textColor,
    }
  });
}

type Content = {
  body: string,
};

export type Theme = {
  backgroundColor: string,
  textColor: string,
};