import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { EventCard } from '@/components/ui/EventCard';
import { Event } from '@/types/shared';
import { ApiService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { 
  Code, 
  Wrench, 
  Mic, 
  BookOpen, 
  PartyPopper, 
  Trophy,
  ChevronRight,
  Bell
} from 'lucide-react-native';

const categories = [
  { id: 'hackathon', name: 'Hackathons', icon: Code, color: Colors.accent },
  { id: 'workshop', name: 'Workshops', icon: Wrench, color: Colors.success },
  { id: 'techTalk', name: 'Tech Talks', icon: Mic, color: Colors.secondary },
  { id: 'seminar', name: 'Seminars', icon: BookOpen, color: Colors.primary },
  { id: 'fest', name: 'Fests', icon: PartyPopper, color: Colors.pink },
  { id: 'competition', name: 'Competitions', icon: Trophy, color: '#ef4444' },
];

export default function HomeScreen() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    registered: 0,
    attended: 0,
    averageRating: 0,
  });
  const { appUser } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getEvents(1, 20);
      const events = response.data;
      
      // Filter featured events (you can add a featured flag to your database)
      const featured = events.filter(event => event.isFeatured).slice(0, 2);
      const upcoming = events.filter(event => new Date(event.startDate) > new Date()).slice(0, 4);
      
      setFeaturedEvents(featured);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error loading events:', error);
      // Don't show alert on initial load, just log the error
      if (featuredEvents.length === 0 && upcomingEvents.length === 0) {
        console.warn('No events loaded - this might be expected if no events exist yet');
      } else {
        Alert.alert('Error', 'Failed to load events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [featuredEvents.length, upcomingEvents.length]);

  const loadStats = useCallback(async () => {
    try {
      if (!appUser) return;
      
      const registrations = await ApiService.getMyRegistrations();
      const attendedEvents = registrations.filter(reg => reg.status === 'confirmed');
      
      setStats({
        registered: registrations.length,
        attended: attendedEvents.length,
        averageRating: 4.6, // This would come from feedback data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [appUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadEvents(), loadStats()]);
    setRefreshing(false);
  }, [loadEvents, loadStats]);

  useEffect(() => {
    loadEvents();
    loadStats();
  }, [appUser, loadEvents, loadStats]);

  const renderFeaturedEvent = useCallback(({ item }: { item: Event }) => (
    <EventCard event={item} variant="featured" />
  ), []);

  const renderCategory = useCallback(({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <item.icon size={24} color={Colors.background} />
      </View>
      <ThemedText variant="default" style={styles.categoryName}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner} />
          <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="title">Welcome back! 👋</ThemedText>
            <ThemedText variant="caption" style={styles.subtitle}>
              {appUser ? `Hello, ${appUser.firstName}!` : 'Discover amazing events'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <ThemedText variant="caption" color={Colors.background}>
                3
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <ThemedView variant="card" style={styles.statCard}>
            <ThemedText variant="title" color={Colors.primary}>{stats.registered}</ThemedText>
            <ThemedText variant="caption">Registered</ThemedText>
          </ThemedView>
          <ThemedView variant="card" style={styles.statCard}>
            <ThemedText variant="title" color={Colors.success}>{stats.attended}</ThemedText>
            <ThemedText variant="caption">Attended</ThemedText>
          </ThemedView>
          <ThemedView variant="card" style={styles.statCard}>
            <ThemedText variant="title" color={Colors.secondary}>{stats.averageRating}⭐</ThemedText>
            <ThemedText variant="caption">Avg Rating</ThemedText>
          </ThemedView>
        </View>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Featured Events</ThemedText>
              <TouchableOpacity style={styles.seeAllButton}>
                <ThemedText variant="caption" color={Colors.primary}>See All</ThemedText>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredEvents}
              renderItem={renderFeaturedEvent}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Event Categories
          </ThemedText>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
          />
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText variant="subtitle">Upcoming Events</ThemedText>
              <TouchableOpacity style={styles.seeAllButton}>
                <ThemedText variant="caption" color={Colors.primary}>See All</ThemedText>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}

        {/* No Events Message */}
        {featuredEvents.length === 0 && upcomingEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText variant="subtitle" style={styles.emptyTitle}>
              No Events Available
            </ThemedText>
            <ThemedText variant="caption" style={styles.emptyMessage}>
              Check back later for new events!
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    marginBottom: Layout.spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  subtitle: {
    marginTop: Layout.spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: Layout.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  featuredList: {
    paddingHorizontal: Layout.spacing.lg,
  },
  categoryRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    width: (Layout.window.width - Layout.spacing.lg * 3) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  categoryName: {
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyTitle: {
    marginBottom: Layout.spacing.sm,
  },
  emptyMessage: {
    textAlign: 'center',
  },
});