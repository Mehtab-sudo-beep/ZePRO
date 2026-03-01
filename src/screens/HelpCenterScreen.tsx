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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Help Center
          </Text>
        </View>

        <ScrollView
          style={[styles.list, { backgroundColor: colors.card }]}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Section title="Admin Contact" colors={colors}>
            <Info label="Name" value="Mr. Rajesh Kumar" colors={colors} />
            <Info label="Email" value="admin@college.edu" colors={colors} />
            <Info
              label="Office"
              value="Admin Block - Room 204"
              colors={colors}
            />
            <Info label="Phone" value="+91 9876543210" colors={colors} />
          </Section>

          <Section title="Faculty Coordinator" colors={colors}>
            <Info label="Name" value="Dr. Anjali Sharma" colors={colors} />
            <Info label="Email" value="anjali@college.edu" colors={colors} />
            <Info label="Office" value="CSE Dept - Room 312" colors={colors} />
            <Info label="Phone" value="+91 9123456780" colors={colors} />
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
}: {
  title: string;
  children: any;
  colors: any;
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    {children}
  </View>
);

const Info = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) => (
  <View style={[styles.item, { borderColor: colors.border }]}>
    <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
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
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
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
    fontSize: 14,
  },

  value: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
});
