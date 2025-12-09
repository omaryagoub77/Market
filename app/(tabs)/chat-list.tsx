import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data
const chats = [
  {
    id: '1',
    user: {
      name: 'Alice Johnson',
      avatar: 'https://picsum.photos/200/200?random=9',
    },
    lastMessage: 'Hey, is this still available?',
    timestamp: '2 hours ago',
    unread: 3,
  },
  {
    id: '2',
    user: {
      name: 'Bob Smith',
      avatar: 'https://picsum.photos/200/200?random=10',
    },
    lastMessage: 'Sure, I can meet tomorrow',
    timestamp: '1 day ago',
    unread: 0,
  },
  {
    id: '3',
    user: {
      name: 'Carol Williams',
      avatar: 'https://picsum.photos/200/200?random=11',
    },
    lastMessage: 'Thanks for the quick response!',
    timestamp: '2 days ago',
    unread: 0,
  },
];

export default function ChatListScreen() {
  const [chatData, setChatData] = useState(chats);

  const handleChatPress = (chatId: string) => {
    console.log('Opening chat:', chatId);
    // Navigate to chat room
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Messages
      </ThemedText>
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => handleChatPress(item.id)}
          >
            <Avatar 
              source={item.user.avatar} 
              size={56} 
            />
            <View style={styles.chatInfo}>
              <ThemedText type="defaultSemiBold">{item.user.name}</ThemedText>
              <ThemedText numberOfLines={1} style={styles.lastMessage}>
                {item.lastMessage}
              </ThemedText>
            </View>
            <View style={styles.chatMeta}>
              <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{item.unread}</ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
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
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.COMPONENT,
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
    marginLeft: Spacing.COMPONENT,
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
    color: Colors.BLACK,
    fontSize: 12,
    fontWeight: 'bold',
  },
});