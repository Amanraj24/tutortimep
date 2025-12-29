// src/components/Card.tsx
// ==============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient = false,
  onPress,
  title,
  subtitle,
}) => {
  const content = (
    <>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.9}
        style={[styles.cardContainer, style]}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, SHADOWS.medium]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[styles.card, SHADOWS.medium, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, SHADOWS.medium, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SIZES.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  header: {
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
});

export default Card;