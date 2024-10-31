import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { GoogleAIClient } from './ai-client';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Card from './src/card';
import { useEffect, useRef, useState } from 'react';
import { FakeDataClient } from './data-client';

import "./global.css";
import { parseAIResponse, randomPermutation } from './src/shared/utils';
import { CardContent, CardTheme } from './src/shared/types';

const cardClient = new FakeDataClient();

const CARD_BATCH_SIZE = 10;
const CARD_GAP = 10;
const GEMINI_API_LOCAL_STORAGE_KEY = 'Themelon Gemini API Key';

export default function App() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [cardDataById, setCardDataById] = useState(new Map<number, CardData>());
  const [listHeightFull, setListHeightFull] = useState(-CARD_GAP);
  const [listHeightVisible, setListHeightVisible] = useState(0);
  const [listOffset, setListOffset] = useState(0);
  const [themeQuery, setThemeQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const listHeightFullRef = useRef(-CARD_GAP);
  const cardTheme = useRef<CardTheme>({colors: ['200,200,200', '150,150,150'], icons: []});
  const cancelCardLoads = useRef(false);
  const isLoadingCards = useRef(false);

  useEffect(() => {
    loadCards(CARD_BATCH_SIZE * 2);
    return () => { cancelCardLoads.current = true };
  }, []);

  useEffect(() => {
    if (listOffset + 2 * listHeightVisible < listHeightFullRef.current) {
      return;
    }
    console.log(`listOffset ${listOffset} listHeightVisible ${listHeightVisible} listHeightFullRef.current ${listHeightFullRef.current}`);
    loadCards();
  }, [listOffset, listHeightVisible]);

  async function loadCards(batchSize: number = CARD_BATCH_SIZE) {
    console.log('calling loadCards');
    if (isLoadingCards.current) {
      return;
    }
    isLoadingCards.current = true;
    const newCardBodies = await cardClient.getCardContent('any cursor', batchSize);
    isLoadingCards.current = false;
    const nextId = cardData.length;
    const newCardData: CardData[] = [];
    const newCardDataById = new Map<number, CardData>();
    for (let i = 0; i < newCardBodies.length; i++) {
      const body = newCardBodies[i];
      const colors = cardTheme.current.colors.length > 1 ?
          randomPermutation(cardTheme.current.colors, 3).map((rgbTriple: string) => `rgba(${rgbTriple},.3)`) :
          [...cardTheme.current.colors, ...cardTheme.current.colors]
      const cardData = {
        id: nextId + i,
        theme: {...cardTheme.current, colors},
        content: {body},
      }
      newCardData.push(cardData);
      newCardDataById.set(cardData.id, cardData);
    }
    if (cancelCardLoads.current) {
      return;
    }
    console.log('setting loaded cards')
    setCardData([...cardData, ...newCardData]);
    setCardDataById(new Map<number, CardData>([...cardDataById, ...newCardDataById]));
  }

  function handleCardLayout(e: LayoutChangeEvent, id: number) {
    const cardHeight = e.nativeEvent.layout.height;

    listHeightFullRef.current += cardHeight + CARD_GAP;

    const cardData = cardDataById.get(id);
    cardData!.height = cardHeight;
  }

  function handleListLayout(e: LayoutChangeEvent) {
    setListHeightVisible(e.nativeEvent.layout.height);
    listHeightFullRef.current = -CARD_GAP; // Reset so cards can build it up as they are added
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const newOffset = e.nativeEvent.contentOffset.y;
    setListOffset(newOffset);
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

type CardData = {
  id: number,
  theme: CardTheme,
  content: CardContent,
  height?: number,
}