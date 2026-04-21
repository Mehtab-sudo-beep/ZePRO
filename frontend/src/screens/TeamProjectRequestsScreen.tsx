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
      case 'ACCEPTED':
      case 'ASSIGNED': return '#16A34A';
      case 'SCHEDULED': return '#8B5CF6';
      case 'COMPLETED': return '#3B82F6';
      case 'REJECTED': return '#DC2626';
      case 'PENDING': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const divider = isDark ? '#374151' : '#E5E7EB';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';

  const handlePress = (item: any) => {
    const status = item.status?.toUpperCase();
    if (status === 'SCHEDULED' || status === 'REJECTED' || status === 'COMPLETED' || status === 'ASSIGNED') {
      navigation.navigate('MeetingDetails', { requestId: item.requestId });
    } else {
      navigation.navigate('ProjectDetails', { projectId: item.projectId });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const sColor = getStatusColor(item.status);
    const isAccepted = item.status?.toUpperCase() === 'ACCEPTED' || item.status?.toUpperCase() === 'ASSIGNED';

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.title, { color: colors.text }]}>{item.projectTitle}</Text>
              {isAccepted && (
                <Image 
                  source={require('../assets/trophy.png')} 
                  style={{ width: 18, height: 18, marginLeft: 8, tintColor: '#EAB308' }} 
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={isDark ? require('../assets/user-white.png') : require('../assets/user.png')} 
                style={{ width: 12, height: 12, marginRight: 6, tintColor: colors.subText }} 
              />
              <Text style={[styles.value, { color: colors.subText }]}>{item.facultyName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sColor + '15' }]}>
            <Text style={[styles.statusText, { color: sColor }]}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
        
        {item.status?.toUpperCase() === 'REJECTED' && (item.rejectionReason || item.reason) && (
          <View style={[styles.reasonBox, { backgroundColor: isDark ? '#450a0a' : '#FEF2F2' }]}>
            <Text style={styles.reasonLabel}>REASON FOR REJECTION</Text>
            <Text style={[styles.reasonText, { color: colors.text }]}>{item.rejectionReason || item.reason}</Text>
          </View>
        )}
      </TouchableOpacity>
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
          <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Image 
            source={require('../assets/requests.png')} 
            style={{ width: 60, height: 60, opacity: 0.2, marginBottom: 16, tintColor: colors.subText }} 
          />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>No Requests Found</Text>
          <Text style={{ color: colors.subText, textAlign: 'center' }}>Your team has not sent any project requests yet.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.requestId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reasonBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
  },
  reasonLabel: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TeamProjectRequestsScreen;
