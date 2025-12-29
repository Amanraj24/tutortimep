// src/screens/teacher/TeacherProfileScreen.tsx
// ==============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService from '../../services/api';

type TeacherProfileNavigationProp = StackNavigationProp<RootStackParamList, 'TeacherProfile'>;

interface Props {
  navigation: TeacherProfileNavigationProp;
}

interface TeacherProfile {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

const TeacherProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTeacherProfile();
      setProfile(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (profile) {
      setEditName(profile.name);
      setEditPhone(profile.phone);
      setEditAddress(profile.address);
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setUpdating(true);
    try {
      await ApiService.updateTeacherProfile({
        name: editName,
        phone: editPhone,
        address: editAddress,
      });

      setProfile(prev => prev ? { ...prev, name: editName, phone: editPhone, address: editAddress } : null);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setUpdating(true);
    try {
      await ApiService.changePassword(currentPassword, newPassword);
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await ApiService.logout();
          navigation.replace('Login' as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
            <Icon name="create-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.profileBadge}>
            <Icon name="finger-print" size={14} color={COLORS.white} />
            <Text style={styles.profileBadgeText}>{profile.uniqueId}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={[styles.infoCard, SHADOWS.small]}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="finger-print" size={20} color="#667eea" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Unique ID</Text>
                <Text style={styles.infoValue}>{profile.uniqueId}</Text>
              </View>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyText}>View Only</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="mail" size={20} color="#43e97b" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyText}>View Only</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="person" size={20} color="#f093fb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile.name}</Text>
              </View>
              <Icon name="create" size={18} color={COLORS.textSecondary} />
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="call" size={20} color="#ff9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile.phone || 'Not provided'}</Text>
              </View>
              <Icon name="create" size={18} color={COLORS.textSecondary} />
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="location" size={20} color="#2196f3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{profile.address || 'Not provided'}</Text>
              </View>
              <Icon name="create" size={18} color={COLORS.textSecondary} />
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="calendar" size={20} color="#9c27b0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{profile.createdAt}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={[styles.settingsCard, SHADOWS.small]}>
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowChangePassword(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#e3f2fd' }]}>
                  <Icon name="lock-closed" size={20} color="#2196f3" />
                </View>
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color="#f44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter your phone"
                  keyboardType="phone-pad"
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Enter your address"
                  multiline
                  numberOfLines={3}
                  editable={!updating}
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                  {updating ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      <Text style={styles.submitButtonText}>Update Profile</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password *</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password *</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                  editable={!updating}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password *</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                  editable={!updating}
                />
              </View>

              <View style={styles.passwordHint}>
                <Icon name="information-circle" size={16} color={COLORS.textSecondary} />
                <Text style={styles.passwordHintText}>
                  Password must be at least 6 characters long
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleChangePassword}
                disabled={updating}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                  {updating ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      <Text style={styles.submitButtonText}>Change Password</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  retryButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
  },
  backButton: {
    padding: SIZES.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editButton: {
    padding: SIZES.xs,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.md,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: SIZES.sm,
    gap: 6,
  },
  profileBadgeText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  section: {
    marginBottom: SIZES.lg,
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  readOnlyBadge: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readOnlyText: {
    fontSize: 11,
    color: '#9c27b0',
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SIZES.xs,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  settingText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    marginHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
    marginTop: SIZES.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: SIZES.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  formContainer: {
    paddingHorizontal: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    gap: 6,
    marginBottom: SIZES.md,
  },
  passwordHintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  submitButton: {
    marginBottom: SIZES.lg,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    gap: SIZES.sm,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeacherProfileScreen;