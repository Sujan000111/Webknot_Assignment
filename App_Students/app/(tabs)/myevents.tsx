import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
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
import { QrCode, Calendar, Heart, CircleCheck as CheckCircle } from 'lucide-react-native';

const tabs = [
  { id: 'registered', name: 'Registered', icon: Calendar },
  { id: 'attended', name: 'Attended', icon: CheckCircle },
  { id: 'favorites', name: 'Favorites', icon: Heart },
  { id: 'checkin', name: 'Check-in', icon: QrCode },
];

export default function MyEventsScreen() {
  const [activeTab, setActiveTab] = useState('registered');
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuth();

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      if (!appUser) return;

      const registrations = await ApiService.getMyRegistrations();
      const myEvents = await ApiService.getMyEvents();
      
      // Filter events by registration status
      const registered = myEvents.filter(event => 
        registrations.some(reg => reg.eventId === event.id && reg.status === 'confirmed')
      );
      
      const attended = myEvents.filter(event => 
        registrations.some(reg => reg.eventId === event.id && reg.status === 'confirmed')
      );
      
      setRegisteredEvents(registered);
      setAttendedEvents(attended);
    } catch (error) {
      console.error('Error loading my events:', error);
      Alert.alert('Error', 'Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, [appUser]);

  const handleCancelRegistration = async (eventId: string) => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelRegistration(eventId);
              await loadMyEvents(); // Reload events
              Alert.alert('Success', 'Registration cancelled successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel registration. Please try again.');
            }
          }
        },
      ]
    );
  };

  if (!appUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Please sign in to view your events</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading your events...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const getCurrentEvents = () => {
    switch (activeTab) {
      case 'registered':
        return registeredEvents;
      case 'attended':
        return attendedEvents;
      case 'favorites':
        return []; // TODO: Implement favorites
      case 'checkin':
        return registeredEvents.filter(event => 
          new Date(event.startDate) <= new Date() && 
          new Date(event.endDate) >= new Date()
        );
      default:
        return [];
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <EventCard 
      event={item} 
      onCancelRegistration={activeTab === 'registered' ? () => handleCancelRegistration(item.id) : undefined}
    />
  );

  const currentEvents = getCurrentEvents();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">My Events</ThemedText>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon 
                size={20} 
                color={activeTab === tab.id ? Colors.primary : Colors.textSecondary} 
              />
              <ThemedText 
                variant="caption" 
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {currentEvents.length > 0 ? (
            <FlatList
              data={currentEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText variant="subtitle" style={styles.emptyTitle}>
                No {activeTab} events
              </ThemedText>
              <ThemedText variant="caption" style={styles.emptyMessage}>
                {activeTab === 'registered' && 'You haven\'t registered for any events yet.'}
                {activeTab === 'attended' && 'You haven\'t attended any events yet.'}
                {activeTab === 'favorites' && 'You haven\'t favorited any events yet.'}
                {activeTab === 'checkin' && 'No events available for check-in right now.'}
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
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
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