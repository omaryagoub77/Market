import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii } from '@/src/theme';

// Define the additional tabs that will appear in the "More" screen
// These are all tabs beyond the first tab (home-feed)
const MORE_TABS = [
  {
    name: 'post-item',
    title: 'Post',
    icon: 'plus.circle.fill',
  },
  {
    name: 'chat-list',
    title: 'Messages',
    icon: 'message.fill',
  },
  {
    name: 'my-products',
    title: 'My Products',
    icon: 'basket.fill',
  },
  {
    name: 'favourite',
    title: 'Favorites',
    icon: 'heart.fill',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person.fill',
  },
  {
    name: 'admin',
    title: 'Admin',
    icon: 'gear.fill',
  },
  {
    name: 'reviews',
    title: 'Reviews',
    icon: 'star.fill',
  },
  // Add more tabs here as needed in the future
];

export default function MoreScreen() {
  const router = useRouter();

  const handleTabPress = (tabName: string) => {
    router.push(`/${tabName}` as any);
  };

  return (
    <NavWrapper>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <ThemedText style={styles.header}>More Options</ThemedText>
          <View style={styles.tabsContainer}>
            {MORE_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabButton}
                onPress={() => handleTabPress(tab.name)}
              >
                <View style={styles.tabContent}>
                  <IconSymbol 
                    name={tab.icon as any} 
                    size={24} 
                    color={Colors.TEXT} 
                  />
                  <ThemedText style={styles.tabTitle}>{tab.title}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </NavWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.SECTION_GAP,
    marginTop: Spacing.SECTION_GAP,
  },
  tabsContainer: {
    flexDirection: 'column',
    gap: Spacing.LIST_GAP,
  },
  tabButton: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.BUTTON,
    padding: Spacing.COMPONENT,
    alignItems: 'flex-start',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.COMPONENT,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});