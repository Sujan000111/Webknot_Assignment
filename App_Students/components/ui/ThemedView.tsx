import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'card' | 'primary';
}

export function ThemedView({ 
  style, 
  variant = 'default',
  ...rest 
}: ThemedViewProps) {
  return (
    <View 
      style={[
        styles[variant],
        style,
      ]} 
      {...rest} 
    />
  );
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
});