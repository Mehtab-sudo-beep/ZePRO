import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTeamProjectRequests } from '../api/studentApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type TeamRequestsNavProp = NativeStackNavigationProp<RootStackParamList, 'TeamProjectRequests'>;

const TeamProjectRequestsScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<TeamRequestsNavProp>();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchRequests = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
          const res = await getTeamProjectRequests(Number(user!.studentId));
          setRequests(res.data);
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Failed to fetch team project requests. Ensure you are in a team.');
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }, [user])
  );

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return '#16A34A';
      case 'SCHEDULED': return '#8B5CF6';
      case 'COMPLETED': return '#3B82F6';
      case 'REJECTED': return '#f44336';
      case 'PENDING': return '#ff9800';
      default: return colors.primary;
    }
  };

  const divider = isDark ? '#374151' : '#E5E7EB';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';

  const renderItem = ({ item }: { item: any }) => {
    const sColor = getStatusColor(item.status);
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.title, { color: colors.text }]}>{item.projectTitle}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Image source={isDark ? require('../assets/user-white.png') : require('../assets/user.png')} style={{width: 12, height: 12, marginRight: 6, tintColor: colors.subText}} />
              <Text style={[styles.value, { color: colors.subText }]}>{item.facultyName}</Text>
            </View>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: sColor + '1A' }]}>
            <Text style={[styles.statusValue, { color: sColor }]}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
        
        {item.status?.toUpperCase() === 'REJECTED' && (item.rejectionReason || item.reason) && (
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: divider }}>
            <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '700', letterSpacing: 0.5 }}>REASON FOR REJECTION</Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>{item.rejectionReason || item.reason}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Project Requests</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.subText }}>Loading requests...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: '#f44336' }]}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>No Requests Found</Text>
          <Text style={{ color: colors.subText, textAlign: 'center' }}>Your team has not sent any project requests yet.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.requestId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  value: {
    fontSize: 13,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TeamProjectRequestsScreen;
