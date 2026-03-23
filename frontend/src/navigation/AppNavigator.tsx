import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Student
import StudentHomeScreen from '../screens/StudentHomeScreen';
import ViewProjectsScreen from '../screens/ViewProjectsScreen';
import ScheduledMeetingsScreen from '../screens/ScheduledMeetingsScreen';
import MeetingDetailsScreen from '../screens/MeetingDeatialsScreen';
import JoinTeamScreen from '../screens/JoinTeamScreen';
import CreateTeamScreen from '../screens/CreateTeamScreen';
import SentRequestsScreen from '../screens/SentRequestsScreen';
import ReceivedRequestsScreen from '../screens/ReceivedRequestsScreen';

// Faculty
import FacultyHomeScreen from '../screens/FacultyHomeScreen';
import FacultyRequestsScreen from '../screens/FacultyRequestHandling';
import FacultyProjectsScreen from '../screens/FacultyProjectsScreen';
import FacultyProfileScreen from '../screens/FacultyProfileScreen';
import FacultyMoreScreen from '../screens/FacultyMoreScreen';
import FacultyViewMeetingsScreen from '../screens/FacultyViewMeetingsScreen';

// Admin
import AdminDashboardScreen from '../screens/AdminHomeScreen';
import AuditLogsScreen from '../screens/LogsScreen';
import AdminMoreScreen from '../screens/AdminMoreScreen';
import AddInstituteScreen from '../screens/AddInstituteScreen';
import AddDepartmentScreen from '../screens/AddDepartmentScreen';
import AdminChangeRulesScreen from '../screens/ChangeRulesScreen';
import ChangeDeadlinesScreen from '../screens/ChangeDeadlineScreen';
import InstituteListScreen from '../screens/InstituteListScreen';
import DepartmentListScreen from '../screens/DepartmentListScreen';

// Coordinator
import FacultyCoordinatorDashboard from '../screens/FacultyCoordinatorScreen';
import FacultyCoordinatorMoreScreen from '../screens/FacultyCoordinatorMoreScreen';

// Common
import MoreScreen from '../screens/MoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import DeadlineScreen from '../screens/DeadlineScreen';
import TeamProjectRequestsScreen from '../screens/TeamProjectRequestsScreen';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Student
  StudentHome: undefined;
  ViewProjects: undefined;
  ScheduledMeetings: undefined;
  MeetingDetails: { requestId: number };
  JoinTeam: undefined;
  CreateTeam: undefined;
  SentRequests: undefined;
  ReceivedRequests: undefined;

  // Faculty
  FacultyHome: undefined;
  FacultyRequests: undefined;
  FacultyProjects: undefined;
  FacultyProfile: undefined;
  FacultyMore: undefined;
  FacultyMeetings: undefined;

  // Coordinator
  FacultyCoordinatorDashboard: undefined;
  FacultyCoordinatorMore: undefined;

  // Admin
  AdminHome:
  | {
    departmentId?: string;
    departmentName?: string;
    instituteId?: string;
    instituteName?: string;
  }
  | undefined;

  Logs: undefined;
  AdminMore: undefined;

  AddInstitute: undefined;

  // ✅ FIXED HERE
  AddDepartment: {
    instituteId: string;
    instituteName: string;
  };

  RuleManagement: undefined;
  DeadlineManagement: undefined;

  // Institute Flow
  InstituteList: undefined;

  DepartmentList: {
    instituteId: string;
    instituteName: string;
  };

  // Common
  More: undefined;
  Profile: undefined;
  Settings: undefined;
  HelpCenter: undefined;
  Deadline: undefined;
  TeamProjectRequests: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Student */}
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="ViewProjects" component={ViewProjectsScreen} />
      <Stack.Screen name="ScheduledMeetings" component={ScheduledMeetingsScreen} />
      <Stack.Screen name="MeetingDetails" component={MeetingDetailsScreen} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="SentRequests" component={SentRequestsScreen} />
      <Stack.Screen name="ReceivedRequests" component={ReceivedRequestsScreen} />

      {/* Faculty */}
      <Stack.Screen name="FacultyHome" component={FacultyHomeScreen} />
      <Stack.Screen name="FacultyRequests" component={FacultyRequestsScreen} />
      <Stack.Screen name="FacultyProjects" component={FacultyProjectsScreen} />
      <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} />
      <Stack.Screen name="FacultyMore" component={FacultyMoreScreen} />
      <Stack.Screen name="FacultyMeetings" component={FacultyViewMeetingsScreen} />

      {/* Coordinator */}
      <Stack.Screen
        name="FacultyCoordinatorDashboard"
        component={FacultyCoordinatorDashboard}
      />
      <Stack.Screen
        name="FacultyCoordinatorMore"
        component={FacultyCoordinatorMoreScreen}
      />

      {/* Admin */}
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Stack.Screen name="Logs" component={AuditLogsScreen} />
      <Stack.Screen name="AdminMore" component={AdminMoreScreen} />
      <Stack.Screen name="AddInstitute" component={AddInstituteScreen} />
      <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />
      <Stack.Screen name="RuleManagement" component={AdminChangeRulesScreen} />
      <Stack.Screen name="DeadlineManagement" component={ChangeDeadlinesScreen} />

      {/* Institute Flow */}
      <Stack.Screen name="InstituteList" component={InstituteListScreen} />
      <Stack.Screen name="DepartmentList" component={DepartmentListScreen} />

      {/* Common */}
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Deadline" component={DeadlineScreen} />
      <Stack.Screen name="TeamProjectRequests" component={TeamProjectRequestsScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;