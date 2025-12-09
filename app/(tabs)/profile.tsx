import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://picsum.photos/200/200?random=8',
};

const listings = [
  { id: '1', title: 'Wireless Headphones', price: '$99.99', imageUrl: 'https://picsum.photos/300/300?random=1' },
  { id: '2', title: 'Smart Watch', price: '$199.99', imageUrl: 'https://picsum.photos/300/300?random=2' },
  { id: '3', title: 'Bluetooth Speaker', price: '$79.99', imageUrl: 'https://picsum.photos/300/300?random=3' },
];

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar 
            source={user.avatar} 
            size={80} 
            showRing={true} 
          />
          <View style={styles.userInfo}>
            <ThemedText type="title">{user.name}</ThemedText>
            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <IconSymbol 
              name={isEditing ? 'checkmark' : 'pencil'} 
              size={20} 
              color={Colors.ICON} 
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            title="Edit Profile" 
            variant="secondary" 
            onPress={() => console.log('Edit profile')}
            style={styles.actionButton}
          />
          <Button 
            title="My Listings" 
            variant="secondary" 
            onPress={() => console.log('My listings')}
            style={styles.actionButton}
          />
        </View>

        {/* My Listings */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          My Listings
        </ThemedText>
        <View style={styles.listingsContainer}>
          {listings.map((listing) => (
            <View key={listing.id} style={styles.listingItem}>
              <ProductCard 
                title={listing.title}
                price={listing.price}
                imageUrl={listing.imageUrl}
                onPress={() => console.log('Listing pressed')}
              />
              {isEditing && (
                <View style={styles.listingActions}>
                  <TouchableOpacity 
                    style={[styles.actionIcon, styles.editIcon]}
                    onPress={() => console.log('Edit listing')}
                  >
                    <IconSymbol name="pencil" size={20} color={Colors.BG_LIGHT} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionIcon, styles.deleteIcon]}
                    onPress={() => console.log('Delete listing')}
                  >
                    <IconSymbol name="trash" size={20} color={Colors.BG_LIGHT} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.COMPONENT,
  },
  userEmail: {
    color: Colors.GRAY_MED,
    marginTop: Spacing.LIST_GAP,
  },
  editButton: {
    padding: Spacing.LIST_GAP,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.SECTION_GAP,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.LIST_GAP,
  },
  sectionTitle: {
    marginBottom: Spacing.LIST_GAP,
  },
  listingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingItem: {
    width: '48%',
    marginBottom: Spacing.LIST_GAP,
    position: 'relative',
  },
  listingActions: {
    position: 'absolute',
    top: Spacing.COMPONENT,
    right: Spacing.COMPONENT,
    flexDirection: 'row',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.LIST_GAP,
  },
  editIcon: {
    backgroundColor: Colors.PRIMARY_START,
  },
  deleteIcon: {
    backgroundColor: Colors.ALERT_RED,
  },
});