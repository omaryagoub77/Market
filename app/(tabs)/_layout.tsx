import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="home-feed" options={{ headerShown: false }} />
      <Stack.Screen name="post-item" options={{ headerShown: false }} />
      <Stack.Screen name="chat-list" options={{ headerShown: false }} />
      <Stack.Screen name="my-products" options={{ headerShown: false }} />
      <Stack.Screen name="favourite" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="reviews" options={{ headerShown: false }} />
      <Stack.Screen name="more" options={{ headerShown: false }} />
      <Stack.Screen name="edit-product/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}