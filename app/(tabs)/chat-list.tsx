import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db, auth } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChatListScreen() {
  const router = useRouter();
  const [chatData, setChatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch chat data from Firestore
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // In a real app, you would fetch actual chat conversations
    // This is just mock data for demonstration
    const mockChats = [
      {
        id: '1',
        name: 'John Doe',
        lastMessage: 'Hey, how much for the iPhone?',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        unread: 2,
        avatar: 'https://picsum.photos/200/200?random=1',
      },
      {
        id: '2',
        name: 'Jane Smith',
        lastMessage: 'Is this still available?',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        unread: 0,
        avatar: 'https://picsum.photos/200/200?random=2',
      },
      {
        id: '3',
        name: 'Mike Johnson',
        lastMessage: 'Thanks for the quick response!',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        unread: 0,
        avatar: 'https://picsum.photos/200/200?random=3',
      },
    ];

    setChatData(mockChats);
    setLoading(false);
  }, [currentUser]);

  const handleChatPress = (chatId: string) => {
    router.push(`/chat-room?id=${chatId}`);
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item.id)}
    >
      <Avatar source={item.avatar} size={56} />
      <View style={styles.chatInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <View style={styles.chatMeta}>
        <ThemedText style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
        {item.unread > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.unread}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading chats...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ProtectedRoute redirectTo="/(tabs)/chat-list">
      <ThemedView style={styles.container}>
        <FlatList
          data={chatData}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.contentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="message" size={64} color={Colors.GRAY_MED} />
              <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start chatting with sellers and buyers
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.LIST_GAP,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  chatInfo: {
    flex: 1,
    marginLeft: Spacing.COMPONENT,
  },
  lastMessage: {
    color: Colors.GRAY_MED,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: Spacing.LIST_GAP,
  },
  timestamp: {
    color: Colors.GRAY_MED,
    fontSize: 12,
  },
  badge: {
    backgroundColor: Colors.PRIMARY_START,
    borderRadius: Radii.CIRCLE,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeText: {
    color: Colors.BG_LIGHT,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: Spacing.COMPONENT,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
    textAlign: 'center',
  },
});