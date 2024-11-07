import { FlatList, ImageBackground, SafeAreaView, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { TailwindProvider, useTailwind } from 'tailwind-rn';
import utilities from './tailwind.json';

import Card from './src/card';
import { useEffect, useRef, useState } from 'react';
import { DataClient, FakeDataClient } from './src/clients/data-client';
import { CARD_BATCH_SIZE, CARD_GAP, randomElements } from './src/shared/utils';

import type { CardData, Theme } from './src/shared/types';
import { LocalServerThemeClient, ThemeClient } from './src/clients/theme-client';
import themeSuggestions from './src/shared/theme-suggestions';


const cardClient: DataClient = new FakeDataClient();
const themeClient: ThemeClient = new LocalServerThemeClient();

export default function App() {
  return (
    <TailwindProvider utilities={utilities}>
      <AppImpl />
    </TailwindProvider>
  )
}

function AppImpl() {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [themeQuery, setThemeQuery] = useState('');
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const theme = useRef<Theme>({colors: ['200,200,200', '150,150,150'], iconUris: []});
  const cancelCardLoads = useRef(false);
  const isLoadingCards = useRef(false);
  const textInputRef = useRef<any>(null);

  const tailwind = useTailwind();

  useEffect(() => {
    loadCards(CARD_BATCH_SIZE * 2);
    return () => { cancelCardLoads.current = true };
  }, []);

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
      }
      newCardData.push(newCard);
    }

    if (cancelCardLoads.current) {
      return;
    }
    setCardData([...cardData, ...newCardData]);
  }

  async function requestTheme() {
    setIsLoadingTheme(true);

    try {
      theme.current = await themeClient.getThemeForPrompt(themeQuery);
      setThemeQuery('');
    } catch (e) {
      console.error(`Failed to reach AI backend or parse response. Error:\n${e}`);
    } finally {
      setIsLoadingTheme(false);
    }
  }

  function handleRandomSuggestion() {
    setThemeQuery(randomElements(themeSuggestions as string[], 1)[0]);
    textInputRef.current!.focus();
  }

  return (
    <SafeAreaView style={{...tailwind("flex-col flex-1 items-stretch justify-start pt-3"), gap: 16}}>
      <View style={{...tailwind("flex-col items-stretch"), gap: 8}}>
        <View style={tailwind("flex-row justify-center")}>
          <View style={tailwind("flex-row flex-grow max-w-lg")}>
            <TextInput
                label="Theme prompt"
                value={themeQuery}
                onChangeText={setThemeQuery}
                onSubmitEditing={requestTheme}
                placeholder="e.g. Space, Parties, Happiness"
                ref={textInputRef}
                style={tailwind("flex-grow")} />
          </View>
        </View>
        <View style={{...tailwind("flex-row justify-center"), gap: 20}}>
          <Button onPress={requestTheme} mode='contained' disabled={isLoadingTheme}>Update Visual Theme</Button>
          <Button onPress={handleRandomSuggestion} mode='outlined' disabled={isLoadingTheme}>
            Suggest Random Theme
          </Button>
        </View>
      </View>
      <ImageBackground
          source={{uri: "./assets/marble.webp"}}
          style={{...tailwind("flex-1 w-full h-full justify-center align-center")}}>
        <FlatList
            data={cardData}
            renderItem={({item}) => <Card key={item.id} theme={item.theme} content={item.content} />}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{...tailwind("flex-col flex-1 items-stretch justify-start" ), gap: CARD_GAP }}
            scrollEventThrottle={20}
            onEndReached={() => loadCards(CARD_BATCH_SIZE)}
            onEndReachedThreshold={1}
            showsVerticalScrollIndicator={false}
            style={tailwind("bg-white bg-opacity-75")} />
      </ImageBackground>
    </SafeAreaView>
  );
}