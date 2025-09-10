import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Event } from '@/types';
import { Calendar, MapPin, Users, Star } from 'lucide-react-native';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  variant?: 'default' | 'featured';
}

export function EventCard({ 
  event, 
  onPress,
  variant = 'default' 
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hackathon: Colors.accent,
      workshop: Colors.success,
      techTalk: Colors.secondary,
      seminar: Colors.primary,
      fest: Colors.pink,
      competition: '#ef4444',
    };
    return colors[type] || Colors.gray[500];
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity onPress={onPress} style={styles.featuredCard}>
        <Image 
          source={{ uri: event.imageUrl || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg' }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <View style={[styles.typeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
              <ThemedText variant="caption" color={Colors.background}>
                {event.type.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText variant="subtitle" color={Colors.background} numberOfLines={2}>
              {event.title}
            </ThemedText>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.background} />
                <ThemedText variant="caption" color={Colors.background}>
                  {formatDate(event.startDate)}
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Users size={14} color={Colors.background} />
                <ThemedText variant="caption" color={Colors.background}>
                  {event.registeredCount}/{event.capacity}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView variant="card" style={styles.card}>
        <View style={styles.cardHeader}>
          <Image 
            source={{ uri: event.imageUrl || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg' }}
            style={styles.cardImage}
          />
          <View style={[styles.typeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
            <ThemedText variant="caption" color={Colors.background}>
              {event.type.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <ThemedText variant="subtitle" numberOfLines={2} style={styles.title}>
            {event.title}
          </ThemedText>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <ThemedText variant="caption">
                {formatDate(event.startDate)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color={Colors.textSecondary} />
              <ThemedText variant="caption">
                {event.registeredCount}/{event.capacity}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={Colors.textSecondary} />
              <ThemedText variant="caption" numberOfLines={1}>
                {event.venue}
              </ThemedText>
            </View>
            {event.rating && (
              <View style={styles.metaItem}>
                <Star size={16} color={Colors.secondary} />
                <ThemedText variant="caption">
                  {event.rating} ({event.reviewCount})
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={[
                styles.registerButton,
                event.isRegistered && styles.registeredButton
              ]}
            >
              <ThemedText 
                variant="button" 
                style={[
                  styles.registerText,
                  event.isRegistered && styles.registeredText
                ]}
              >
                {event.isRegistered ? 'Registered' : 'Register'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Layout.spacing.md,
    overflow: 'hidden',
  },
  featuredCard: {
    width: 300,
    height: 200,
    marginRight: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.gray[200],
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    padding: Layout.spacing.md,
  },
  featuredContent: {
    gap: Layout.spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  typeBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  cardContent: {
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  title: {
    marginBottom: Layout.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    flex: 1,
  },
  cardFooter: {
    marginTop: Layout.spacing.sm,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: Colors.success,
  },
  registerText: {
    color: Colors.background,
  },
  registeredText: {
    color: Colors.background,
  },
});