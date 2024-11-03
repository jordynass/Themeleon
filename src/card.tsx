import { ReactElement, ReactNode, useState } from "react";
import { Text, LayoutChangeEvent, View, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'

import { CardContent, Theme } from "./shared/types";
import { useTailwind } from "tailwind-rn";
import { randomElements, randomPermutation, randomUniformIid } from "./shared/utils";
import { SvgXml } from "react-native-svg";

const ICONS_PER_CARD = 6;

type Props = {
  theme: Theme,
  content: CardContent,
  onLayout: (event: LayoutChangeEvent) => void,
}

export default function Card({theme, content, onLayout}: Props): ReactElement {
  const tailwind = useTailwind();
  const [colors] = useState<string[]>(generateColors(theme));
  const [icons, setIcons] = useState<ReactNode[]>([]);

  function handleLayout(e: LayoutChangeEvent) {
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
            end={{x: 1, y: 0}}
            onLayout={onLayout}>
          <Text>{content.body}</Text>
        </LinearGradient>
      </View>
    </View>
  )
}

function generateColors(theme: Theme): string[] {
  return theme.colors.length > 1 ?
      randomPermutation(theme.colors, 3).map((rgbTriple: string) => `rgba(${rgbTriple},.45)`) :
      [...theme.colors, ...theme.colors];
}

function generateIcons(theme: Theme): ReactNode[] {
  const {width, height} = Dimensions.get('window');
  const svgXmls = randomElements(theme.icons, ICONS_PER_CARD);
  const tops = randomUniformIid(height / 3, ICONS_PER_CARD);
  const lefts = randomUniformIid(width - 150, ICONS_PER_CARD);
  return svgXmls.map((svgXml, i) => (
    <SvgXml key={i} xml={svgXml} style={{position: 'absolute', top: tops[i], left: lefts[i], opacity: .3}}/>
  ));
}