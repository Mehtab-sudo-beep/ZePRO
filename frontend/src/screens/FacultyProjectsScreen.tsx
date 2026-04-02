// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AuthContext } from '../context/AuthContext';
// import { ThemeContext } from '../theme/ThemeContext';
// import { useNavigation } from '@react-navigation/native';

// import { getFacultyProjects } from '../api/facultyApi';

// const FacultyProjectsScreen = () => {
//   const { user } = useContext(AuthContext);
//   const { colors } = useContext(ThemeContext);
//   const navigation: any = useNavigation();

//   const [projects, setProjects] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user && user!.token && user.facultyId) {
//       loadProjects();
//     }
//   }, [user]);

//   const loadProjects = async () => {
//     try {
//       setLoading(true);

//       console.log('USER:', user);
//       console.log('FACULTY ID:', user?.facultyId);
//       console.log('TOKEN:', user?.token);

//       const data = await getFacultyProjects(user.facultyId, user!.token);

//       console.log('PROJECT RESPONSE:', data);

//       if (Array.isArray(data)) {
//         setProjects(data);
//       } else if (data?.projects) {
//         setProjects(data.projects);
//       } else {
//         setProjects([]);
//       }
//     } catch (error: any) {
//       console.log('PROJECT API ERROR:', error?.response?.status);
//       console.log('PROJECT API ERROR DATA:', error?.response?.data);
//       setProjects([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={[styles.header, { backgroundColor: colors.card }]}>
//           <Text style={[styles.headerTitle, { color: colors.text }]}>
//             My Projects
//           </Text>
//         </View>

//         {/* Content */}
//         <ScrollView contentContainerStyle={styles.content}>
//           {loading && <ActivityIndicator size="large" color={colors.primary} />}

//           {!loading && projects.length === 0 && (
//             <Text style={[styles.empty, { color: colors.subText }]}>
//               No projects created yet
//             </Text>
//           )}

//           {!loading &&
//             projects.map((p: any) => (
//               <View
//                 key={p.projectId}
//                 style={[styles.card, { backgroundColor: colors.card }]}
//               >
//                 <Text style={[styles.cardTitle, { color: colors.text }]}>
//                   {p.title}
//                 </Text>

//                 <Text style={[styles.item, { color: colors.subText }]}>
//                   {p.description}
//                 </Text>

//                 {(p.domain || p.subdomain) && (
//                   <View style={styles.domainWrapper}>
//                     <Text style={[styles.badge, { backgroundColor: colors.primary + '20', color: colors.primary }]}>
//                       {p.domain}
//                     </Text>
//                     {p.subdomain ? (
//                       <Text style={[styles.badge, { backgroundColor: colors.primary + '20', color: colors.primary }]}>
//                         {p.subdomain}
//                       </Text>
//                     ) : null}
//                   </View>
//                 )}

//                 <Text style={[styles.status, { color: colors.primary }]}>
//                   Status: {p.status}
//                 </Text>
//               </View>
//             ))}
//         </ScrollView>

//         {/* Bottom Navigation */}
//         <View
//           style={[
//             styles.bottomTab,
//             { backgroundColor: colors.card, borderColor: colors.border },
//           ]}
//         >
//           <TouchableOpacity
//             style={styles.tabItem}
//             onPress={() => navigation.navigate('FacultyHome')}
//           >
//             <Image
//               source={require('../assets/home.png')}
//               style={styles.tabIcon}
//             />
//             <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.tabItem}
//             onPress={() => navigation.navigate('CreateProject')}
//           >
//             <Image
//               source={require('../assets/create.png')}
//               style={styles.tabIcon}
//             />
//             <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.tabItem}
//             onPress={() => navigation.navigate('FacultyMore')}
//           >
//             <Image
//               source={require('../assets/more.png')}
//               style={styles.tabIcon}
//             />
//             <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default FacultyProjectsScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },

//   header: {
//     height: 60,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     elevation: 4,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//   },

//   content: {
//     padding: 16,
//   },

//   card: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 3,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },

//   item: {
//     fontSize: 14,
//     marginBottom: 6,
//   },

//   domainWrapper: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 6,
//     marginBottom: 4,
//   },

