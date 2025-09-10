import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
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

export default function ExploreScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { appUser } = useAuth();

  const categories = [
    { id: 'all', name: 'All', icon: Calendar },
    { id: 'hackathon', name: 'Hackathons', icon: Code },
    { id: 'workshop', name: 'Workshops', icon: Wrench },
    { id: 'techTalk', name: 'Tech Talks', icon: Mic },
    { id: 'seminar', name: 'Seminars', icon: BookOpen },
    { id: 'fest', name: 'Fests', icon: PartyPopper },
    { id: 'competition', name: 'Competitions', icon: Trophy },
  ];

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getEvents(1, 50);
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegisterForEvent = async (eventId: string) => {
    if (!appUser) {
      Alert.alert('Sign In Required', 'Please sign in to register for events.');
      return;
    }

    try {
      await ApiService.registerForEvent(eventId);
      Alert.alert('Success', 'Successfully registered for the event!');
      await loadEvents(); // Reload to update registration status
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register for event. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading events...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const renderEventCard = ({ item }: { item: Event }) => (
    <EventCard 
      event={item} 
      onRegister={handleRegisterForEvent}
    />
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <item.icon 
        size={20} 
        color={selectedCategory === item.id ? Colors.background : Colors.textSecondary} 
      />
      <ThemedText 
        variant="caption" 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Explore Events</ThemedText>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor={Colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Events Count */}
        <View style={styles.countContainer}>
          <ThemedText variant="caption" color={Colors.textSecondary}>
            {filteredEvents.length} events found
          </ThemedText>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {filteredEvents.length > 0 ? (
            <FlatList
              data={filteredEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText variant="subtitle" style={styles.emptyTitle}>
                No events found
              </ThemedText>
              <ThemedText variant="caption" style={styles.emptyMessage}>
                Try adjusting your search or filter criteria
              </ThemedText>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  filterButton: {
    padding: Layout.spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    marginBottom: Layout.spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: Layout.spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    marginRight: Layout.spacing.sm,
    backgroundColor: Colors.cardBackground,
    gap: Layout.spacing.xs,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: Colors.background,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  eventsList: {
    paddingBottom: Layout.spacing.xl,
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