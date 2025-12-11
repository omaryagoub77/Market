import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii } from '@/src/theme';
import { Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';

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

export default function AdminScreen() {
  // In a real app, this would check if the current user is an admin
  const isAdmin = true; // Mock value
  const [reportedItems, setReportedItems] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch reported items and blocked users from Firestore
  useEffect(() => {
    // Fetch reported items
    const reportedItemsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeReports = onSnapshot(reportedItemsQuery, 
      (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReportedItems(reportsData);
      },
      (error) => {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports. Please try again later.');
      }
    );
    
    // Fetch blocked users
    const blockedUsersQuery = query(
      collection(db, 'users'),
      where('blocked', '==', true)
    );
    
    const unsubscribeBlocked = onSnapshot(blockedUsersQuery, 
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBlockedUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blocked users:', error);
        setError('Failed to load blocked users. Please try again later.');
        setLoading(false);
      }
    );
    
    return () => {
      unsubscribeReports();
      unsubscribeBlocked();
    };
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading admin panel...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Button 
            title="Retry" 
            onPress={() => window.location.reload()} 
          />
        </View>
      </ThemedView>
    );
  }

  const handleDeleteReport = async (reportId: string, itemId: string) => {
    try {
      // Delete the report
      await deleteDoc(doc(db, 'reports', reportId));
      
      // Optionally, delete the reported item itself
      // await deleteDoc(doc(db, 'items', itemId));
      
      console.log('Report deleted successfully');
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report. Please try again.');
    }
  };

  const handleBlockUser = async (userId: string, reportId: string) => {
    try {
      // Update user document to set blocked status
      await updateDoc(doc(db, 'users', userId), {
        blocked: true,
        blockReason: 'Violated community guidelines'
      });
      
      // Update report status
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'resolved'
      });
      
      console.log('User blocked successfully');
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user. Please try again.');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      // Update report status
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'dismissed'
      });
      
      console.log('Report dismissed successfully');
    } catch (err) {
      console.error('Error dismissing report:', err);
      setError('Failed to dismiss report. Please try again.');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      // Update user document to remove blocked status
      await updateDoc(doc(db, 'users', userId), {
        blocked: false,
        blockReason: ''
      });
      
      console.log('User unblocked successfully');
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user. Please try again.');
    }
  };

  if (!isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <IconSymbol name="lock.fill" size={48} color={Colors.GRAY_MED} />
          <ThemedText type="title" style={styles.accessDeniedText}>
            Access Denied
          </ThemedText>
          <ThemedText style={styles.accessDeniedText}>
            You don't have permission to access the admin panel.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Admin Panel
      </ThemedText>
      
      {/* Reported Items Section */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Reported Items
      </ThemedText>
      <FlatList
        data={reportedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.reportCard, getShadowStyle(Shadows.SOFT)]}>
            <ThemedText type="defaultSemiBold">{item.itemId || 'Unknown Item'}</ThemedText>
            <View style={styles.reportDetails}>
              <ThemedText style={styles.reportReason}>Reason: {item.reason || 'No reason provided'}</ThemedText>
              <ThemedText style={styles.reportReason}>Reported by: {item.reportedBy || 'Unknown user'}</ThemedText>
            </View>
            <View style={styles.adminActions}>
              <Button 
                title="Dismiss" 
                variant="secondary" 
                style={styles.adminButton}
                onPress={() => handleDismissReport(item.id)}
              />
              <Button 
                title="Block User" 
                variant="secondary" 
                style={styles.adminButton}
                onPress={() => handleBlockUser(item.userId, item.id)}
              />
              <Button 
                title="Delete" 
                variant="primary" 
                style={styles.adminButton}
                onPress={() => handleDeleteReport(item.id, item.itemId)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText>No reported items.</ThemedText>
          </View>
        }
      />
      
      {/* Blocked Users Section */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Blocked Users
      </ThemedText>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.userCard, getShadowStyle(Shadows.SOFT)]}>
            <View style={styles.userInfo}>
              <ThemedText type="defaultSemiBold">{item.name || 'Unknown User'}</ThemedText>
              <ThemedText style={styles.userEmail}>{item.email || 'No email'}</ThemedText>
              <ThemedText style={styles.blockReason}>Reason: {item.blockReason || 'No reason provided'}</ThemedText>
            </View>
            <Button 
              title="Unblock" 
              variant="secondary" 
              onPress={() => handleUnblockUser(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText>No blocked users.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.SCREEN_PADDING,
  },
  title: {
    marginBottom: Spacing.SECTION_GAP,
  },
  sectionTitle: {
    marginBottom: Spacing.COMPONENT,
    marginTop: Spacing.SECTION_GAP,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.COMPONENT,
    color: Colors.GRAY_MED,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.SECTION_GAP,
  },
  errorText: {
    color: Colors.ALERT_RED,
    textAlign: 'center',
    marginBottom: Spacing.COMPONENT,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.SECTION_GAP,
  },
  accessDeniedText: {
    textAlign: 'center',
    color: Colors.GRAY_MED,
  },
  reportCard: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.LIST_GAP,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.SECTION_GAP,
  },
});