// src/screens/auth/LoginScreen.tsx
// ==============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, SIZES, GRADIENTS } from '../../utils/colors';
import ApiService from '../../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

interface CustomModalProps {
  visible: boolean;
  type: 'error' | 'success' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, type, title, message, onClose }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return { name: 'close-circle', color: '#EF4444', bg: '#FEE2E2' };
      case 'success':
        return { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' };
      case 'warning':
        return { name: 'alert-circle', color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
            <Icon name={iconConfig.name} size={48} color={iconConfig.color} />
          </View>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity style={styles.modalButton} onPress={onClose} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.modalButtonGradient}>
              <Text style={styles.modalButtonText}>Got it!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'error' | 'success' | 'warning';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const showModal = (type: 'error' | 'success' | 'warning', title: string, message: string) => {
    setModalConfig({ visible: true, type, title, message });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal(
        'warning',
        'Missing Information',
        'Please fill in both email and password to continue.'
      );
      return;
    }

    if (!email.includes('@')) {
      showModal(
        'error',
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(email, password, userType);
      if (response.success) {
        showModal(
          'success',
          'Welcome Back!',
          'Login successful. Redirecting to your dashboard...'
        );
        setTimeout(() => {
          const screen = userType === 'teacher' ? 'TeacherDashboard' : 'StudentDashboard';
          navigation.replace(screen);
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unable to login. Please check your credentials.';
      showModal(
        'error',
        'Login Failed',
        errorMessage === 'Invalid credentials' 
          ? 'The email or password you entered is incorrect. Please try again.'
          : 'check credendials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back! 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, userType === 'student' && styles.activeType]}
                onPress={() => setUserType('student')}
              >
                <Text style={[styles.typeText, userType === 'student' && styles.activeTypeText]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, userType === 'teacher' && styles.activeType]}
                onPress={() => setUserType('teacher')}
              >
                <Text style={[styles.typeText, userType === 'teacher' && styles.activeTypeText]}>
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>

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

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              gradient
              style={styles.loginButton}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeModal}
      />
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
  loginButton: { marginTop: SIZES.md },
  linkText: { textAlign: 'center', marginTop: SIZES.lg, color: COLORS.textSecondary },
  linkTextBold: { color: COLORS.primary, fontWeight: '700' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xl,
  },
  modalButton: {
    width: '100%',
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;