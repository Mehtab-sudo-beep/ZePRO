import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import ViewProjectsScreen from '../screens/ViewProjectsScreen';
import ScheduledMeetingsScreen from '../screens/ScheduledMeetingsScreen';
import MeetingDetailsScreen from '../screens/MeetingDeatialsScreen';
import { Meeting } from '../types/Meeting';
import FacultyHomeScreen from '../screens/FacultyHomeScreen';
import FacultyRequestsScreen from '../screens/FacultyRequestsScreen';
import JoinTeamScreen from '../screens/JoinTeamScreen';
import CreateTeamScreen from '../screens/CreateTeamScreen';
import MoreScreen from '../screens/MoreScreen';
import AdminDashboardScreen from '../screens/AdminHomeScreen';
import AuditLogsScreen from '../screens/LogsScreen';
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
import FacultyViewMeetingsScreen from '../screens/FacultyMeetingsScreen';
import InstituteListScreen from '../screens/InstituteListScreen';
import DepartmentListScreen from '../screens/DepartmentListScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import FacultyCreateMenuScreen from '../screens/FacultyCreateMenuScreen';
import CreateDomainScreen from '../screens/CreateDomainScreen';
import CreateSubDomainScreen from '../screens/CreateSubDomainScreen';

export type RootStackParamList = {
  Login: undefined;
  StudentHome: undefined;
  ViewProjects: undefined;
  ScheduledMeetings: undefined;
  MeetingDetails: {
    meeting: Meeting;
  };
  FacultyHome: undefined;
  FacultyRequests: undefined;
  FacultyProjects: undefined;
  JoinTeam: undefined;
  CreateTeam: undefined;
  More: undefined;
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
  CreateProject: undefined;
  FacultyCreateMenu: undefined;
  CreateDomain: undefined;
  CreateSubDomain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="ViewProjects" component={ViewProjectsScreen} />
      <Stack.Screen
        name="ScheduledMeetings"
        component={ScheduledMeetingsScreen}
      />
      <Stack.Screen name="MeetingDetails" component={MeetingDetailsScreen} />
      <Stack.Screen name="FacultyHome" component={FacultyHomeScreen} />
      <Stack.Screen name="FacultyRequests" component={FacultyRequestsScreen} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Stack.Screen name="Logs" component={AuditLogsScreen} />
      <Stack.Screen name="AdminMore" component={AdminMoreScreen} />
      <Stack.Screen
        name="FacultyCoordinatorDashboard"
        component={FacultyCoordinatorDashboard}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Deadline" component={DeadlineScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SentRequests" component={SentRequestsScreen} />
      <Stack.Screen
        name="ReceivedRequests"
        component={ReceivedRequestsScreen}
      />
      <Stack.Screen name="FacultyMore" component={FacultyMoreScreen} />
      <Stack.Screen
        name="FacultyCoordinatorMore"
        component={FacultyCoordinatorMoreScreen}
      />
      <Stack.Screen name="FacultyProjects" component={FacultyProjectsScreen} />
      <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} />
      <Stack.Screen name="AddInstitute" component={AddInstituteScreen} />
      <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />
      <Stack.Screen name="RuleManagement" component={AdminChangeRulesScreen} />
      <Stack.Screen
        name="DeadlineManagement"
        component={ChangeDeadlinesScreen}
      />
      <Stack.Screen
        name="FacultyMeetings"
        component={FacultyViewMeetingsScreen}
      />
      <Stack.Screen name="InstituteList" component={InstituteListScreen} />
      <Stack.Screen name="DepartmentList" component={DepartmentListScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
      <Stack.Screen
        name="FacultyCreateMenu"
        component={FacultyCreateMenuScreen}
      />
      <Stack.Screen name="CreateDomain" component={CreateDomainScreen} />
      <Stack.Screen name="CreateSubDomain" component={CreateSubDomainScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
