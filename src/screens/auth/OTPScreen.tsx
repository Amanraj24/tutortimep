// src/screens/auth/OTPScreen.tsx
// ==============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, SIZES, GRADIENTS } from '../../utils/colors';
import ApiService from '../../services/api';

type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTP'>;
type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTP'>;

interface Props {
  navigation: OTPScreenNavigationProp;
  route: OTPScreenRouteProp;
}

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = route.params;

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyOTP(email, otp);
      if (response.success) {
        Alert.alert('Success', 'Email verified successfully');
        navigation.replace('Login');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email 📧</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.card}>
          <Input
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.otpInput}
          />

          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            loading={loading}
            gradient
            style={styles.button}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: SIZES.lg },
  header: { marginBottom: SIZES.xxl, alignItems: 'center' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.white, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.white, opacity: 0.9, marginBottom: SIZES.xs },
  email: { fontSize: SIZES.h6, fontWeight: '600', color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusXl, padding: SIZES.xl },
  otpInput: { fontSize: SIZES.h3, textAlign: 'center', letterSpacing: 8 },
  button: { marginTop: SIZES.md },
});

export default OTPScreen;