//   badge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     fontSize: 12,
//     fontWeight: '600',
//     overflow: 'hidden',
//   },

//   status: {
//     fontSize: 13,
//     fontWeight: '500',
//     marginTop: 6,
//   },

//   empty: {
//     textAlign: 'center',
//     marginTop: 20,
//   },

//   bottomTab: {
//     height: 60,
//     borderTopWidth: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },

//   tabItem: {
//     alignItems: 'center',
//   },

//   tabIcon: {
//     width: 22,
//     height: 22,
//     marginBottom: 4,
//     resizeMode: 'contain',
//   },

//   tab: {
//     fontSize: 12,
//   },
// });

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { useNavigation } from '@react-navigation/native';

import { getFacultyProjects, updateProject, getDomains, getSubDomains } from '../api/facultyApi';

const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSlots, setEditSlots] = useState('');
  
  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);
  
  const [editDomainId, setEditDomainId] = useState<number | null>(null);
  const [editSubDomainId, setEditSubDomainId] = useState<number | null>(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [editSubDomainName, setEditSubDomainName] = useState('');

  const [domainModal, setDomainModal] = useState(false);
  const [subDomainModal, setSubDomainModal] = useState(false);

  useEffect(() => {
    getDomains().then(d => setDomains(d || [])).catch(()=>console.log("No domains"));
  }, []);

  useEffect(() => {
    if (editDomainId) {
      getSubDomains(editDomainId).then(d => setSubDomains(d || [])).catch(()=>console.log("No subdomains"));
    }
  }, [editDomainId]);

  useEffect(() => {
    console.log('USE EFFECT TRIGGERED');
    console.log('USER IN USE EFFECT:', user);

    if (user && user!.token && user.facultyId) {
      loadProjects();
    } else {
      console.log('USER NOT READY YET');
      console.log('FACULTY ID:', user?.facultyId);

      setLoading(false); // prevent infinite spinner
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      console.log('==============================');
      console.log('LOADING PROJECTS STARTED');
      console.log('USER:', user);
      console.log('FACULTY ID:', user?.facultyId);
      console.log('TOKEN:', user?.token);

      // ⛔ Timeout protection (VERY IMPORTANT)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      if (!user?.facultyId) return;
      const apiCall = getFacultyProjects(Number(user.facultyId), user!.token);

      const data: any = await Promise.race([apiCall, timeout]);

      console.log('PROJECT RESPONSE:', data);

      if (Array.isArray(data)) {
        console.log('SETTING PROJECT ARRAY');
        setProjects(data);
      } else if (data?.projects) {
        console.log('SETTING PROJECT FROM data.projects');
        setProjects(data.projects);
      } else {
        console.log('NO PROJECTS FOUND IN RESPONSE');
        setProjects([]);
      }
    } catch (error: any) {
      console.log('==============================');
      console.log('PROJECT API ERROR:', error?.response?.status || error?.message);
      console.log('PROJECT API ERROR DATA:', error?.response?.data || error);
      setProjects([]);
    } finally {
      console.log('LOADING FINISHED');
      console.log('==============================');
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) {
      showAlert('Error', 'Title is required');
      return;
    }
    const slotCount = parseInt(editSlots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > 3) {
      showAlert('Error', 'Slots must be between 1 and 3');
      return;
    }

    try {
      await updateProject(
        editingProject.projectId,
        {
          title: editTitle,
          description: editDesc,
          studentSlots: slotCount,
          domainId: editDomainId,
          subDomainId: editSubDomainId
        },
        user!.token
      );
      setEditModalVisible(false);
      loadProjects(); // reload to get fresh data
    } catch (err) {
      showAlert('Error', 'Failed to update project');
    }
  };

  if (!user || !user!.token) {
    console.log('USER STILL NULL → SHOWING LOADER');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Initializing user...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Projects
          </Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {loading && (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ textAlign: 'center', marginTop: 10 }}>
                Loading projects...
              </Text>
            </View>
          )}

          {!loading && projects.length === 0 && (
            <Text style={[styles.empty, { color: colors.subText }]}>
              No projects created yet
            </Text>
          )}

          {!loading &&
            projects.map((p: any) => (
              <View
                key={p.projectId}
                style={[styles.card, { backgroundColor: colors.card }]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]}>
                    {p.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingProject(p);
                      setEditTitle(p.title);
                      setEditDesc(p.description);
                      setEditSlots(p.slots ? p.slots.toString() : '3');
                      setEditDomainId(p.domainId || null);
                      setEditSubDomainId(p.subDomainId || null);
                      setEditDomainName(p.domain || '');
                      setEditSubDomainName(p.subdomain || '');
                      setEditModalVisible(true);
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.item, { color: colors.subText }]}>
                  {p.description}
                </Text>

                {(p.domain || p.subdomain) && (
                  <View style={styles.domainWrapper}>
                    <Text
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.primary + '20',
                          color: colors.primary,
                        },
                      ]}
                    >
                      {p.domain}
                    </Text>

                    {p.subdomain ? (
                      <Text
                        style={[
                          styles.badge,
                          {
                            backgroundColor: colors.primary + '20',
                            color: colors.primary,
                          },
                        ]}
                      >
                        {p.subdomain}
                      </Text>
                    ) : null}
                    
                    <Text
                      style={[
                        styles.badge,
                        {
                          backgroundColor: '#10B98120',
                          color: '#10B981',
                        },
                      ]}
                    >
                      Slots: {p.studentSlots || p.slots || 3}
                    </Text>
                  </View>
                )}

                <Text style={[styles.status, { color: colors.primary }]}>
                  Status: {p.status}
                </Text>
              </View>
            ))}
        </ScrollView>

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>
              
              <Text style={[styles.label, { color: colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={editDesc}
                onChangeText={setEditDesc}
              />

              <Text style={[styles.label, { color: colors.text }]}>Student Slots (Max 3)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                keyboardType="numeric"
                value={editSlots}
                onChangeText={setEditSlots}
              />

              <Text style={[styles.label, { color: colors.text }]}>Domain</Text>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, marginBottom: 16 }}
                onPress={() => setDomainModal(true)}
              >
                <Text style={{ color: colors.text }}>{editDomainName || 'Select Domain'}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.text }]}>Sub Domain</Text>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, marginBottom: 16 }}
                onPress={() => setSubDomainModal(true)}
              >
                <Text style={{ color: colors.text }}>{editSubDomainName || 'Select Sub Domain'}</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#9CA3AF' }]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleEditSubmit}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DOMAIN MODAL */}
        <Modal visible={domainModal} animationType="slide" transparent>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setDomainModal(false)} activeOpacity={1}>
            <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Domain</Text>
              <ScrollView>
                {domains.map((item) => (
                  <TouchableOpacity
                    key={item.domainId}
                    style={{ padding: 15, borderBottomWidth: 1, borderColor: colors.border }}
                    onPress={() => {
                      setEditDomainId(item.domainId);
                      setEditDomainName(item.name);
                      setEditSubDomainId(null);
                      setEditSubDomainName('');
                      setDomainModal(false);
                    }}
                  >
                    <Text style={{ color: colors.text }}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* SUBDOMAIN MODAL */}
        <Modal visible={subDomainModal} animationType="slide" transparent>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setSubDomainModal(false)} activeOpacity={1}>
            <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Sub Domain</Text>
              <ScrollView>
                {subDomains.map((item) => (
                  <TouchableOpacity
                    key={item.subDomainId}
                    style={{ padding: 15, borderBottomWidth: 1, borderColor: colors.border }}
                    onPress={() => {
                      setEditSubDomainId(item.subDomainId);
                      setEditSubDomainName(item.name);
                      setSubDomainModal(false);
                    }}
                  >
                    <Text style={{ color: colors.text }}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Bottom Navigation */}
        <View
          style={[
            styles.bottomTab,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyHome')}
          >
            <Image
              source={require('../assets/home.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('CreateProject')}
          >
            <Image
              source={require('../assets/create.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyMore')}
          >
            <Image
              source={require('../assets/more.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FacultyProjectsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },

  content: {
    padding: 16,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSheet: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  item: {
    fontSize: 14,
    marginBottom: 6,
  },

  domainWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },

  status: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },

  empty: {
    textAlign: 'center',
    marginTop: 20,
  },

  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tabItem: {
    alignItems: 'center',
  },

  tabIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },

  tab: {
    fontSize: 12,
  },
});