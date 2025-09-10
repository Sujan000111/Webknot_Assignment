import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { EventCard } from '@/components/ui/EventCard';
import { Event } from '@/types';
import { 
  Search, 
  Filter, 
  Calendar,
  Code, 
  Wrench, 
  Mic, 
  BookOpen, 
  PartyPopper, 
  Trophy,
  MapPin,
  Map
} from 'lucide-react-native';

const allEvents: Event[] = [
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
  },
  {
    id: '5',
    title: 'Annual Tech Fest 2024',
    description: 'Three days of tech celebrations with various events',
    type: 'fest',
    startDate: '2024-03-01T09:00:00Z',
    endDate: '2024-03-03T20:00:00Z',
    venue: 'Main Campus',
    capacity: 1000,
    registeredCount: 567,
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    organizer: 'Student Council',
    isFeatured: true,
    rating: 4.9,
    reviewCount: 234,
  },
];

const categories = [
  { id: 'all', name: 'All Events', icon: Calendar, color: Colors.primary },
  { id: 'hackathon', name: 'Hackathons', icon: Code, color: Colors.accent },
  { id: 'workshop', name: 'Workshops', icon: Wrench, color: Colors.success },
  { id: 'techTalk', name: 'Tech Talks', icon: Mic, color: Colors.secondary },
  { id: 'seminar', name: 'Seminars', icon: BookOpen, color: Colors.primary },
  { id: 'fest', name: 'Fests', icon: PartyPopper, color: Colors.pink },
  { id: 'competition', name: 'Competitions', icon: Trophy, color: '#ef4444' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && [styles.activeCategoryChip, { backgroundColor: item.color }],
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <item.icon 
        size={18} 
        color={selectedCategory === item.id ? Colors.background : Colors.textSecondary} 
      />
      <ThemedText 
        variant="caption"
        color={selectedCategory === item.id ? Colors.background : Colors.textSecondary}
        style={styles.categoryChipText}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="title">Explore Events</ThemedText>
        <ThemedText variant="caption" style={styles.headerSubtitle}>
          Discover and register for campus events
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, topics, organizers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? Colors.background : Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          {viewMode === 'list' ? (
            <Map size={20} color={Colors.textSecondary} />
          ) : (
            <Calendar size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
      />

      {/* Advanced Filters */}
      {showFilters && (
        <ThemedView variant="card" style={styles.filtersContainer}>
          <ThemedText variant="subtitle" style={styles.filtersTitle}>
            Filters
          </ThemedText>
          <View style={styles.filterRow}>
            <ThemedText variant="default">Date Range</ThemedText>
            <TouchableOpacity style={styles.filterValue}>
              <Calendar size={16} color={Colors.primary} />
              <ThemedText variant="caption" color={Colors.primary}>
                This Week
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <ThemedText variant="default">Location</ThemedText>
            <TouchableOpacity style={styles.filterValue}>
              <MapPin size={16} color={Colors.primary} />
              <ThemedText variant="caption" color={Colors.primary}>
                All Venues
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <ThemedText variant="default">Availability</ThemedText>
            <TouchableOpacity style={styles.filterValue}>
              <ThemedText variant="caption" color={Colors.primary}>
                Open for Registration
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <ThemedText variant="caption">
          {filteredEvents.length} events found
        </ThemedText>
        {selectedCategory !== 'all' && (
          <TouchableOpacity 
            style={styles.clearFilters}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText variant="caption" color={Colors.primary}>
              Clear filters
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Search size={64} color={Colors.gray[300]} />
            <ThemedText variant="default" style={styles.emptyStateText}>
              No events found
            </ThemedText>
            <ThemedText variant="caption" style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
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
  header: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  headerSubtitle: {
    marginTop: Layout.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterButton: {
    backgroundColor: Colors.gray[100],
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  viewModeButton: {
    backgroundColor: Colors.gray[100],
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryListContent: {
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.lg,
  },
  activeCategoryChip: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontWeight: '600',
  },
  filtersContainer: {
    margin: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
  },
  filtersTitle: {
    marginBottom: Layout.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  filterValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  clearFilters: {
    paddingVertical: Layout.spacing.xs,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: Layout.spacing.xxl,
    gap: Layout.spacing.md,
  },
  emptyStateText: {
    fontWeight: '600',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    maxWidth: 250,
  },
});