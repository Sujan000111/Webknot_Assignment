import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { EventCard } from '@/components/ui/EventCard';
import { Event } from '@/types';
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

// Mock data for demonstration
const featuredEvents: Event[] = [
  {
    id: '1',
    title: 'AI & ML Hackathon 2024',
    description: 'Build innovative AI solutions in 48 hours',
    type: 'hackathon',
    startDate: '2024-02-15T09:00:00Z',
    endDate: '2024-02-17T18:00:00Z',
    venue: 'Tech Hub, Main Campus',
    capacity: 200,
    registeredCount: 156,
    imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    organizer: 'Computer Science Dept',
    isFeatured: true,
    rating: 4.8,
    reviewCount: 45,
  },
  {
    id: '2',
    title: 'React Native Workshop',
    description: 'Learn mobile app development from scratch',
    type: 'workshop',
    startDate: '2024-02-18T14:00:00Z',
    endDate: '2024-02-18T17:00:00Z',
    venue: 'Lab 1, IT Block',
    capacity: 50,
    registeredCount: 32,
    imageUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    organizer: 'Mobile Dev Club',
    isFeatured: true,
    rating: 4.6,
    reviewCount: 28,
  },
];

const upcomingEvents: Event[] = [
  {
    id: '3',
    title: 'Tech Talk: Future of Web Development',
    description: 'Industry expert shares insights on web tech trends',
    type: 'techTalk',
    startDate: '2024-02-20T16:00:00Z',
    endDate: '2024-02-20T17:30:00Z',
    venue: 'Main Auditorium',
    capacity: 300,
    registeredCount: 145,
    imageUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg',
    organizer: 'Tech Society',
    isFeatured: false,
    rating: 4.7,
    reviewCount: 67,
  },
  {
    id: '4',
    title: 'Data Science Competition',
    description: 'Compete in data analysis and visualization challenges',
    type: 'competition',
    startDate: '2024-02-25T10:00:00Z',
    endDate: '2024-02-25T16:00:00Z',
    venue: 'Analytics Lab',
    capacity: 100,
    registeredCount: 78,
    imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
    organizer: 'Data Science Club',
    isFeatured: false,
    rating: 4.5,
    reviewCount: 34,
    isRegistered: true,
  },
];

const categories = [
  { id: 'hackathon', name: 'Hackathons', icon: Code, color: Colors.accent, count: 3 },
  { id: 'workshop', name: 'Workshops', icon: Wrench, color: Colors.success, count: 8 },
  { id: 'techTalk', name: 'Tech Talks', icon: Mic, color: Colors.secondary, count: 5 },
  { id: 'seminar', name: 'Seminars', icon: BookOpen, color: Colors.primary, count: 12 },
  { id: 'fest', name: 'Fests', icon: PartyPopper, color: Colors.pink, count: 2 },
  { id: 'competition', name: 'Competitions', icon: Trophy, color: '#ef4444', count: 6 },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderFeaturedEvent = ({ item }: { item: Event }) => (
    <EventCard event={item} variant="featured" />
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <item.icon size={24} color={Colors.background} />
      </View>
      <ThemedText variant="default" style={styles.categoryName}>
        {item.name}
      </ThemedText>
      <ThemedText variant="caption" style={styles.categoryCount}>
        {item.count} events
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="title">Welcome back! 👋</ThemedText>
            <ThemedText variant="caption" style={styles.subtitle}>
              Discover amazing events at MVJCE
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
            <ThemedText variant="title" color={Colors.primary}>12</ThemedText>
            <ThemedText variant="caption">Registered</ThemedText>
          </ThemedView>
          <ThemedView variant="card" style={styles.statCard}>
            <ThemedText variant="title" color={Colors.success}>8</ThemedText>
            <ThemedText variant="caption">Attended</ThemedText>
          </ThemedView>
          <ThemedView variant="card" style={styles.statCard}>
            <ThemedText variant="title" color={Colors.secondary}>4.6⭐</ThemedText>
            <ThemedText variant="caption">Avg Rating</ThemedText>
          </ThemedView>
        </View>

        {/* Featured Events */}
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
  categoryCount: {
    textAlign: 'center',
  },
});