import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data
const reviews = [
  {
    id: '1',
    user: {
      name: 'Alice Johnson',
      avatar: 'https://picsum.photos/200/200?random=12',
    },
    rating: 5,
    comment: 'Great product! Exactly as described. Fast shipping too.',
    date: '2023-05-15',
  },
  {
    id: '2',
    user: {
      name: 'Bob Smith',
      avatar: 'https://picsum.photos/200/200?random=13',
    },
    rating: 4,
    comment: 'Good quality, but took a bit longer to arrive than expected.',
    date: '2023-05-10',
  },
  {
    id: '3',
    user: {
      name: 'Carol Williams',
      avatar: 'https://picsum.photos/200/200?random=14',
    },
    rating: 5,
    comment: 'Excellent service and product quality. Highly recommend!',
    date: '2023-05-05',
  },
];

const averageRating = 4.7;
const totalReviews = 128;

export default function ReviewsScreen() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmitReview = () => {
    if (rating > 0 && comment.trim()) {
      console.log('Submitting review:', { rating, comment });
      setRating(0);
      setComment('');
      setShowReviewForm(false);
    }
  };

  const renderReview = ({ item }: { item: typeof reviews[0] }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar source={item.user.avatar} size={40} />
        <View style={styles.reviewUserInfo}>
          <ThemedText type="defaultSemiBold">{item.user.name}</ThemedText>
          <StarRating rating={item.rating} size={16} />
        </View>
        <ThemedText style={styles.reviewDate}>{item.date}</ThemedText>
      </View>
      <ThemedText style={styles.reviewComment}>{item.comment}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Reviews</ThemedText>
        <View style={styles.ratingSummary}>
          <ThemedText type="subtitle" style={styles.averageRating}>
            {averageRating}
          </ThemedText>
          <StarRating rating={averageRating} size={20} />
          <ThemedText style={styles.totalReviews}>
            ({totalReviews} reviews)
          </ThemedText>
        </View>
      </View>

      {/* Action Button */}
      <Button 
        title={showReviewForm ? "Cancel" : "Write a Review"} 
        variant="secondary" 
        onPress={() => setShowReviewForm(!showReviewForm)}
        style={styles.actionButton}
      />

      {/* Review Form */}
      {showReviewForm && (
        <View style={styles.reviewForm}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            Your Rating
          </ThemedText>
          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <StarRating rating={star <= rating ? star : 0} maxStars={1} size={32} />
              </TouchableOpacity>
            ))}
          </View>
          
          <ThemedText type="subtitle" style={styles.formTitle}>
            Your Review
          </ThemedText>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <Button 
            title="Submit Review" 
            onPress={handleSubmitReview}
            disabled={rating === 0 || !comment.trim()}
          />
        </View>
      )}

      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.reviewsList}
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
  header: {
    marginBottom: Spacing.SECTION_GAP,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.LIST_GAP,
  },
  averageRating: {
    marginRight: Spacing.LIST_GAP,
  },
  totalReviews: {
    marginLeft: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  actionButton: {
    marginBottom: Spacing.SECTION_GAP,
  },
  reviewForm: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.SECTION_GAP,
    ...Shadows.SOFT,
  },
  formTitle: {
    marginBottom: Spacing.LIST_GAP,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.SECTION_GAP,
  },
  starButton: {
    padding: Spacing.LIST_GAP,
  },
  textAreaContainer: {
    marginBottom: Spacing.SECTION_GAP,
  },
  textArea: {
    height: 100,
    backgroundColor: Colors.BG_LIGHT,
    borderRadius: Radii.BUTTON,
    padding: Spacing.COMPONENT,
    ...Shadows.SOFT,
    color: Colors.TEXT,
    textAlignVertical: 'top',
  },
  reviewsList: {
    paddingBottom: Spacing.SECTION_GAP,
  },
  reviewCard: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.LIST_GAP,
    ...Shadows.SOFT,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: Spacing.LIST_GAP,
  },
  reviewDate: {
    color: Colors.GRAY_MED,
    fontSize: 12,
  },
  reviewComment: {
    color: Colors.TEXT,
  },
});