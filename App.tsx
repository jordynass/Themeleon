import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { GoogleAIClient } from './ai-client';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Card, {CardTheme, CardContent} from './card';
import { useEffect, useRef, useState } from 'react';
import { FakeDataClient } from './data-client';

import "./global.css";

const cardClient = new FakeDataClient();

const CARD_BATCH_SIZE = 10;
const CARD_GAP = 10;
const GEMINI_API_LOCAL_STORAGE_KEY = 'Themelon Gemini API Key';

export default function App() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [cardDataById, setCardDataById] = useState(new Map<number, CardData>());
  const [listHeightFull, setListHeightFull] = useState<number>(-CARD_GAP);
  const [listHeightVisible, setListHeightVisible] = useState<number>(0);
  const [listOffset, setListOffset] = useState<number>(0);
  const [themeQuery, setThemeQuery] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoadingTheme, setIsLoadingTheme] = useState<boolean>(false);

  const cardTheme = useRef<CardTheme>({backgroundColor: 'black', textColor: 'white'});
  const cancelCardLoads = useRef<boolean>(false);

  useEffect(() => {
    loadCards(CARD_BATCH_SIZE * 2);
    () => { cancelCardLoads.current = true }
  }, [])

  async function loadCards(batchSize: number = CARD_BATCH_SIZE) {
    const newCardBodies = await cardClient.getCardContent('any cursor', batchSize);
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

  function handleNoApiKeyError() {
    console.error('No API key provided or found in local storage')
  }

  async function requestTheme() {
    const apiKeyWithFallback = apiKey || await AsyncStorage.getItem(GEMINI_API_LOCAL_STORAGE_KEY);
    if (!apiKeyWithFallback) {
      handleNoApiKeyError();
      return;
    }

    const themeClient = new GoogleAIClient(apiKeyWithFallback);
    setIsLoadingTheme(true);

    try {
      const response = await themeClient.getThemeForPrompt(themeQuery);
      cardTheme.current = parseAIResponse(response);
      setThemeQuery('');
      await AsyncStorage.setItem(GEMINI_API_LOCAL_STORAGE_KEY, apiKeyWithFallback);
    } catch (e) {
      console.error(`Failed to reach AI backend or parse response. Error:\n${e}`);
    } finally {
      setIsLoadingTheme(false);
    }
  }

  return (
    <SafeAreaView className="flex-col flex-1 items-stretch justify-start p-4 gap-4">
      <View className="flex-col gap-2 items-center">
        <TextInput label="Theme prompt" value={themeQuery} onChangeText={setThemeQuery} placeholder="Space" />
        <Button onPress={requestTheme} mode='contained' disabled={isLoadingTheme}>Update Visual Theme</Button>
      </View>
      <FlatList
          data={cardData}
          renderItem={({item}) => <Card onLayout={e => handleCardLayout(e, item.id)} key={item.id} theme={item.theme} content={item.content} />}
          keyExtractor={item => String(item.id)}
          contentContainerClassName="flex-col flex-1 items-center justify-start px-5" 
          contentContainerStyle={{ gap: CARD_GAP }}
          onScroll={handleScroll}
          scrollEventThrottle={20} 
          onLayout={handleListLayout} />
      <View className="flex-col items-center">
        <TextInput label="Gemini API Key" value={apiKey} onChangeText={setApiKey} secureTextEntry={true} />
      </View>
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