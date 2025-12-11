import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, where, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';

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

export default function ReviewsScreen() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Get productId from route params
  const { productId } = useLocalSearchParams();
  
  // Ensure productId is a string
  const productIdString = typeof productId === 'string' ? productId : '';

  // Validate productId
  useEffect(() => {
    if (!productIdString) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }
  }, [productIdString]);

  // Fetch reviews and product data from Firestore
  useEffect(() => {
    // Skip if productId is invalid
    if (!productIdString) {
      return;
    }
    
    // Fetch reviews
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productIdString),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribeReviews = onSnapshot(reviewsQuery, 
      (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews. Please try again later.');
      }
    );
    
    // Fetch product rating stats
    const fetchProductStats = async () => {
      try {
        const productRef = doc(db, 'products', productIdString);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          setAverageRating(productData.averageRating || 0);
          setTotalReviews(productData.totalReviews || 0);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProductStats();
    
    return () => {
      unsubscribeReviews();
    };
  }, [productIdString]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    if (!productIdString) {
      setError('Invalid product ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Save the review to Firestore
      const reviewData = {
        productId: productIdString,
        userId: 'USER_ID', // Would come from auth state
        userName: 'USER_NAME', // Would come from user profile
        userAvatar: 'USER_AVATAR', // Would come from user profile
        rating,
        comment,
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update product rating stats
      const productRef = doc(db, 'products', productIdString);
      await updateDoc(productRef, {
        averageRating: ((averageRating * totalReviews) + rating) / (totalReviews + 1),
        totalReviews: increment(1)
      });
      
      // Update local state
      const newReview = {
        id: `${Date.now()}`,
        user: {
          name: 'Current User',
          avatar: 'https://picsum.photos/200/200?random=15',
        },
        rating,
        comment,
        date: new Date().toISOString().split('T')[0],
      };
      
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      // Update average rating (demo calculation)
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(totalRating / updatedReviews.length);
      setTotalReviews(updatedReviews.length);
      
      setRating(0);
      setComment('');
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={[styles.reviewCard, getShadowStyle(Shadows.SOFT)]}>
      <View style={styles.reviewHeader}>
        <Avatar source={item.userAvatar || 'https://picsum.photos/200/200?random=12'} size={40} />
        <View style={styles.reviewUserInfo}>
          <ThemedText type="defaultSemiBold">{item.userName || 'Anonymous'}</ThemedText>
          <StarRating rating={item.rating} size={16} />
        </View>
        <ThemedText style={styles.reviewDate}>
          {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
        </ThemedText>
      </View>
      <ThemedText style={styles.reviewComment}>{item.comment}</ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading reviews...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Reviews</ThemedText>
        <View style={styles.ratingSummary}>
          <ThemedText type="subtitle" style={styles.averageRating}>
            {averageRating.toFixed(1)}
          </ThemedText>
          <StarRating rating={averageRating} size={20} />
          <ThemedText style={styles.totalReviews}>
            ({totalReviews} reviews)
          </ThemedText>
        </View>
      </View>

      {/* Error message */}
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      {/* Action Button */}
      <Button 
        title={showReviewForm ? "Cancel" : "Write a Review"} 
        variant="secondary" 
        onPress={() => setShowReviewForm(!showReviewForm)}
        style={styles.actionButton}
      />

      {/* Review Form */}
      {showReviewForm && (
        <View style={[styles.reviewForm, getShadowStyle(Shadows.SOFT)]}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            Your Rating
          </ThemedText>
          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
              >
                <StarRating rating={star <= rating ? star : 0} size={32} maxStars={1} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, getShadowStyle(Shadows.SOFT)]}
              value={comment}
              onChangeText={setComment}
              placeholder="Write your review..."
              placeholderTextColor={Colors.GRAY_MED}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <Button 
            title="Submit Review" 
            onPress={handleSubmitReview}
            disabled={loading}
          />
        </View>
      )}

      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.reviewsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText>No reviews yet. Be the first to review!</ThemedText>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.LIST_GAP,
  },
  averageRating: {
    color: Colors.PRIMARY_START,
  },
  totalReviews: {
    color: Colors.GRAY_MED,
  },
  errorText: {
    color: Colors.ALERT_RED,
    marginBottom: Spacing.LIST_GAP,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: Spacing.SECTION_GAP,
  },
  reviewForm: {
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.SECTION_GAP,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.SECTION_GAP,
  },
});