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
//     if (user && user.token && user.facultyId) {
//       loadProjects();
//     }
//   }, [user]);

//   const loadProjects = async () => {
//     try {
//       setLoading(true);

//       console.log('USER:', user);
//       console.log('FACULTY ID:', user?.facultyId);
//       console.log('TOKEN:', user?.token);

//       const data = await getFacultyProjects(user.facultyId, user.token);

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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import { getFacultyProjects } from '../api/facultyApi';

const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('USE EFFECT TRIGGERED');
    console.log('USER IN USE EFFECT:', user);

    if (user && user.token && user.facultyId) {
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

      const apiCall = getFacultyProjects(user.facultyId, user.token);

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

  if (!user || !user.token) {
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
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {p.title}
                </Text>

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
                  </View>
                )}

                <Text style={[styles.status, { color: colors.primary }]}>
                  Status: {p.status}
                </Text>
              </View>
            ))}
        </ScrollView>

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