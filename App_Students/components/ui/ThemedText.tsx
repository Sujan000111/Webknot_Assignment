import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'button';
  color?: string;
}

export function ThemedText({ 
  style, 
  variant = 'default', 
  color,
  ...rest 
}: ThemedTextProps) {
  return (
    <Text 
      style={[
        styles[variant],
        color && { color },
        style,
      ]} 
      {...rest} 
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});