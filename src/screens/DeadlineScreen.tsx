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

const DeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Deadlines
          </Text>
        </View>

        {/* Deadlines List */}
        <ScrollView
          style={[styles.list, { backgroundColor: colors.card }]}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <DeadlineItem
            title="Project Proposal Submission"
            date="15 March 2026"
            colors={colors}
          />
          <DeadlineItem
            title="Mid Review Presentation"
            date="30 March 2026"
            colors={colors}
          />
          <DeadlineItem
            title="Final Report Submission"
            date="10 April 2026"
            colors={colors}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const DeadlineItem = ({
  title,
  date,
  colors,
}: {
  title: string;
  date: string;
  colors: any;
}) => (
  <View style={[styles.item, { borderColor: colors.border }]}>
    <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.date, { color: '#DC2626' }]}>{date}</Text>
  </View>
);

export default DeadlinesScreen;

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderBottomWidth: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },

  back: {
    fontSize: 22,
  },

  list: {
    marginTop: 12,
    paddingHorizontal: 16,
    flex: 1,
  },

  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
  },

  date: {
    fontSize: 13,
    marginTop: 4,
  },
});
