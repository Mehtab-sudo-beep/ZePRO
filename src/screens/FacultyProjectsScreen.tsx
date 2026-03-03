import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';

interface TeamMember {
  name: string;
  rollNo: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: 'ongoing' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  teamName: string;
  members: TeamMember[];
  objectives: string;
  techStack: string;
  remarks: string;
}

const FacultyProjectsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Project Allocation System',
      description: 'A web and mobile application to streamline the allocation of final year projects to students and faculty.',
      domain: 'Full Stack Development',
      status: 'ongoing',
      startDate: '2024-01-10',
      endDate: '2024-05-30',
      teamName: 'Team Alpha',
      members: [
        { name: 'John Doe', rollNo: 'CS2021001', role: 'Team Lead' },
        { name: 'Jane Smith', rollNo: 'CS2021045', role: 'Developer' },
        { name: 'Mike Johnson', rollNo: 'CS2020012', role: 'Designer' },
      ],
      objectives: 'Automate project allocation, reduce manual effort, and provide a transparent system for students and faculty.',
      techStack: 'React Native, Node.js, MongoDB',
      remarks: 'Good progress. Mid-review completed successfully.',
    },
    {
      id: '2',
      title: 'Campus Navigation App',
      description: 'A mobile application that helps students and visitors navigate the campus using indoor and outdoor maps.',
      domain: 'Mobile Development',
      status: 'on_hold',
      startDate: '2024-02-01',
      endDate: '2024-06-15',
      teamName: 'Team Beta',
      members: [
        { name: 'Sarah Williams', rollNo: 'CS2021089', role: 'Team Lead' },
        { name: 'Tom Brown', rollNo: 'CS2021032', role: 'Developer' },
      ],
      objectives: 'Provide real-time indoor navigation, points of interest, and event-based routing across campus.',
      techStack: 'Flutter, Firebase, Google Maps API',
      remarks: 'On hold due to API access issues. Resume after permissions granted.',
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Project | null>(null);

  const getStatusColor = (status: string) => {
    const map: { [key: string]: string } = {
      ongoing: '#10B981',
      completed: '#2563EB',
      on_hold: '#F59E0B',
    };
    return map[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const map: { [key: string]: string } = {
      ongoing: 'Ongoing',
      completed: 'Completed',
      on_hold: 'On Hold',
    };
    return map[status] || status;
  };

  const openDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const openEdit = (project: Project) => {
    setEditForm({ ...project });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editForm) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      Alert.alert('Error', 'Title and description cannot be empty.');
      return;
    }
    setProjects(prev =>
      prev.map(p => p.id === editForm.id ? editForm : p)
    );
    setSelectedProject(editForm);
    setShowEditModal(false);
    Alert.alert('Success', 'Project updated successfully.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
    <Image
      source={
        colors.background === '#111827'
          ? require('../assets/angle-white.png')
          : require('../assets/angle.png')
      }
      style={styles.backIcon}
    />
  </TouchableOpacity>
  <Text style={[styles.headerTitle, { color: colors.text }]}>My Projects</Text>
  <View style={{ width: 60 }} />
</View>

      {/* Project Cards */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => openDetails(project)}
          >
            {/* Card Top Row */}
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.projectTitle, { color: colors.text }]}>{project.title}</Text>
                <Text style={[styles.teamName, { color: colors.subText }]}>{project.teamName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                  {getStatusLabel(project.status)}
                </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: colors.subText }]} numberOfLines={2}>
              {project.description}
            </Text>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={[styles.domainBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.domainText, { color: colors.primary }]}>{project.domain}</Text>
              </View>
              <Text style={[styles.dateText, { color: colors.subText }]}>Due: {project.endDate}</Text>
            </View>

            {/* Members count */}
            <Text style={[styles.membersCount, { color: colors.subText, borderTopColor: colors.border }]}>
              {project.members.length} team member{project.members.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Project Details Modal ── */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Project Details</Text>
                <View style={styles.modalHeaderActions}>
                  {selectedProject && (
                    <TouchableOpacity
                      style={[styles.editTopBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        openEdit(selectedProject);
                      }}
                    >
                      <Text style={styles.editTopBtnText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedProject && (
                <>
                  {/* Status Banner */}
                  <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedProject.status) + '18' }]}>
                    <Text style={[styles.statusBannerText, { color: getStatusColor(selectedProject.status) }]}>
                      {getStatusLabel(selectedProject.status)}
                    </Text>
                  </View>

                  {/* Basic Info */}
                  <Section title="Project Info" colors={colors}>
                    <DetailRow label="Title" value={selectedProject.title} colors={colors} />
                    <DetailRow label="Domain" value={selectedProject.domain} colors={colors} />
                    <DetailRow label="Team" value={selectedProject.teamName} colors={colors} />
                    <DetailRow label="Start" value={selectedProject.startDate} colors={colors} />
                    <DetailRow label="End" value={selectedProject.endDate} colors={colors} />
                    <DetailRow label="Tech Stack" value={selectedProject.techStack} colors={colors} />
                  </Section>

                  {/* Description */}
                  <Section title="Description" colors={colors}>
                    <Text style={[styles.paraText, { color: colors.subText }]}>{selectedProject.description}</Text>
                  </Section>

                  {/* Objectives */}
                  <Section title="Objectives" colors={colors}>
                    <Text style={[styles.paraText, { color: colors.subText }]}>{selectedProject.objectives}</Text>
                  </Section>

                  {/* Team Members */}
                  <Section title="Team Members" colors={colors}>
                    {selectedProject.members.map((m, i) => (
                      <View
                        key={i}
                        style={[styles.memberRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                      >
                        <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.memberAvatarText}>{m.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.memberName, { color: colors.text }]}>{m.name}</Text>
                          <Text style={[styles.memberMeta, { color: colors.subText }]}>{m.rollNo}</Text>
                        </View>
                        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '18' }]}>
                          <Text style={[styles.roleText, { color: colors.primary }]}>{m.role}</Text>
                        </View>
                      </View>
                    ))}
                  </Section>

                  {/* Remarks */}
                  <Section title="Faculty Remarks" colors={colors}>
                    <Text style={[styles.paraText, { color: colors.subText }]}>{selectedProject.remarks}</Text>
                  </Section>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {editForm && (
                <>
                  <EditField label="Project Title" value={editForm.title}
                    onChange={v => setEditForm({ ...editForm, title: v })} colors={colors} />

                  <EditField label="Domain" value={editForm.domain}
                    onChange={v => setEditForm({ ...editForm, domain: v })} colors={colors} />

                  <EditField label="Team Name" value={editForm.teamName}
                    onChange={v => setEditForm({ ...editForm, teamName: v })} colors={colors} />

                  <EditField label="Start Date" value={editForm.startDate}
                    onChange={v => setEditForm({ ...editForm, startDate: v })} colors={colors} />

                  <EditField label="End Date" value={editForm.endDate}
                    onChange={v => setEditForm({ ...editForm, endDate: v })} colors={colors} />

                  <EditField label="Tech Stack" value={editForm.techStack}
                    onChange={v => setEditForm({ ...editForm, techStack: v })} colors={colors} />

                  <EditField label="Description" value={editForm.description}
                    onChange={v => setEditForm({ ...editForm, description: v })}
                    colors={colors} multiline />

                  <EditField label="Objectives" value={editForm.objectives}
                    onChange={v => setEditForm({ ...editForm, objectives: v })}
                    colors={colors} multiline />

                  <EditField label="Faculty Remarks" value={editForm.remarks}
                    onChange={v => setEditForm({ ...editForm, remarks: v })}
                    colors={colors} multiline />

                  {/* Status Picker */}
                  <Text style={[styles.fieldLabel, { color: colors.subText }]}>Status</Text>
                  <View style={styles.statusPicker}>
                    {(['ongoing', 'completed', 'on_hold'] as const).map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusOption,
                          { borderColor: colors.border, backgroundColor: colors.background },
                          editForm.status === s && { backgroundColor: getStatusColor(s), borderColor: getStatusColor(s) },
                        ]}
                        onPress={() => setEditForm({ ...editForm, status: s })}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          { color: colors.subText },
                          editForm.status === s && { color: '#FFFFFF' },
                        ]}>
                          {getStatusLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Save / Cancel */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: colors.border }]}
                      onPress={() => setShowEditModal(false)}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                      onPress={saveEdit}
                    >
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

