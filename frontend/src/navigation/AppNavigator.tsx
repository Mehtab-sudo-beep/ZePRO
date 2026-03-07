import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import ViewProjectsScreen from '../screens/ViewProjectsScreen';
import ScheduledMeetingsScreen from '../screens/ScheduledMeetingsScreen';
import MeetingDetailsScreen from '../screens/MeetingDeatialsScreen';
import { Meeting } from '../types/Meeting';
import FacultyHomeScreen from '../screens/FacultyHomeScreen';
import FacultyRequestsScreen from '../screens/FacultyRequestHandling';
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
  AdminHome: undefined;
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
  FacultyProfile: undefined;
  AddInstitute: undefined;
  AddDepartment :undefined;
  RuleManagement : undefined;
  DeadlineManagement: undefined;
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
      <Stack.Screen name="ReceivedRequests" component={ReceivedRequestsScreen} />
      <Stack.Screen name="FacultyMore" component={FacultyMoreScreen} />
      <Stack.Screen name="FacultyProjects" component={FacultyProjectsScreen} />
      <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} />
      <Stack.Screen name="AddInstitute" component={AddInstituteScreen} />
      <Stack.Screen name="AddDepartment" component={AddDepartmentScreen}/>
      <Stack.Screen name="RuleManagement" component={AdminChangeRulesScreen}/>
      <Stack.Screen name="DeadlineManagement" component={ChangeDeadlinesScreen}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;