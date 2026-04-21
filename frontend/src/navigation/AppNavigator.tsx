import React, { useContext } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Meeting } from '../types/Meeting';

// Screens
import LoginScreen from '../screens/LoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import ViewProjectsScreen from '../screens/ViewProjectsScreen';
import ScheduledMeetingsScreen from '../screens/ScheduledMeetingsScreen';
import MeetingDetailsScreen from '../screens/MeetingDetailsScreen';
import FacultyHomeScreen from '../screens/FacultyHomeScreen';
import FacultyRequestsScreen from '../screens/FacultyRequestsScreen';
import JoinTeamScreen from '../screens/JoinTeamScreen';
import CreateTeamScreen from '../screens/CreateTeamScreen';
import MoreScreen from '../screens/MoreScreen';
import AdminMoreScreen from '../screens/AdminMoreScreen';
import FacultyCoordinatorDashboard from '../screens/FacultyCoordinatorScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import DeadlineScreen from '../screens/DeadlineScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SentRequestsScreen from '../screens/SentRequestsScreen';
import ReceivedRequestsScreen from '../screens/ReceivedRequestsScreen';
import FacultyMoreScreen from '../screens/FacultyMoreScreen';
import FacultyProjectsScreen from '../screens/FacultyProjectsScreen';
import FacultyProfileScreen from '../screens/FacultyProfileScreen';
import AddInstituteScreen from '../screens/AddInstituteScreen';
import AddDepartmentScreen from '../screens/AddDepartmentScreen';
import AdminChangeRulesScreen from '../screens/ChangeRulesScreen';
import ChangeDeadlinesScreen from '../screens/ChangeDeadlineScreen';
import FacultyCoordinatorMoreScreen from '../screens/FacultyCoordinatorMoreScreen';
import FacultyViewMeetingsScreen from '../screens/FacultyViewMeetingsScreen';
import InstituteListScreen from '../screens/InstituteListScreen';
import DepartmentListScreen from '../screens/DepartmentListScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import FacultyCreateMenuScreen from '../screens/FacultyCreateMenuScreen';
import CreateDomainScreen from '../screens/CreateDomainScreen';
import CreateSubDomainScreen from '../screens/CreateSubDomainScreen';
import TeamProjectRequestsScreen from '../screens/TeamProjectRequestsScreen';
import AllocatedProjectScreen from '../screens/AllocatedProjectScreen';
import DeadlineDetailScreen from '../screens/DeadlinedetailsScreen';
import DepartmentDetailsScreen from '../screens/DepartmentDetailsScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import CompleteFacultyProfileScreen from '../screens/CompleteFacultyProfileScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OAuthSignupScreen from '../screens/OAuthSignupScreen';
import AddUserScreen from '../screens/AddUserScreen';

