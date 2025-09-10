import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
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
import { QrCode, Calendar, Heart, CircleCheck as CheckCircle } from 'lucide-react-native';

const tabs = [
  { id: 'registered', name: 'Registered', icon: Calendar },
  { id: 'attended', name: 'Attended', icon: CheckCircle },
  { id: 'favorites', name: 'Favorites', icon: Heart },
  { id: 'checkin', name: 'Check-in', icon: QrCode },
];

// Mock data
const registeredEvents: Event[] = [
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
    isRegistered: true,
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
    isRegistered: true,
  },
];

const attendedEvents: Event[] = [
  {
    id: '5',
    title: 'React Workshop - Basics',
    description: 'Learn React fundamentals',
    type: 'workshop',
    startDate: '2024-01-15T14:00:00Z',
    endDate: '2024-01-15T17:00:00Z',
    venue: 'Lab 2, IT Block',
    capacity: 30,
    registeredCount: 30,
    imageUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    organizer: 'Web Dev Club',
    isFeatured: false,
    rating: 4.8,
    reviewCount: 25,
  },
];

export default function MyEventsScreen() {
  const [activeTab, setActiveTab] = useState('registered');

  const getTabContent = () => {
    switch (activeTab) {
      case 'registered':
        return (
          <View style={styles.tabContent}>
            <ThemedText variant="subtitle" style={styles.contentTitle}>
              Your Registered Events
            </ThemedText>
            <ThemedText variant="caption" style={styles.contentSubtitle}>
              {registeredEvents.length} events registered
            </ThemedText>
            {registeredEvents.map((event) => (
              <View key={event.id} style={styles.registeredEventCard}>
                <EventCard event={event} />
                <View style={styles.eventActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <ThemedText variant="button" style={styles.actionButtonText}>
                      View Details
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                    <ThemedText variant="button" style={styles.cancelButtonText}>
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      
      case 'attended':
        return (
          <View style={styles.tabContent}>
            <ThemedText variant="subtitle" style={styles.contentTitle}>
              Events You Attended
            </ThemedText>
            <ThemedText variant="caption" style={styles.contentSubtitle}>
              {attendedEvents.length} events attended • 80% attendance rate
            </ThemedText>
            {attendedEvents.map((event) => (
              <View key={event.id} style={styles.attendedEventCard}>
                <EventCard event={event} />
                <View style={styles.feedbackSection}>
                  <ThemedText variant="caption" color={Colors.success}>
                    ✅ Attended on Jan 15, 2024
                  </ThemedText>
                  <TouchableOpacity style={styles.feedbackButton}>
                    <ThemedText variant="button" style={styles.feedbackButtonText}>
                      Give Feedback
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      
      case 'favorites':
        return (
          <View style={styles.tabContent}>
            <ThemedText variant="subtitle" style={styles.contentTitle}>
              Your Favorite Events
            </ThemedText>
            <View style={styles.emptyState}>
              <Heart size={64} color={Colors.gray[300]} />
              <ThemedText variant="default" style={styles.emptyStateText}>
                No favorite events yet
              </ThemedText>
              <ThemedText variant="caption" style={styles.emptyStateSubtext}>
                Tap the heart icon on events to add them to favorites
              </ThemedText>
            </View>
          </View>
        );
      
      case 'checkin':
        return (
          <View style={styles.tabContent}>
            <ThemedText variant="subtitle" style={styles.contentTitle}>
              Event Check-in
            </ThemedText>
            <ThemedView variant="card" style={styles.qrCodeCard}>
              <QrCode size={200} color={Colors.primary} />
              <ThemedText variant="default" style={styles.qrCodeTitle}>
                AI & ML Hackathon 2024
              </ThemedText>
              <ThemedText variant="caption" style={styles.qrCodeSubtitle}>
                Show this QR code to event organizers for check-in
              </ThemedText>
              <View style={styles.qrCodeMeta}>
                <ThemedText variant="caption">Event starts: Feb 15, 9:00 AM</ThemedText>
                <ThemedText variant="caption">Venue: Tech Hub, Main Campus</ThemedText>
              </View>
              <TouchableOpacity style={styles.refreshButton}>
                <ThemedText variant="button" style={styles.refreshButtonText}>
                  Refresh Code
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="title">My Events</ThemedText>
        <ThemedText variant="caption" style={styles.headerSubtitle}>
          Manage your event registrations and attendance
        </ThemedText>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
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
              color={activeTab === tab.id ? Colors.background : Colors.textSecondary} 
            />
            <ThemedText 
              variant="caption" 
              color={activeTab === tab.id ? Colors.background : Colors.textSecondary}
              style={styles.tabText}
            >
              {tab.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {getTabContent()}
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
  tabScrollView: {
    flexGrow: 0,
  },
  tabContainer: {
    paddingHorizontal: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.gray[100],
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: Layout.spacing.lg,
  },
  tabContent: {
    padding: Layout.spacing.lg,
  },
  contentTitle: {
    marginBottom: Layout.spacing.xs,
  },
  contentSubtitle: {
    marginBottom: Layout.spacing.lg,
  },
  registeredEventCard: {
    marginBottom: Layout.spacing.lg,
  },
  eventActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.background,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  attendedEventCard: {
    marginBottom: Layout.spacing.lg,
  },
  feedbackSection: {
    marginTop: Layout.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  feedbackButtonText: {
    color: Colors.background,
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
  qrCodeCard: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  qrCodeTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  qrCodeSubtitle: {
    textAlign: 'center',
    maxWidth: 250,
  },
  qrCodeMeta: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.md,
  },
  refreshButtonText: {
    color: Colors.background,
  },
});