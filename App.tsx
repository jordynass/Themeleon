import { Button, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import Card, {CardTheme, CardContent} from './card';
import { useState } from 'react';
import { FakeClient } from './client';

import "./global.css";

const client = new FakeClient();
const CARD_BATCH_SIZE = 10;

export default function App() {
  const [cardTheme, setCardTheme] = useState<CardTheme>({backgroundColor: 'black', textColor: 'white'});
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

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    console.log(e);
  }

  return (
    <View className="flex-col flex-1 items-center justify-start p-4 gap-4">
      <View>
        <Button onPress={() => loadCards()} title={`Load ${CARD_BATCH_SIZE} more buttons`}/>
      </View>
      <FlatList
          data={cardData}
          renderItem={({item}) => <Card key={item.id} theme={item.theme} content={item.content} />}
          keyExtractor={item => String(item.id)}
          contentContainerClassName="flex-col flex-1 items-stretch justify-start gap-4 px-5 max-w-xl" 
          onScroll={handleScroll}
          scrollEventThrottle={20}/>
    </View>
  );
}

type CardData = {
  id: number,
  theme: CardTheme,
  content: CardContent,
}