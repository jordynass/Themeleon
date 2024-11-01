import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { TailwindProvider, useTailwind } from 'tailwind-rn';
import utilities from './tailwind.json';

import Card from './src/card';
import { useEffect, useRef, useState } from 'react';
import { FakeDataClient } from './src/clients/data-client';
import { GoogleAIClient } from './src/clients/ai-client';
import { CARD_BATCH_SIZE, CARD_GAP, GEMINI_API_LOCAL_STORAGE_KEY, getCardListHeight, parseAIResponse } from './src/shared/utils';

import type { CardData, Theme } from './src/shared/types';

const cardClient = new FakeDataClient();

export default function App() {
  return (
    <TailwindProvider utilities={utilities}>
      <AppImpl />
    </TailwindProvider>
  )
}

function AppImpl() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [listHeightVisible, setListHeightVisible] = useState(0);
  const [listOffset, setListOffset] = useState(0);
  const [themeQuery, setThemeQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const theme = useRef<Theme>({colors: ['200,200,200', '150,150,150'], icons: []});
  const cancelCardLoads = useRef(false);
  const isLoadingCards = useRef(false);

  const tailwind = useTailwind();

  useEffect(() => {
    loadCards(CARD_BATCH_SIZE * 2);
    return () => { cancelCardLoads.current = true };
  }, []);

  const cardDataById = new Map<number, CardData>(cardData.map(cd => [cd.id, cd]));

  async function loadCards(batchSize: number = CARD_BATCH_SIZE) {
    if (isLoadingCards.current) {
      return;
    }

    isLoadingCards.current = true;
    const newCardBodies = await cardClient.getCardContent('any cursor', batchSize);
    isLoadingCards.current = false;

    const nextId = cardData.length;
    const newCardData: CardData[] = [];
    for (let i = 0; i < newCardBodies.length; i++) {
      const body = newCardBodies[i];
      const newCard = {
        id: nextId + i,
        theme: theme.current,
        content: {body},
        height: Infinity,
      }
      newCardData.push(newCard);
    }

    if (cancelCardLoads.current) {
      return;
    }
    setCardData([...cardData, ...newCardData]);
  }

  function handleCardLayout(e: LayoutChangeEvent, id: number) {
    const cardHeight = e.nativeEvent.layout.height;

    const card = cardDataById.get(id);
    card!.height = cardHeight;
    
    if (listOffset + 2 * listHeightVisible > getCardListHeight(cardData)) {
      loadCards();
    }
  }

  function handleListLayout(e: LayoutChangeEvent) {
    setListHeightVisible(e.nativeEvent.layout.height);
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const newOffset = e.nativeEvent.contentOffset.y;
    if (newOffset + 2 * listHeightVisible > getCardListHeight(cardData)) {
      loadCards();
    }

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
      theme.current = parseAIResponse(response);
      setThemeQuery('');
      await AsyncStorage.setItem(GEMINI_API_LOCAL_STORAGE_KEY, apiKeyWithFallback);
    } catch (e) {
      console.error(`Failed to reach AI backend or parse response. Error:\n${e}`);
    } finally {
      setIsLoadingTheme(false);
    }
  }

  return (
    <SafeAreaView style={{...tailwind("flex-col flex-1 items-stretch justify-start"), paddingTop: 12, gap: 16}}>
      <View style={{...tailwind("flex-col items-center"), gap: 8}}>
        <TextInput label="Theme prompt" value={themeQuery} onChangeText={setThemeQuery} placeholder="Space" />
        <Button onPress={requestTheme} mode='contained' disabled={isLoadingTheme}>Update Visual Theme</Button>
      </View>
      <FlatList
          data={cardData}
          renderItem={({item}) => <Card onLayout={e => handleCardLayout(e, item.id)} key={item.id} theme={item.theme} content={item.content} />}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ ...tailwind("flex-col flex-1 items-stretch justify-start" ), gap: CARD_GAP }}
          onScroll={handleScroll}
          scrollEventThrottle={20} 
          onLayout={handleListLayout} />
      <View style={tailwind("flex-col items-center")}>
        <TextInput label="Gemini API Key" value={apiKey} onChangeText={setApiKey} secureTextEntry={true} />
      </View>
    </SafeAreaView>
  );
}