import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { ApiService } from '@/services/api';
import { router } from 'expo-router';
import { User, Calendar, Award, Settings, Bell, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Camera, Star, TrendingUp, Clock, Trophy } from 'lucide-react-native';

const achievements = [
  { id: 1, name: 'Early Bird', description: 'Registered for 5 events in advance', icon: '🐦', earned: true },
  { id: 2, name: 'Regular Attendee', description: 'Attended 10 events', icon: '📅', earned: true },
  { id: 3, name: 'Feedback Champion', description: 'Provided feedback for all attended events', icon: '⭐', earned: true },
  { id: 4, name: 'Tech Explorer', description: 'Attended events from 5 different categories', icon: '🔍', earned: false },
  { id: 5, name: 'Networking Pro', description: 'Connected with 20+ attendees', icon: '🤝', earned: false },
];

export default function ProfileScreen() {
  const { appUser, signOut } = useAuth();
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsAttended: 0,
    attendanceRate: 0,
    averageRating: 0,
    achievementPoints: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      if (!appUser) return;

      const registrations = await ApiService.getMyRegistrations();
      const attendedEvents = registrations.filter(reg => reg.status === 'confirmed');
      
      setStats({
        eventsRegistered: registrations.length,
        eventsAttended: attendedEvents.length,
        attendanceRate: registrations.length > 0 ? Math.round((attendedEvents.length / registrations.length) * 100) : 0,
        averageRating: 4.6, // This would come from feedback data
        achievementPoints: attendedEvents.length * 50,
        streak: 5, // This would be calculated from attendance patterns
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [appUser]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/signin');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
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
          <ThemedText>Please sign in to view your profile</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const recentActivity = [
    { id: 1, type: 'registration', event: 'AI & ML Hackathon 2024', date: '2024-02-10', icon: Calendar },
    { id: 2, type: 'attendance', event: 'React Workshop - Basics', date: '2024-01-15', icon: Award },
    { id: 3, type: 'feedback', event: 'Tech Talk: Future of Web', date: '2024-01-10', rating: 5, icon: Star },
    { id: 4, type: 'achievement', event: 'Earned Regular Attendee badge', date: '2024-01-05', icon: Trophy },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  const renderStatCard = (title: string, value: string | number, subtitle?: string, icon?: any) => {
    const IconComponent = icon;
    return (
      <ThemedView variant="card" style={styles.statCard}>
        <View style={styles.statHeader}>
          {IconComponent && <IconComponent size={20} color={Colors.primary} />}
          <ThemedText variant="caption" color={Colors.textSecondary}>
            {title}
          </ThemedText>
        </View>
        <ThemedText variant="title" color={Colors.primary} style={styles.statValue}>
          {value}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" style={styles.statSubtitle}>
            {subtitle}
          </ThemedText>
        )}
      </ThemedView>
    );
  };

  const renderAchievement = (achievement: typeof achievements[0]) => (
    <View key={achievement.id} style={styles.achievementItem}>
      <View style={[styles.achievementIcon, !achievement.earned && styles.unearnedIcon]}>
        <ThemedText style={styles.achievementEmoji}>
          {achievement.earned ? achievement.icon : '🔒'}
        </ThemedText>
      </View>
      <View style={styles.achievementContent}>
        <ThemedText 
          variant="default" 
          style={[styles.achievementName, !achievement.earned && styles.unearnedText]}
        >
          {achievement.name}
        </ThemedText>
        <ThemedText variant="caption" style={styles.achievementDescription}>
          {achievement.description}
        </ThemedText>
      </View>
      {achievement.earned && (
        <Award size={20} color={Colors.secondary} />
      )}
    </View>
  );

  const renderActivityItem = (activity: typeof recentActivity[0]) => {
    const IconComponent = activity.icon;
    return (
      <View key={activity.id} style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <IconComponent size={18} color={Colors.primary} />
        </View>
        <View style={styles.activityContent}>
          <ThemedText variant="default" style={styles.activityTitle}>
            {activity.event}
          </ThemedText>
          <ThemedText variant="caption" style={styles.activityDate}>
            {new Date(activity.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </ThemedText>
        </View>
        {activity.rating && (
          <View style={styles.activityRating}>
            <Star size={14} color={Colors.secondary} />
            <ThemedText variant="caption">{activity.rating}</ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Profile</ThemedText>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <ThemedView variant="card" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: appUser.profileImage || 'https://via.placeholder.com/100' }} 
                style={styles.profileImage} 
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={Colors.background} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText variant="subtitle" style={styles.profileName}>
                {appUser.firstName} {appUser.lastName}
              </ThemedText>
              <ThemedText variant="caption" style={styles.studentId}>
                {appUser.studentId}
              </ThemedText>
              <ThemedText variant="caption" style={styles.college}>
                {appUser.department}, Year {appUser.yearOfStudy}
              </ThemedText>
              <ThemedText variant="caption" style={styles.email}>
                {appUser.email}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Events Registered', stats.eventsRegistered, undefined, Calendar)}
          {renderStatCard('Events Attended', stats.eventsAttended, `${stats.attendanceRate}% rate`, TrendingUp)}
          {renderStatCard('Average Rating', `${stats.averageRating}⭐`, 'Given by you', Star)}
          {renderStatCard('Current Streak', `${stats.streak} events`, 'In a row', Clock)}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="subtitle">Achievements</ThemedText>
            <ThemedText variant="caption" color={Colors.primary}>
              {achievements.filter(a => a.earned).length}/{achievements.length} unlocked
            </ThemedText>
          </View>
          <ThemedView variant="card" style={styles.achievementsContainer}>
            {achievements.slice(0, 3).map(renderAchievement)}
            <TouchableOpacity style={styles.viewAllButton}>
              <ThemedText variant="caption" color={Colors.primary}>
                View All Achievements
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          <ThemedView variant="card" style={styles.activityContainer}>
            {recentActivity.map(renderActivityItem)}
          </ThemedView>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <ThemedView variant="card" style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.textSecondary} />
                <ThemedText variant="default">Notifications</ThemedText>
              </View>
              <ThemedText variant="caption" color={Colors.textSecondary}>
                Events, reminders
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Settings size={20} color={Colors.textSecondary} />
                <ThemedText variant="default">App Preferences</ThemedText>
              </View>
              <ThemedText variant="caption" color={Colors.textSecondary}>
                Theme, language
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <HelpCircle size={20} color={Colors.textSecondary} />
                <ThemedText variant="default">Help & Support</ThemedText>
              </View>
              <ThemedText variant="caption" color={Colors.textSecondary}>
                FAQ, contact us
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
              <View style={styles.settingInfo}>
                <LogOut size={20} color="#ef4444" />
                <ThemedText variant="default" color="#ef4444">
                  Logout
                </ThemedText>
              </View>
            </TouchableOpacity>
          </ThemedView>
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
  editButton: {
    padding: Layout.spacing.sm,
  },
  profileCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: Layout.spacing.xs,
  },
  profileName: {
    fontWeight: '700',
  },
  studentId: {
    fontWeight: '600',
    color: Colors.primary,
  },
  college: {
    color: Colors.textSecondary,
  },
  email: {
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: (Layout.window.width - Layout.spacing.lg * 3) / 2,
    padding: Layout.spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Layout.spacing.xs,
  },
  statSubtitle: {
    fontSize: 12,
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
  achievementsContainer: {
    marginHorizontal: Layout.spacing.lg,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unearnedIcon: {
    backgroundColor: Colors.gray[200],
  },
  achievementEmoji: {
    fontSize: 18,
  },
  achievementContent: {
    flex: 1,
    gap: Layout.spacing.xs,
  },
  achievementName: {
    fontWeight: '600',
  },
  unearnedText: {
    color: Colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 12,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  activityContainer: {
    marginHorizontal: Layout.spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    gap: Layout.spacing.xs,
  },
  activityTitle: {
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
  },
  activityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  settingsContainer: {
    marginHorizontal: Layout.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});