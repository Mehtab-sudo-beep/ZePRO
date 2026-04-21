import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { getAssignedProject } from '../api/studentApi';

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  
  const icons: Record<string, any> = {
    allocated: isDark ? require('../assets/allocated-white.png') : require('../assets/allocated.png'),
    back: isDark ? require('../assets/angle-white.png') : require('../assets/angle.png'),
    faculty: isDark ? require('../assets/user-white.png') : require('../assets/user.png'),
    tag: isDark ? require('../assets/tag-white.png') : require('../assets/tag.png'),
    status: isDark ? require('../assets/status-white.png') : require('../assets/status.png'),
  };

  return <Image source={icons[name]} style={{ width: size, height: size, resizeMode: 'contain' }} />;
};

const AllocatedProjectScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user?.studentId) return;
        
        const res = await getAssignedProject(Number(user!.studentId));
        
        if (
          res &&
          res.projectTitle !== 'Project not assigned yet' &&
          res.status === 'ASSIGNED'
        ) {
          setProject(res);
        } else {
          setError('No active project is currently allocated to your team.');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch allocated project.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; text: string }> = {
      ASSIGNED:   { bg: '#D1FAE5', text: '#065F46' },
      COMPLETED:  { bg: '#EDE9FE', text: '#5B21B6' },
      IN_PROGRESS:{ bg: '#DBEAFE', text: '#1E40AF' },
    };
    const s = map[status] || { bg: accentSoft, text: colors.primary };
    
    return (
      <View style={{
        backgroundColor: s.bg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start'
      }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: s.text, letterSpacing: 0.5 }}>
          {status}
        </Text>
      </View>
    );
  };

  const openDocument = (url: string) => {
    const API_BASE = 'http://10.226.126.133:8080';
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    Linking.openURL(fullUrl).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Icon name="back" size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Allocated Project</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.subText }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : project && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.featureBanner, { backgroundColor: colors.primary }]}>
            <Image 
              source={isDark ? require('../assets/trophy-white.png') : require('../assets/trophy-white.png')} 
              style={{ width: 48, height: 48, tintColor: 'rgba(255,255,255,0.2)', position: 'absolute', right: -10, top: -10 }} 
            />
            <Text style={styles.bannerSubtitle}>OFFICIALLY ALLOCATED</Text>
            <Text style={styles.bannerTitle}>{project.projectTitle}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.subText }]}>OVERVIEW</Text>
          
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.descriptionHeader, { color: colors.text }]}>Description</Text>
              <Text style={[styles.descriptionBody, { color: colors.subText }]}>
                {project.description || 'No detailed description provided by the faculty.'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: divider }]} />

            <View style={styles.detailRow}>
              <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
                <Icon name="faculty" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>Advising Faculty</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{project.facultyName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
                <Icon name="tag" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>Team Designation</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{project.teamName}</Text>
              </View>
            </View>

            <View style={[styles.detailRow, { marginBottom: 16 }]}>
              <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
                <Icon name="status" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.subText }]}>Project Status</Text>
                <View style={{ marginTop: 2 }}>
                  <StatusBadge status={project.status || 'ASSIGNED'} />
                </View>
              </View>
            </View>

            {project.subdomain && (
              <View style={styles.detailRow}>
                <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
                  <Icon name="tag" size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: colors.subText }]}>Subdomain</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{project.subdomain}</Text>
                </View>
              </View>
            )}

            {project.documents && project.documents.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionLabel, { color: colors.subText, marginLeft: 0 }]}>Documents</Text>
                {project.documents.map((doc: string, index: number) => {
                  const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                  return (
                    <TouchableOpacity key={index} style={styles.docLink} onPress={() => openDocument(doc)}>
                      <Text style={[styles.linkText, { color: colors.primary }]}>
                        • {fileName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AllocatedProjectScreen;

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
    lineHeight: 22,
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  featureBanner: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  descriptionHeader: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  descriptionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  docLink: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  linkText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
