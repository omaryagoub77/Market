import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/src/theme';

interface Category {
  id: string;
  name: string;
}

interface CategoryScrollerProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryScroller({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryScrollerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.category,
            selectedCategory === category.id && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(category.id)}>
          <ThemedText
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}>
            {category.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.LIST_GAP,
  },
  category: {
    paddingHorizontal: Spacing.COMPONENT,
    paddingVertical: Spacing.LIST_GAP,
    marginRight: Spacing.LIST_GAP,
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.BUTTON,
  },
  selectedCategory: {
    backgroundColor: Colors.BLACK,
  },
  categoryText: {
    color: Colors.TEXT,
  },
  selectedCategoryText: {
    color: Colors.BG_LIGHT,
  },
});