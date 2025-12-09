import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/src/theme'; // Updated import

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor: backgroundColor || Colors.BG_LIGHT }, style]} {...otherProps} />; // Using theme color
}