// src/screens/auth/RegisterScreen.tsx
// Updated with Privacy Policy and Terms of Service navigation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, SIZES, GRADIENTS } from '../../utils/colors';
import ApiService from '../../services/api';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePrivacyPolicyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfService');
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!acceptedPolicy) {
      Alert.alert('Privacy Policy', 'Please accept the Privacy Policy and Terms of Service to continue');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.register(name, email, password, userType);
      if (response.success) {
        Alert.alert('Success', 'OTP sent to your email');
        navigation.navigate('OTP', { email });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, userType === 'student' && styles.activeType]}
                onPress={() => setUserType('student')}
              >
                <Text style={[styles.typeText, userType === 'student' && styles.activeTypeText]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, userType === 'teacher' && styles.activeType]}
                onPress={() => setUserType('teacher')}
              >
                <Text style={[styles.typeText, userType === 'teacher' && styles.activeTypeText]}>Teacher</Text>
              </TouchableOpacity>
            </View>

            <Input 
              label="Full Name" 
              placeholder="Enter your name" 
              value={name} 
              onChangeText={setName} 
              icon="person-outline" 
            />
            <Input 
              label="Email" 
              placeholder="Enter your email" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              icon="mail-outline" 
            />
            <Input 
              label="Password" 
              placeholder="Enter your password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              icon="lock-closed-outline" 
            />

            {/* Privacy Policy & Terms Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setAcceptedPolicy(!acceptedPolicy)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptedPolicy && styles.checkboxChecked]}>
                {acceptedPolicy && (
                  <Icon name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <View style={styles.policyTextContainer}>
                <Text style={styles.policyText}>
                  I agree to the{' '}
                  <Text 
                    style={styles.policyLink} 
                    onPress={(e) => {
                      e.stopPropagation();
                      handlePrivacyPolicyPress();
                    }}
                  >
                    Privacy Policy
                  </Text>
                  {' '}and{' '}
                  <Text 
                    style={styles.policyLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleTermsPress();
                    }}
                  >
                    Terms of Service
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            <Button 
              title="Sign Up" 
              onPress={handleRegister} 
              loading={loading} 
              gradient 
              style={styles.registerButton}
              disabled={!acceptedPolicy}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SIZES.lg },
  header: { marginBottom: SIZES.xxl, alignItems: 'center' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.white, marginBottom: SIZES.xs },
  subtitle: { fontSize: SIZES.body, color: COLORS.white, opacity: 0.9 },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusXl, padding: SIZES.xl },
  typeContainer: { flexDirection: 'row', marginBottom: SIZES.lg, gap: SIZES.sm },
  typeButton: { 
    flex: 1, 
    padding: SIZES.md, 
    backgroundColor: COLORS.gray100, 
    borderRadius: SIZES.radiusMd, 
    alignItems: 'center' 
  },
  activeType: { backgroundColor: COLORS.primary },
  typeText: { fontWeight: '600', color: COLORS.textPrimary },
  activeTypeText: { color: COLORS.white },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 4,
    marginRight: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  policyTextContainer: {
    flex: 1,
  },
  policyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  policyLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: { marginTop: SIZES.md },
  linkText: { textAlign: 'center', marginTop: SIZES.lg, color: COLORS.textSecondary },
  linkTextBold: { color: COLORS.primary, fontWeight: '700' },
});

export default RegisterScreen;