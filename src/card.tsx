import { memo, ReactElement, ReactNode, useState } from "react";
import { Text, View, Dimensions, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'

import { CardContent, Theme } from "./shared/types";
import { useTailwind } from "tailwind-rn";
import { ICON_SIZE, ICONS_PER_CARD, randomElements, randomPermutation, randomUniformIid } from "./shared/utils";


type Props = {
  theme: Theme,
  content: CardContent,
}

function Card({theme, content}: Props): ReactElement {
  const tailwind = useTailwind();
  const [colors] = useState<string[]>(generateColors(theme));
  const [icons, setIcons] = useState<ReactNode[]>([]);

  function handleLayout() {
    setIcons(generateIcons(theme));
  }
  
  return (
    <View onLayout={handleLayout} style={tailwind("flex-col items-center")}>
      {icons}
      <View style={tailwind("max-w-lg")}>
        <LinearGradient
            style={tailwind("p-3 rounded")}
            colors={colors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
          <Text>{content.body}</Text>
        </LinearGradient>
      </View>
    </View>
  )
}

export default memo(Card);

function generateColors(theme: Theme): string[] {
  return theme.colors.length > 1 ?
      randomPermutation(theme.colors, 3).map((rgbTriple: string) => `rgba(${rgbTriple},.45)`) :
      [...theme.colors, ...theme.colors];
}

function generateIcons(theme: Theme): ReactNode[] {
  const {width, height} = Dimensions.get('window');
  const iconUris = randomElements(theme.iconUris, ICONS_PER_CARD);
  const tops = randomUniformIid(height / 3, ICONS_PER_CARD);
  const lefts = randomUniformIid(width - ICON_SIZE, ICONS_PER_CARD);
  return iconUris.map((uri, i) => (
    <Image key={i} source={{uri}} resizeMode="cover" style={{
        position: 'absolute',
        top: tops[i],
        left: lefts[i],
        opacity: .3,
        width: ICON_SIZE,
        height: ICON_SIZE }}/>
    ));
}