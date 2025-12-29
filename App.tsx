/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import { NewAppScreen } from '@react-native/new-app-screen';
import { StyleSheet, useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import TeacherDashboard from './src/screens/teacher/TeacherDashboard';
import StudentDashboard from './src/screens/student/StudentDashboard';
import StudentsScreen from './src/screens/teacher/StudentsScreen';
import AttendanceScreen from './src/screens/teacher/AttendanceScreen';
import FeesScreen from './src/screens/teacher/FeesScreen';
import NotesScreen from './src/screens/teacher/NotesScreen';
import TeacherProfileScreen from './src/screens/teacher/TeacherProfileScreen';
import TestsScreen from './src/screens/teacher/TestsScreen';
import ReportsScreen from './src/screens/teacher/ReportsScreen';
import StudentProfileScreen from './src/screens/student/StudentProfileScreen';
import StudentAttendanceScreen from './src/screens/student/StudentAttendanceScreen';
import StudentFeesScreen from './src/screens/student/StudentFeesScreen';
import StudentNotesScreen from './src/screens/student/StudentNotesScreen';
import StudentTestsScreen from './src/screens/student/StudentTestsScreen';
import PrivacyPolicyScreen from './src/screens/auth/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/auth/TermsOfServiceScreen';

import { RootStackParamList, User } from './src/types';
import { COLORS } from './src/utils/colors';
const Stack = createStackNavigator<RootStackParamList>();


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!user) return 'Login';
    return user.type === 'teacher' ? 'TeacherDashboard' : 'StudentDashboard';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRouteName()}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
          <Stack.Screen name="Students" component={StudentsScreen} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="Fees" component={FeesScreen} />
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="Tests" component={TestsScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
          <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
          <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
          <Stack.Screen name="StudentFees" component={StudentFeesScreen} />
          <Stack.Screen name="StudentNotes" component={StudentNotesScreen} />
          <Stack.Screen name="StudentTests" component={StudentTestsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};


export default App;
