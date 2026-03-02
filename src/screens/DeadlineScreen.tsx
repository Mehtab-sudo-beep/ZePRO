import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';

const PRIMARY = '#2563EB';

const DEADLINES = [
  {
    title: 'Project Proposal Submission',
    date: '15 March 2026',
    tag: 'Documentation',
    description:
      'Submit a detailed project proposal including problem statement, objectives, methodology, and expected outcomes. Attach a synopsis (max 2 pages) signed by your guide.',
    tasks: ['Problem statement', 'Methodology outline', 'Guide signature'],
  },
  {
    title: 'Mid Review Presentation',
    date: '30 March 2026',
    tag: 'Presentation',
    description:
      'Present your project progress to the review panel. Demonstrate working prototype or initial implementation. Prepare 10–12 slides covering work done and next steps.',
    tasks: ['Working prototype', '10–12 slide deck', 'Progress report'],
  },
  {
    title: 'Final Report Submission',
    date: '10 April 2026',
    tag: 'Final',
    description:
      'Submit the complete project report in prescribed format. Include abstract, chapters, results, conclusion, and references. Both soft and hard copies required.',
    tasks: ['Full report (hard + soft)', 'Results & conclusion', 'References & appendix'],
  },
];

const isDatePast = (dateStr: string): boolean => {
  const parsed = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
};

const DeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Deadlines</Text>
            <Text style={[styles.headerSub, { color: colors.subText }]}>
              {DEADLINES.length} upcoming
            </Text>
          </View>
        </View>

        {/* Deadlines List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
        >
          {DEADLINES.map((item, index) => (
            <DeadlineItem key={index} {...item} colors={colors} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const DeadlineItem = ({
  title,
  date,
  tag,
  description,
  tasks,
  colors,
}: {
  title: string;
  date: string;
  tag: string;
  description: string;
  tasks: string[];
  colors: any;
}) => {
  const past = isDatePast(date);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text, borderLeftColor: PRIMARY }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>

      <View style={styles.metaRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Text style={[styles.date, { color: past ? '#000000' : '#DC2626' }]}>
          {past ? 'Ended ' : 'Due '}{date}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.description, { color: colors.subText }]}>{description}</Text>

      <View style={styles.checkList}>
        {tasks.map((task, i) => (
          <View key={i} style={styles.checkItem}>
            <View style={styles.checkDot} />
            <Text style={[styles.checkText, { color: colors.text }]}>{task}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DeadlinesScreen;

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderBottomWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  back: {
    fontSize: 22,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderLeftWidth: 4,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  tag: {
    
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: PRIMARY,
  },

  date: {
    fontSize: 12,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    marginVertical: 12,
    borderRadius: 1,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },

  checkList: {
    gap: 8,
  },

  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + '18',
  },

  checkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});