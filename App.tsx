import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import Card, {CardTheme, CardContent} from './card';
import { useState } from 'react';
import { FakeClient } from './client';

const client = new FakeClient();
const CARD_BATCH_SIZE = 10;

export default function App() {
  const [cardTheme, setCardTheme] = useState<CardTheme>({backgroundColor: 'gray', textColor: 'green'});
  const [cardData, setCardData] = useState<CardData[]>([]);

  function loadCards(batchSize: number = CARD_BATCH_SIZE) {
    const newCardBodies = client.getCardContent('any cursor', batchSize);
    const nextId = cardData.length;
    const newCardData = newCardBodies.map((body, i) => ({
      id: nextId + i,
      theme: cardTheme,
      content: {body},
    }));
    setCardData([...cardData, ...newCardData]);
  }

  return (
    <View style={styles.container}>
      {cardData.map(({id, theme, content}) => <Card key={id} theme={theme} content={content} />)}
      <Button onPress={() => loadCards()} title={`Load ${CARD_BATCH_SIZE} more buttons`}/>
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

type CardData = {
  id: number,
  theme: CardTheme,
  content: CardContent,
}