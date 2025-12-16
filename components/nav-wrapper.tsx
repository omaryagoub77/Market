import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResponsiveNavbar from '@/components/responsive-navbar';

interface NavWrapperProps {
  children: React.ReactNode;
}

const NavWrapper: React.FC<NavWrapperProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <ResponsiveNavbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    marginBottom: 74, // Height of the navbar to prevent overlap
  },
});

export default NavWrapper;