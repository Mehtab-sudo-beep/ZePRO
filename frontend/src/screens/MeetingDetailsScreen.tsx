import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { getMeetingDetails } from '../api/studentApi';
import DocumentCard from '../components/DocumentCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingDetails'>;

type MeetingDetail = {
  requestId: number;
  title: string;
  faculty: string;
  projectName: string;
  description?: string;
  domain: string;
  subDomain: string;
  location: string;
  date: string;
  time: string;
  meetingLink?: string;
  teamName?: string;
  members: string[];
  documents?: string[];
  projectId?: number;
};

const MeetingDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const isDark = colors.background === '#111827';

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        if (!requestId) return;
        const res = await getMeetingDetails(Number(requestId));
        if (res.data) {
          setMeeting(res.data);
        }
      } catch (err) {
        console.log("Failed to load meeting", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [requestId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.subText }}>Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>No details found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meeting & Project</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Project Section */}
        <Text style={[styles.sectionHeading, { color: colors.primary }]}>PROJECT DETAILS</Text>
        <Text style={[styles.title, { color: colors.text }]}>{meeting.projectName}</Text>
        
        {meeting.description ? (
          <Text style={[styles.description, { color: colors.subText }]}>{meeting.description}</Text>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Detail label="Faculty" value={meeting.faculty} colors={colors} />
          <Detail label="Domain" value={meeting.domain || 'N/A'} colors={colors} />
          <Detail label="Subdomain" value={meeting.subDomain || 'N/A'} colors={colors} />
        </View>

        {/* Meeting Section */}
        <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 10 }]}>MEETING DETAILS</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Detail label="Meeting Title" value={meeting.title} colors={colors} />
          <Detail label="Location" value={meeting.location || 'Online'} colors={colors} />
          <Detail label="Date" value={meeting.date} colors={colors} />
          <Detail label="Time" value={meeting.time} colors={colors} />
          
          {meeting.meetingLink ? (
            <TouchableOpacity 
              style={styles.linkContainer}
              onPress={() => Linking.openURL(meeting.meetingLink!)}
            >
              <Text style={[styles.label, { color: colors.subText }]}>Meeting Link</Text>
              <Text style={[styles.linkValue, { color: colors.primary }]}>{meeting.meetingLink}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Team Section */}
        <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 10 }]}>TEAM DETAILS</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.subText }]}>Team Name</Text>
          <Text style={[styles.value, { color: colors.text, marginBottom: 12 }]}>{meeting.teamName || 'N/A'}</Text>
          
          <Text style={[styles.label, { color: colors.subText }]}>Members</Text>
          <View style={styles.membersList}>
            {meeting.members?.map((m, i) => (
              <View key={i} style={styles.memberItem}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.memberText, { color: colors.text }]}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Documents Section */}
        {meeting.documents && meeting.documents.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 10 }]}>DOCUMENTS</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {meeting.documents.map((doc, index) => (
                <DocumentCard
                  key={index}
                  label={`Document ${index + 1}`}
                  value={doc}
                  colors={colors}
                  user={user}
                />
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const Detail = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  detailRow: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkContainer: {
    marginTop: 4,
  },
  linkValue: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  membersList: {
    marginTop: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  memberText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default MeetingDetailsScreen;
