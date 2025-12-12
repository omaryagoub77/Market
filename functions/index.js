const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Function to send push notifications when a new message is created
exports.sendNewMessageNotification = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      // Get the newly created message data
      const messageData = snap.data();
      const chatId = context.params.chatId;
      const messageId = context.params.messageId;
      
      console.log('New message created:', messageId, 'in chat:', chatId);
      
      // Get the chat document to identify participants
      const chatDoc = await admin.firestore().doc(`chats/${chatId}`).get();
      if (!chatDoc.exists) {
        console.log('Chat document not found');
        return null;
      }
      
      const chatData = chatDoc.data();
      const participants = chatData.participants || [];
      
      // Identify the sender and other participants
      const senderId = messageData.senderId;
      const otherParticipants = participants.filter(participantId => participantId !== senderId);
      
      if (otherParticipants.length === 0) {
        console.log('No other participants to notify');
        return null;
      }
      
      // Get sender's user profile to get their name
      const senderDoc = await admin.firestore().doc(`users/${senderId}`).get();
      let senderName = 'Someone';
      
      if (senderDoc.exists) {
        const senderData = senderDoc.data();
        senderName = senderData.fullname || senderData.displayName || 'Someone';
      }
      
      // Prepare notification payload
      const notificationPayload = {
        notification: {
          title: `New message from ${senderName}`,
          body: messageData.text || 'You have a new message',
        },
        data: {
          chatId: chatId,
          senderId: senderId,
          messageId: messageId,
          type: 'NEW_MESSAGE'
        }
      };
      
      // Collect FCM tokens for all other participants
      const tokensPromises = otherParticipants.map(async (participantId) => {
        try {
          const userDoc = await admin.firestore().doc(`users/${participantId}`).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            // Return array of FCM tokens for this user
            return userData.fcmTokens || [];
          }
          return [];
        } catch (error) {
          console.error('Error fetching user data for participant:', participantId, error);
          return [];
        }
      });
      
      // Wait for all token fetches to complete
      const tokensArrays = await Promise.all(tokensPromises);
      
      // Flatten the arrays of tokens into a single array
      const allTokens = tokensArrays.flat().filter(token => token); // Remove any falsy values
      
      if (allTokens.length === 0) {
        console.log('No FCM tokens found for participants');
        return null;
      }
      
      console.log(`Sending notifications to ${allTokens.length} devices`);
      
      // Send multicast notification
      const response = await admin.messaging().sendMulticast({
        tokens: allTokens,
        ...notificationPayload
      });
      
      // Log results
      console.log('Notification sent successfully:', response.successCount, 'success,', response.failureCount, 'failures');
      
      // Clean up invalid tokens if any failed
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(allTokens[idx]);
            console.error('Failed to send notification to token:', allTokens[idx], resp.error);
          }
        });
        
        // TODO: Remove invalid tokens from user documents if needed
        // This would require additional logic to identify which user each token belongs to
      }
      
      return response;
    } catch (error) {
      console.error('Error in sendNewMessageNotification function:', error);
      return null;
    }
  });