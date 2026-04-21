import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../api/notificationApi';
import { format } from 'date-fns';

const NotificationsScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }

    if (item.targetScreen) {
      if (item.targetScreen === 'MeetingDetails' && item.targetId) {
        navigation.navigate('MeetingDetails', { requestId: parseInt(item.targetId) });
      } else {
        navigation.navigate(item.targetScreen);
      }
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isMeeting = item.title.toLowerCase().includes('meeting');
    const isProject = item.title.toLowerCase().includes('project');
    const isTeam = item.title.toLowerCase().includes('team');

    let icon = require('../assets/info.png');
    if (isMeeting) icon = require('../assets/meeting.png');
    if (isProject) icon = require('../assets/project.png');
    if (isTeam) icon = require('../assets/team.png');

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead ? 'transparent' : accentSoft,
            borderBottomColor: divider,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <Image source={icon} style={[styles.icon, { tintColor: colors.primary }]} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontWeight: item.isRead ? '500' : '700' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
          <Text style={[styles.message, { color: colors.subText }]} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={[styles.time, { color: colors.subText }]}>
            {format(new Date(item.createdAt), 'MMM d, h:mm a')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
          <Text style={{ color: colors.primary, fontSize: 14 }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.subText }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  markAllButton: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});
