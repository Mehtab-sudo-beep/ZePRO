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

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Help Center
          </Text>
        </View>

        <ScrollView
          style={[styles.list, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Section title="Admin Contact" colors={colors} icon="🏢">
            <Info label="Name" value="Mr. Rajesh Kumar" colors={colors} icon="👤" />
            <Info label="Email" value="admin@college.edu" colors={colors} icon="✉️" />
            <Info label="Office" value="Admin Block - Room 204" colors={colors} icon="📍" />
            <Info label="Phone" value="+91 9876543210" colors={colors} icon="📞" isLast />
          </Section>

          <Section title="Faculty Coordinator" colors={colors} icon="🎓">
            <Info label="Name" value="Dr. Anjali Sharma" colors={colors} icon="👤" />
            <Info label="Email" value="anjali@college.edu" colors={colors} icon="✉️" />
            <Info label="Office" value="CSE Dept - Room 312" colors={colors} icon="📍" />
            <Info label="Phone" value="+91 9123456780" colors={colors} icon="📞" isLast />
          </Section>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Section = ({
  title,
  children,
  colors,
  icon,
}: {
  title: string;
  children: any;
  colors: any;
  icon?: string;
}) => (
  <View style={styles.sectionWrapper}>
    <View style={styles.sectionHeader}>
      {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      {children}
    </View>
  </View>
);

const Info = ({
  label,
  value,
  colors,
  icon,
  isLast,
}: {
  label: string;
  value: string;
  colors: any;
  icon?: string;
  isLast?: boolean;
}) => (
  <View style={[styles.item, !isLast && { borderBottomWidth: 1, borderColor: colors.border }]}>
    <View style={styles.itemLeft}>
      {icon && (
        <View style={[styles.iconBadge, { backgroundColor: colors.background }]}>
          <Text style={styles.itemIcon}>{icon}</Text>
        </View>
      )}
      <View style={styles.itemText}>
        <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  </View>
);

export default HelpCenterScreen;

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  back: {
    fontSize: 22,
  },

  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionWrapper: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 2,
  },

  sectionIcon: {
    fontSize: 16,
    marginRight: 7,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.75,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  itemIcon: {
    fontSize: 16,
  },

  itemText: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  value: {
    fontSize: 15,
    fontWeight: '500',
  },
});