/* ── Reusable Sub-components ── */

const Section = ({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>
      {title}
    </Text>
    {children}
  </View>
);

const DetailRow = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) => (
  <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
    <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const EditField = ({
  label,
  value,
  onChange,
  colors,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
  multiline?: boolean;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={[styles.fieldLabel, { color: colors.subText }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      style={[
        styles.input,
        { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
        multiline && { height: 90, textAlignVertical: 'top' },
      ]}
      placeholderTextColor={colors.subText}
    />
  </View>
);

/* ── Styles ── */

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  backIcon: {
  width: 22,
  height: 22,
  resizeMode: 'contain',
},

  scroll: { padding: 16, paddingBottom: 30 },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  projectTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  teamName: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  domainBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  domainText: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 12 },
  membersCount: {
    fontSize: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 20 },

  editTopBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editTopBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  statusBanner: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerText: { fontWeight: '700', fontSize: 14 },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 0.5,
  },

  detailRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 13, fontWeight: '600', width: 90 },
  detailValue: { fontSize: 13, flex: 1 },

  paraText: { fontSize: 14, lineHeight: 22 },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberAvatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberMeta: { fontSize: 12, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleText: { fontSize: 11, fontWeight: '600' },

  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  statusPicker: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusOptionText: { fontSize: 12, fontWeight: '600' },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
});

export default FacultyProjectsScreen;