export type RootStackParamList = {
  Login: undefined;
  StudentHome: undefined;
  ViewProjects: undefined;
  ScheduledMeetings: undefined;
  MeetingDetails: {
    meeting?: Meeting;
    requestId?: number;
  };
  FacultyHome: undefined;
  FacultyRequests: undefined;
  FacultyProjects: undefined;
  JoinTeam: undefined;
  CreateTeam: undefined;
  More: undefined;
  DepartmentDetails: {
    departmentId?: string;
    departmentName?: string;
    instituteId?: string;
    instituteName?: string;
  } | undefined;
  Logs: undefined;
  AdminMore: undefined;
  FacultyCoordinatorDashboard: undefined;
  Profile: undefined;
  HelpCenter: undefined;
  Deadline: undefined;
  Settings: undefined;
  SentRequests: undefined;
  ReceivedRequests: undefined;
  FacultyMore: undefined;
  FacultyCoordinatorMore: undefined;
  FacultyProfile: undefined;
  AddInstitute: undefined;
  AddDepartment: undefined;
  RuleManagement: undefined;
  DeadlineManagement: undefined;
  FacultyMeetings: undefined;
  InstituteList: undefined;
  DepartmentList: { instituteId: string; instituteName: string };
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string };
  ResetPassword: { email: string, otp: string };
  CreateProject: undefined;
  ProjectDetails: { project?: any, isRequested?: boolean, projectId?: number };
  FacultyCreateMenu: undefined;
  CreateDomain: undefined;
  CreateSubDomain: undefined;
  TeamProjectRequests: undefined;
  AllocatedProject: undefined;
  DeadlineDetail: { deadlineId: number };
  AdminHome: {
    departmentId: string;
    departmentName: string;
    instituteId: string;
    instituteName: string;
  };
  CompleteProfile: undefined;
  CompleteFacultyProfile: undefined;
  Notifications: undefined;
  OAuthSignup: undefined;
  AddUser: {
    departmentId: string;
    departmentName: string;
    instituteId: string;
    instituteName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  usePushNotifications(user);

  if (loading) {
    const isDark = colors.background === '#111827';
    return (
      <View style={[navStyles.splash, { backgroundColor: colors.background }]}>
        <Image
          source={isDark ? require('../assets/zepro_new.png') : require('../assets/zepro.png')}
          style={navStyles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
          <Stack.Screen name="FacultyHome" component={FacultyHomeScreen} />
          <Stack.Screen name="InstituteList" component={InstituteListScreen} />
          <Stack.Screen name="ViewProjects" component={ViewProjectsScreen} />
          <Stack.Screen name="ScheduledMeetings" component={ScheduledMeetingsScreen} />
          <Stack.Screen name="MeetingDetails" component={MeetingDetailsScreen} />
          <Stack.Screen name="FacultyRequests" component={FacultyRequestsScreen} />
          <Stack.Screen name="JoinTeam" component={JoinTeamScreen} />
          <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
          <Stack.Screen name="More" component={MoreScreen} />
          <Stack.Screen name="DepartmentDetails" component={DepartmentDetailsScreen} />
          <Stack.Screen name="AdminMore" component={AdminMoreScreen} />
          <Stack.Screen name="FacultyCoordinatorDashboard" component={FacultyCoordinatorDashboard} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="Deadline" component={DeadlineScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SentRequests" component={SentRequestsScreen} />
          <Stack.Screen name="ReceivedRequests" component={ReceivedRequestsScreen} />
          <Stack.Screen name="FacultyMore" component={FacultyMoreScreen} />
          <Stack.Screen name="FacultyCoordinatorMore" component={FacultyCoordinatorMoreScreen} />
          <Stack.Screen name="FacultyProjects" component={FacultyProjectsScreen} />
          <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} />
          <Stack.Screen name="AddInstitute" component={AddInstituteScreen} />
          <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />
          <Stack.Screen name="RuleManagement" component={AdminChangeRulesScreen} />
          <Stack.Screen name="DeadlineManagement" component={ChangeDeadlinesScreen} />
          <Stack.Screen name="FacultyMeetings" component={FacultyViewMeetingsScreen} />
          <Stack.Screen name="DepartmentList" component={DepartmentListScreen} />
          <Stack.Screen name="AdminHome" component={DepartmentDetailsScreen} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
          <Stack.Screen name="FacultyCreateMenu" component={FacultyCreateMenuScreen} />
          <Stack.Screen name="CreateDomain" component={CreateDomainScreen} />
          <Stack.Screen name="CreateSubDomain" component={CreateSubDomainScreen} />
          <Stack.Screen name="TeamProjectRequests" component={TeamProjectRequestsScreen} />
          <Stack.Screen name="AllocatedProject" component={AllocatedProjectScreen} />
          <Stack.Screen name="DeadlineDetail" component={DeadlineDetailScreen} />
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          <Stack.Screen name="CompleteFacultyProfile" component={CompleteFacultyProfileScreen} />
          <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="OAuthSignup" component={OAuthSignupScreen} />
          <Stack.Screen name="AddUser" component={AddUserScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const navStyles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashLogo: { width: 150, height: 150 },
});

export default AppNavigator;
