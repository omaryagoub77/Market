import { getChatRoomId } from '../utils/chatUtils';

describe('chatUtils', () => {
  test('getChatRoomId generates consistent IDs', () => {
    const userId1 = 'user123';
    const userId2 = 'user456';
    
    // Test that the same users always get the same chat ID
    const chatId1 = getChatRoomId(userId1, userId2);
    const chatId2 = getChatRoomId(userId2, userId1); // Order shouldn't matter
    
    expect(chatId1).toBe(chatId2);
    expect(chatId1).toBe('chat_user123_user456');
  });
});