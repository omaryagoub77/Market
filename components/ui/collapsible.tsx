import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Spacing, Shadows, Radii, Colors as ThemeColors } from '@/src/theme'; // Updated import

// Helper function to apply platform-specific shadows
const getShadowStyle = (shadowType: typeof Shadows.SOFT) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: shadowType.boxShadow
    };
  } else {
    const { boxShadow, ...nativeShadows } = shadowType;
    return nativeShadows;
  }
};

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={[styles.content, getShadowStyle(Shadows.SOFT)]}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.LIST_GAP, // Using theme spacing
    paddingVertical: Spacing.COMPONENT, // Using theme spacing
  },
  content: {
    marginTop: Spacing.LIST_GAP, // Using theme spacing
    marginLeft: Spacing.SCREEN_PADDING, // Using theme spacing
    padding: Spacing.COMPONENT, // Using theme spacing
    backgroundColor: ThemeColors.BG_LIGHT, // Using theme color
    borderRadius: Radii.CARD, // Using theme radius
  },
});