import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Card, {Theme as CardTheme} from './card';
import { useState } from 'react';

export default function App() {
  const [cardTheme, setCardTheme] = useState<CardTheme>({backgroundColor: 'gray', textColor: 'green'});
  return (
    <View style={styles.container}>
      <Card theme={cardTheme} content={{body: "Hello World"}} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
