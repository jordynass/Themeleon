import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, View } from 'react-native';
import Card, {CardTheme, CardContent} from './card';
import { useEffect, useRef, useState } from 'react';
import { FakeDataClient } from './data-client';

import "./global.css";
import { Button, TextInput } from 'react-native-paper';
import { AIClient, GoogleAIClient } from './ai-client';

const client = new FakeDataClient();

const CARD_BATCH_SIZE = 10;
const CARD_GAP = 10;

export default function App() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [cardDataById, setCardDataById] = useState(new Map<number, CardData>());
  const [listHeightFull, setListHeightFull] = useState<number>(-CARD_GAP);
  const [listHeightVisible, setListHeightVisible] = useState<number>(0);
  const [listOffset, setListOffset] = useState<number>(0);
  const [themeQuery, setThemeQuery] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  const cardTheme = useRef<CardTheme>({backgroundColor: 'black', textColor: 'white'})
  const aiClient = useRef<AIClient|null>(null);
  const cancelCardLoads = useRef<boolean>(false);
  const disableThemeRequest = useRef<boolean>(false);

  useEffect(() => {
    loadCards(CARD_BATCH_SIZE * 2);
    () => { cancelCardLoads.current = true }
  }, [])

  async function loadCards(batchSize: number = CARD_BATCH_SIZE) {
    const newCardBodies = await client.getCardContent('any cursor', batchSize);
    const nextId = cardData.length;
    const newCardData: CardData[] = [];
    const newCardDataById = new Map<number, CardData>();
    for (let i = 0; i < newCardBodies.length; i++) {
      const body = newCardBodies[i];
      const cardData = {
        id: nextId + i,
        theme: cardTheme.current,
        content: {body},
      }
      newCardData.push(cardData);
      newCardDataById.set(cardData.id, cardData);
    }
    if (cancelCardLoads.current) {
      return;
    }
    setCardData([...cardData, ...newCardData]);
    setCardDataById(new Map<number, CardData>([...cardDataById, ...newCardDataById]));
  }

  function handleCardLayout(e: LayoutChangeEvent, id: number) {
    const cardHeight = e.nativeEvent.layout.height;

    setListHeightFull(lh => lh + cardHeight + CARD_GAP);

    const cardData = cardDataById.get(id);
    cardData!.height = cardHeight;
  }

  function handleListLayout(e: LayoutChangeEvent) {
    setListHeightVisible(e.nativeEvent.layout.height);
    setListHeightFull(-CARD_GAP); // Reset so cards can build it up as they are added
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const newOffset = e.nativeEvent.contentOffset.y;
    setListOffset(newOffset);

    // Load More cards if there is only one screen worth of results left
    if (newOffset + 2 * listHeightVisible > listHeightFull) {
      loadCards();
    }
  }

  async function requestTheme() {
    aiClient.current = aiClient.current ?? new GoogleAIClient(apiKey);

    disableThemeRequest.current = true;
    try {
      const response = await aiClient.current.getThemeForPrompt(themeQuery);
      cardTheme.current = parseAIResponse(response);
    } catch (e) {
      console.error(`Failed to reach AI backend or parse response. Error:\n${e}`)
    } finally {
      disableThemeRequest.current = false;
      setThemeQuery('');
    }
    setThemeQuery('');
  }

  return (
    <SafeAreaView className="flex-col flex-1 items-center justify-start p-4 gap-4">
      <View className="flex-col gap-2 items-center">
        <TextInput label="Theme prompt" value={themeQuery} onChangeText={setThemeQuery} placeholder="Space" />
        <Button onPress={requestTheme} mode='contained' disabled={disableThemeRequest.current}>Update Visual Theme</Button>
      </View>
      <FlatList
          data={cardData}
          renderItem={({item}) => <Card onLayout={e => handleCardLayout(e, item.id)} key={item.id} theme={item.theme} content={item.content} />}
          keyExtractor={item => String(item.id)}
          contentContainerClassName="flex-col flex-1 items-stretch justify-start px-5 max-w-xl" 
          contentContainerStyle={{ gap: CARD_GAP }}
          onScroll={handleScroll}
          scrollEventThrottle={20} 
          onLayout={handleListLayout} />
      <TextInput label="Gemini API Key" value={apiKey} onChangeText={setApiKey} secureTextEntry={true} />
    </SafeAreaView>
  );
}

function parseAIResponse(aiResponse: string): CardTheme {
  return {
    backgroundColor: `rgb(${getTag(aiResponse, 'backgroundColor')})`,
    textColor: `rgb(${getTag(aiResponse, 'textColor')})`,
  };
}

function getTag(xmlString: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`);
  return xmlString.match(regex)![1];
}

type CardData = {
  id: number,
  theme: CardTheme,
  content: CardContent,
  height?: number,
}