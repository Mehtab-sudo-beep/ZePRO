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
          const res = await getTeamProjectRequests(user.studentId);
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
      case 'APPROVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'PENDING': return '#ff9800';
      default: return colors.primary;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{item.projectTitle}</Text>
      <View style={styles.detailRow}>
        <Text style={[styles.label, { color: colors.subText }]}>Faculty:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{item.facultyName}</Text>
      </View>
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) + '1A' }]}>
        <Text style={[styles.statusLabel, { color: colors.text }]}>Status: </Text>
        <Text style={[styles.statusValue, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Team Project Requests</Text>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginLeft: -8,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    width: 60,
  },
  value: {
    fontSize: 13,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500',
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
