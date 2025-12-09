import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors, Spacing } from '@/src/theme'; // Updated import

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.TEXT, // Using theme color
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.TEXT, // Using theme color
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: Colors.TEXT, // Using theme color
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT, // Using theme color
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: Colors.PRIMARY_START, // Using theme color
  },
});