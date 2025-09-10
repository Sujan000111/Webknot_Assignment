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
import { Bell, Calendar, Award, Star, Users, Settings, CircleCheck as CheckCircle2, X } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'event_reminder' | 'registration_confirmed' | 'feedback_request' | 'achievement' | 'new_event';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  eventId?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'event_reminder',
    title: 'Event Starting Soon',
    message: 'AI & ML Hackathon 2024 starts in 1 hour. Don\'t forget to check in!',
    timestamp: '2024-02-15T08:00:00Z',
    read: false,
    actionRequired: true,
    eventId: '1',
  },
  {
    id: '2',
    type: 'registration_confirmed',
    title: 'Registration Confirmed',
    message: 'You\'re registered for React Native Workshop on Feb 18, 2024.',
    timestamp: '2024-02-14T15:30:00Z',
    read: false,
    eventId: '2',
  },
  {
    id: '3',
    type: 'feedback_request',
    title: 'Share Your Experience',
    message: 'How was the Web Development Workshop? Your feedback helps improve future events.',
    timestamp: '2024-02-13T18:00:00Z',
    read: true,
    actionRequired: true,
    eventId: '3',
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked! 🏆',
    message: 'Congratulations! You\'ve earned the "Regular Attendee" badge.',
    timestamp: '2024-02-12T10:00:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'new_event',
    title: 'New Event Available',
    message: 'Annual Tech Fest 2024 registration is now open. Limited seats available!',
    timestamp: '2024-02-10T09:00:00Z',
    read: true,
    eventId: '5',
  },
  {
    id: '6',
    type: 'event_reminder',
    title: 'Event Tomorrow',
    message: 'Don\'t forget: Data Science Competition is tomorrow at 10:00 AM.',
    timestamp: '2024-02-09T20:00:00Z',
    read: true,
    eventId: '4',
  },
];

export default function NotificationsScreen() {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event_reminder':
        return Calendar;
      case 'registration_confirmed':
        return CheckCircle2;
      case 'feedback_request':
        return Star;
      case 'achievement':
        return Award;
      case 'new_event':
        return Users;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'event_reminder':
        return Colors.secondary;
      case 'registration_confirmed':
        return Colors.success;
      case 'feedback_request':
        return Colors.accent;
      case 'achievement':
        return Colors.pink;
      case 'new_event':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotificationList(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotificationList(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const filteredNotifications = notificationList.filter(notification =>
    filter === 'all' || !notification.read
  );

  const unreadCount = notificationList.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const IconComponent = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        onPress={() => markAsRead(item.id)}
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.notificationIcon, { backgroundColor: iconColor + '20' }]}>
            <IconComponent size={20} color={iconColor} />
          </View>
          
          <View style={styles.notificationText}>
            <View style={styles.notificationHeader}>
              <ThemedText 
                variant="default" 
                style={[
                  styles.notificationTitle,
                  !item.read && styles.unreadTitle,
                ]}
              >
                {item.title}
              </ThemedText>
              <ThemedText variant="caption" style={styles.timestamp}>
                {formatTimestamp(item.timestamp)}
              </ThemedText>
            </View>
            
            <ThemedText variant="caption" style={styles.notificationMessage}>
              {item.message}
            </ThemedText>
            
            {item.actionRequired && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <ThemedText variant="caption" color={Colors.primary}>
                    {item.type === 'feedback_request' ? 'Give Feedback' : 'Take Action'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {!item.read && <View style={styles.unreadIndicator} />}
        
        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <X size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText variant="title">Notifications</ThemedText>
          <ThemedText variant="caption" style={styles.headerSubtitle}>
            Stay updated with campus events
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('all')}
        >
          <ThemedText
            variant="caption"
            color={filter === 'all' ? Colors.background : Colors.textSecondary}
            style={styles.filterTabText}
          >
            All ({notificationList.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('unread')}
        >
          <ThemedText
            variant="caption"
            color={filter === 'unread' ? Colors.background : Colors.textSecondary}
            style={styles.filterTabText}
          >
            Unread ({unreadCount})
          </ThemedText>
        </TouchableOpacity>
        
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <ThemedText variant="caption" color={Colors.primary}>
              Mark all read
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Bell size={64} color={Colors.gray[300]} />
          <ThemedText variant="default" style={styles.emptyStateText}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </ThemedText>
          <ThemedText variant="caption" style={styles.emptyStateSubtext}>
            {filter === 'unread' 
              ? 'All caught up! Check back later for updates.' 
              : 'We\'ll notify you about events and updates here'}
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  headerSubtitle: {
    marginTop: Layout.spacing.xs,
  },
  settingsButton: {
    padding: Layout.spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  filterTab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.lg,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontWeight: '600',
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingVertical: Layout.spacing.sm,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: Colors.primary + '05',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: Layout.spacing.xs,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontWeight: '600',
  },
  unreadTitle: {
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notificationMessage: {
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: Layout.spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: Layout.spacing.xs,
  },
  unreadIndicator: {
    position: 'absolute',
    left: Layout.spacing.sm,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    transform: [{ translateY: -4 }],
  },
  deleteButton: {
    position: 'absolute',
    right: Layout.spacing.lg,
    top: Layout.spacing.md,
    padding: Layout.spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xxl,
    gap: Layout.spacing.md,
  },
  emptyStateText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    maxWidth: 280,
  },
});