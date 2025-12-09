import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data - in a real app, this would come from Firebase
const reportedItems = [
  {
    id: '1',
    title: 'Suspicious Item',
    price: '$49.99',
    imageUrl: 'https://picsum.photos/300/300?random=15',
    reporter: 'User123',
    reason: 'Inappropriate content',
  },
  {
    id: '2',
    title: 'Counterfeit Product',
    price: '$29.99',
    imageUrl: 'https://picsum.photos/300/300?random=16',
    reporter: 'User456',
    reason: 'Suspected fake',
  },
];

const blockedUsers = [
  {
    id: '1',
    name: 'SpammerUser',
    email: 'spam@example.com',
    reason: 'Multiple spam posts',
  },
  {
    id: '2',
    name: 'ScammerUser',
    email: 'scam@example.com',
    reason: 'Fraudulent activity',
  },
];

export default function AdminScreen() {
  // In a real app, this would check if the current user is an admin
  const isAdmin = true; // Mock value
  
  if (!isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Access Denied
        </ThemedText>
        <ThemedText style={styles.accessDeniedText}>
          You don't have permission to access this page.
        </ThemedText>
      </ThemedView>
    );
  }

  const handleDeleteItem = (itemId: string) => {
    console.log('Deleting item:', itemId);
    // In a real app, this would delete the item from Firebase
  };

  const handleBlockUser = (userId: string) => {
    console.log('Blocking user:', userId);
    // In a real app, this would block the user in Firebase
  };

  const handleUnblockUser = (userId: string) => {
    console.log('Unblocking user:', userId);
    // In a real app, this would unblock the user in Firebase
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Admin Dashboard
      </ThemedText>
      
      {/* Reported Items Section */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Reported Items
      </ThemedText>
      <FlatList
        data={reportedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportedItem}>
            <ProductCard 
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
              onPress={() => console.log('Item pressed')}
            />
            <View style={styles.reportDetails}>
              <ThemedText style={styles.reportReason}>
                Reported by: {item.reporter}
              </ThemedText>
              <ThemedText style={styles.reportReason}>
                Reason: {item.reason}
              </ThemedText>
            </View>
            <View style={styles.adminActions}>
              <Button 
                title="Delete" 
                variant="secondary" 
                onPress={() => handleDeleteItem(item.id)}
                style={styles.adminButton}
              />
              <Button 
                title="Ignore" 
                variant="secondary" 
                onPress={() => console.log('Ignoring report')}
                style={styles.adminButton}
              />
            </View>
          </View>
        )}
      />
      
      {/* Blocked Users Section */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Blocked Users
      </ThemedText>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
              <ThemedText style={styles.blockReason}>Reason: {item.reason}</ThemedText>
            </View>
            <Button 
              title="Unblock" 
              variant="secondary" 
              onPress={() => handleUnblockUser(item.id)}
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
    padding: Spacing.SCREEN_PADDING,
  },
  title: {
    marginBottom: Spacing.SECTION_GAP,
  },
  sectionTitle: {
    marginBottom: Spacing.LIST_GAP,
    marginTop: Spacing.SECTION_GAP,
  },
  reportedItem: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.LIST_GAP,
    ...Shadows.SOFT,
  },
  reportDetails: {
    marginVertical: Spacing.LIST_GAP,
  },
  reportReason: {
    color: Colors.GRAY_MED,
    fontSize: 14,
    marginBottom: 4,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButton: {
    flex: 1,
    marginHorizontal: Spacing.LIST_GAP,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.LIST_GAP,
    ...Shadows.SOFT,
  },
  userInfo: {
    flex: 1,
    marginRight: Spacing.COMPONENT,
  },
  userEmail: {
    color: Colors.GRAY_MED,
    fontSize: 14,
    marginVertical: 4,
  },
  blockReason: {
    color: Colors.GRAY_MED,
    fontSize: 14,
  },
  accessDeniedText: {
    textAlign: 'center',
    color: Colors.GRAY_MED,
  },
});