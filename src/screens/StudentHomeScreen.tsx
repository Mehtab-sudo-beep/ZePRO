import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const StudentHomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.notification}>
          <Text style={styles.notificationText}>9</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Open for applications - Emerson (NI)'s Job Profile - Intern
          </Text>
          <Text style={styles.meta}>
            Dr. Vinay V. Panicker · 2 days ago
          </Text>

          <Text style={styles.text}>
            Applications are now being accepted for Emerson (NI)'s Job Profile: Intern.
          </Text>

          <Text style={styles.section}>Applicable Courses</Text>
          <Text>• M.Tech - Telecommunication</Text>
          <Text>• M.Tech - Signal Processing</Text>

          <Text style={styles.section}>Eligibility</Text>
          <Text>• All students are eligible</Text>
          <Text>• No backlogs</Text>

          <Text style={styles.section}>Hiring Process</Text>
          <Text>1. Resume shortlisting</Text>
          <Text>2. Written test</Text>
          <Text>3. Technical interview</Text>

          <Text style={styles.deadline}>
            Deadline: February 07, 01:00 PM
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <Text style={styles.tabActive}>Home</Text>
        <Text style={styles.tab}>Job Profiles</Text>
        <Text style={styles.tab}>Interviews</Text>
        <Text style={styles.tab}>Assessments</Text>
        <Text style={styles.tab}>More</Text>
      </View>

    </View>
  );
};

export default StudentHomeScreen;

/* =======================
   STYLES (MISSING PART)
   ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header */
  header: {
    height: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  notification: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Content */
  content: {
    padding: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  meta: {
    color: '#6B7280',
    marginVertical: 6,
  },

  text: {
    marginVertical: 8,
    lineHeight: 20,
  },

  section: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },

  deadline: {
    marginTop: 12,
    fontWeight: '700',
  },

  /* Bottom Tab */
  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  tabActive: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});
