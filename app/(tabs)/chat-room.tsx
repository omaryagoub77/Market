import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data
const messages = [
  {
    id: '1',
    text: 'Hi there! Is this still available?',
    sender: 'Alice',
    timestamp: '10:30 AM',
    isOwn: false,
  },
  {
    id: '2',
    text: 'Yes, it is! Would you like to meet up?',
    sender: 'Me',
    timestamp: '10:32 AM',
    isOwn: true,
  },
  {
    id: '3',
    text: 'Sure, I can meet tomorrow afternoon',
    sender: 'Alice',
    timestamp: '10:35 AM',
    isOwn: false,
  },
  {
    id: '4',
    text: 'Great! How about 2 PM at the coffee shop downtown?',
    sender: 'Me',
    timestamp: '10:36 AM',
    isOwn: true,
  },
];

export default function ChatRoomScreen() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <View style={[styles.messageContainer, item.isOwn ? styles.ownMessageContainer : styles.otherMessageContainer]}>
      {!item.isOwn && (
        <Avatar 
          source="https://picsum.photos/200/200?random=9" 
          size={32} 
        />
      )}
      <View style={[styles.messageBubble, item.isOwn ? styles.ownBubble : styles.otherBubble]}>
        {!item.isOwn && (
          <ThemedText style={styles.senderName}>{item.sender}</ThemedText>
        )}
        <ThemedText style={styles.messageText}>{item.text}</ThemedText>
        <ThemedText style={styles.messageTimestamp}>{item.timestamp}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <Avatar 
          source="https://picsum.photos/200/200?random=9" 
          size={40} 
        />
        <View style={styles.headerInfo}>
          <ThemedText type="defaultSemiBold">Alice Johnson</ThemedText>
          <ThemedText style={styles.onlineStatus}>Online</ThemedText>
        </View>
        <TouchableOpacity>
          <IconSymbol name="phone.fill" size={24} color={Colors.ICON} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <IconSymbol name="video.fill" size={24} color={Colors.ICON} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={Colors.GRAY_MED}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
        >
          <IconSymbol name="paperplane.fill" size={20} color={Colors.BG_LIGHT} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.COMPONENT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.LIST_GAP,
  },
  onlineStatus: {
    color: Colors.PRIMARY_START,
    fontSize: 12,
  },
  headerIcon: {
    marginLeft: Spacing.COMPONENT,
  },
  messagesContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.LIST_GAP,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.COMPONENT,
    borderRadius: Radii.BUTTON,
    ...Shadows.SOFT,
  },
  ownBubble: {
    backgroundColor: Colors.PRIMARY_START,
    marginLeft: Spacing.COMPONENT,
  },
  otherBubble: {
    backgroundColor: Colors.BG_ALT,
    marginRight: Spacing.COMPONENT,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    color: Colors.TEXT,
  },
  messageTimestamp: {
    fontSize: 10,
    color: Colors.GRAY_MED,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.SCREEN_PADDING,
    backgroundColor: Colors.BG_LIGHT,
  },
  textInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.BUTTON,
    paddingHorizontal: Spacing.COMPONENT,
    ...Shadows.SOFT,
    color: Colors.TEXT,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: Radii.CIRCLE,
    backgroundColor: Colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.LIST_GAP,
  },
});