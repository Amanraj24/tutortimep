// src/screens/teacher/TeacherDashboard.tsx
// ==============================================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  RefreshControl,
  Animated,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService from '../../services/api';

const { width, height } = Dimensions.get('window');

type TeacherDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'TeacherDashboard'>;

interface Props {
  navigation: TeacherDashboardNavigationProp;
}

interface ClassData {
  id: string;
  name: string;
  section: string;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  feesCollected: number;
  feesTotal: number;
  upcomingTests: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: string[];
}

interface DashboardCard {
  title: string;
  icon: string;
  color: string[];
  screen: string;
  subtitle: string;
}

const TeacherDashboard: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classesData, setClassesData] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [modalScaleAnim] = useState(new Animated.Value(0));

  // Form states
  const [formName, setFormName] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formTotalStudents, setFormTotalStudents] = useState('');
  const [formFeesTotal, setFormFeesTotal] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Auto-select first class when classes are loaded
  useEffect(() => {
    if (classesData.length > 0 && !selectedClass) {
      setSelectedClass(classesData[0]);
    }
  }, [classesData, selectedClass]);

  // Animate modal when it shows
  useEffect(() => {
    if (showAddEditModal) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0);
    }
  }, [showAddEditModal]);

  const loadClasses = async () => {
    try {
      console.log('Loading classes from API...');
      
      const classes = await ApiService.getClasses();
      console.log('API Response:', classes);
      
      if (Array.isArray(classes)) {
        setClassesData(classes);
        console.log('Classes loaded successfully:', classes.length);
      } else {
        console.error('API returned non-array data:', classes);
        Alert.alert('Error', 'Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', 'Failed to load classes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards: DashboardCard[] = [
    { 
      title: 'Students', 
      icon: 'people', 
      color: GRADIENTS.primary, 
      screen: 'Students',
      subtitle: 'Manage students'
    },
    { 
      title: 'Attendance', 
      icon: 'checkmark-circle', 
      color: GRADIENTS.success, 
      screen: 'Attendance',
      subtitle: 'Mark attendance'
    },
    { 
      title: 'Fees', 
      icon: 'cash', 
      color: GRADIENTS.secondary, 
      screen: 'Fees',
      subtitle: 'Track payments'
    },
    { 
      title: 'Notes', 
      icon: 'document-text', 
      color: GRADIENTS.purple, 
      screen: 'Notes',
      subtitle: 'Share notes'
    },
    { 
      title: 'Tests', 
      icon: 'newspaper', 
      color: ['#667eea', '#764ba2'], 
      screen: 'Tests',
      subtitle: 'Manage tests'
    },
    { 
      title: 'Reports', 
      icon: 'bar-chart', 
      color: ['#f093fb', '#f5576c'], 
      screen: 'Reports',
      subtitle: 'View analytics'
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadClasses().finally(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.logout();
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  const handleClassSelect = (classData: ClassData) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedClass(classData);
      setShowClassModal(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const openAddClassModal = () => {
    setEditingClass(null);
    setFormName('');
    setFormSection('');
    setFormTotalStudents('');
    setFormFeesTotal('');
    setShowClassModal(false);
    setShowAddEditModal(true);
  };

  const openEditClassModal = (classData: ClassData) => {
    setEditingClass(classData);
    setFormName(classData.name);
    setFormSection(classData.section);
    setFormTotalStudents(classData.totalStudents.toString());
    setFormFeesTotal(classData.feesTotal.toString());
    setShowClassModal(false);
    setShowAddEditModal(true);
  };

  const showSuccessNotification = (message: string) => {
    Alert.alert(
      'Success! 🎉',
      message,
      [
        {
          text: 'Great!',
          style: 'default',
        }
      ],
      { cancelable: true }
    );
  };

  const handleSaveClass = async () => {
    // Validation
    if (!formName.trim() || !formSection.trim() || !formTotalStudents || !formFeesTotal) {
      Alert.alert('Missing Information', 'Please fill all fields to create your class');
      return;
    }

    const totalStudents = parseInt(formTotalStudents);
    const feesTotal = parseFloat(formFeesTotal);

    if (isNaN(totalStudents) || totalStudents <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of students (greater than 0)');
      return;
    }

    if (isNaN(feesTotal) || feesTotal <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid fees amount (greater than 0)');
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingClass) {
        // Update existing class
        await ApiService.updateClass(editingClass.id, {
          name: formName.trim(),
          section: formSection.trim(),
          totalStudents,
          feesTotal
        });

        // Update local state
        const updatedClasses = classesData.map(cls => 
          cls.id === editingClass.id 
            ? {
                ...cls,
                name: formName.trim(),
                section: formSection.trim(),
                totalStudents,
                feesTotal,
              }
            : cls
        );
        setClassesData(updatedClasses);
        
        // Update selected class if it's the one being edited
        if (selectedClass?.id === editingClass.id) {
          setSelectedClass({
            ...selectedClass,
            name: formName.trim(),
            section: formSection.trim(),
            totalStudents,
            feesTotal,
          });
        }
        
        setShowAddEditModal(false);
        showSuccessNotification(`Class "${formName.trim()} - ${formSection.trim()}" has been updated successfully!`);
      } else {
        // Add new class
        await ApiService.createClass({
          name: formName.trim(),
          section: formSection.trim(),
          totalStudents,
          feesTotal
        });

        // Reload classes to get the complete data from backend
        await loadClasses();
        
        setShowAddEditModal(false);
        showSuccessNotification(`Congratulations! Class "${formName.trim()} - ${formSection.trim()}" has been created successfully. You can now start managing students and tracking attendance.`);
      }
    } catch (error) {
      console.error('Save class error:', error);
      Alert.alert(
        'Error', 
        'Failed to save class. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClass = (classData: ClassData) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classData.name} - ${classData.section}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteClass(classData.id);
              
              const updatedClasses = classesData.filter(cls => cls.id !== classData.id);
              setClassesData(updatedClasses);
              
              // If deleted class was selected, select first available class
              if (selectedClass?.id === classData.id) {
                setSelectedClass(updatedClasses.length > 0 ? updatedClasses[0] : null);
              }
              
              setShowClassModal(false);
              showSuccessNotification(`Class "${classData.name} - ${classData.section}" has been deleted successfully.`);
            } catch (error) {
              console.error('Delete class error:', error);
              Alert.alert('Error', 'Failed to delete class. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (card: DashboardCard) => {
    if (!selectedClass) {
      Alert.alert('No Class Selected', 'Please select a class first to continue');
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to screen with class data
    navigation.navigate(card.screen as any, { 
      classId: selectedClass.id,
      className: `${selectedClass.name} - ${selectedClass.section}`
    });
  };

  const cardWidth = (width - SIZES.lg * 2 - SIZES.md) / 2;
  const attendanceRate = selectedClass && selectedClass.totalStudents > 0 
    ? Math.round((selectedClass.presentToday / selectedClass.totalStudents) * 100) 
    : 0;
  const feesRate = selectedClass && selectedClass.feesTotal > 0
    ? Math.round((selectedClass.feesCollected / selectedClass.feesTotal) * 100) 
    : 0;

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Loading...</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your classes...</Text>
        </View>
      </View>
    );
  }

  // Empty state - no classes (Enhanced version)
  if (classesData.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('TeacherProfile' as any)}
                activeOpacity={0.7}
              >
                <Icon name="person" size={28} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome, Teacher! 👨‍🏫</Text>
                <Text style={styles.welcomeSubtext}>Let's get started with your first class</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Icon name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            {/* Enhanced empty state icon */}
            <View style={styles.emptyIconContainer}>
              <LinearGradient 
                colors={['#667eea', '#764ba2']} 
                style={styles.emptyIconGradient}
              >
                <Icon name="school-outline" size={60} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.emptyTitle}>No Classes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first class to start managing students, tracking attendance, and collecting fees
            </Text>
            
            {/* Enhanced Add Class Button */}
            <TouchableOpacity 
              style={styles.primaryAddButton}
              onPress={openAddClassModal}
              activeOpacity={0.8}
            >
              <LinearGradient colors={GRADIENTS.primary} style={styles.primaryAddButtonGradient}>
                <Icon name="add-circle" size={24} color={COLORS.white} />
                <Text style={styles.primaryAddButtonText}>Add Your First Class</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Quick tips section */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Quick Tips:</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Icon name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.tipText}>Start with class name and section</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.tipText}>Add total students and fees amount</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.tipText}>You can always edit details later</Text>
                </View>
              </View>
            </View>
            
            {/* Secondary actions */}
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('TeacherProfile' as any)}
              >
                <Icon name="person-outline" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Setup Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  Alert.alert(
                    'Help & Support', 
                    'Contact support for assistance with setting up your classes.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Icon name="help-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Get Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Add/Edit Class Modal for Empty State */}
        <Modal
          visible={showAddEditModal}
          transparent={true}
          animationType="none"
          onRequestClose={() => !formSubmitting && setShowAddEditModal(false)}
        >
          <View style={styles.centeredModalOverlay}>
            <Animated.View 
              style={[
                styles.centeredModalContent,
                { transform: [{ scale: modalScaleAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingClass ? 'Edit Class' : 'Create Your First Class'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowAddEditModal(false)}
                  disabled={formSubmitting}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Class Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Mathematics, Class 10"
                    value={formName}
                    onChangeText={setFormName}
                    editable={!formSubmitting}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Section *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., A, B, C"
                    value={formSection}
                    onChangeText={setFormSection}
                    maxLength={3}
                    editable={!formSubmitting}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total Students *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter number of students"
                    value={formTotalStudents}
                    onChangeText={setFormTotalStudents}
                    keyboardType="numeric"
                    editable={!formSubmitting}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total Fees Amount (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter total fees amount"
                    value={formFeesTotal}
                    onChangeText={setFormFeesTotal}
                    keyboardType="numeric"
                    editable={!formSubmitting}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, formSubmitting && styles.saveButtonDisabled]}
                  onPress={handleSaveClass}
                  disabled={formSubmitting}
                >
                  <LinearGradient colors={GRADIENTS.primary} style={styles.saveButtonGradient}>
                    {formSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                    )}
                    <Text style={styles.saveButtonText}>
                      {formSubmitting 
                        ? (editingClass ? 'Updating...' : 'Creating...') 
                        : (editingClass ? 'Update Class' : 'Create Class')
                      }
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('TeacherProfile' as any)}
              activeOpacity={0.7}
            >
              <Icon name="person" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hello, Teacher! 👨‍🏫</Text>
              {selectedClass && (
                <TouchableOpacity 
                  onPress={() => setShowClassModal(true)}
                  style={styles.classSelector}
                >
                  <Text style={styles.selectedClass}>
                    {selectedClass.name} - {selectedClass.section}
                  </Text>
                  <Icon name="chevron-down" size={16} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {selectedClass && (
        <Animated.ScrollView 
          style={[styles.content, { opacity: fadeAnim }]} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={[styles.statCard, SHADOWS.medium]}>
              <LinearGradient 
                colors={['#667eea', '#764ba2']} 
                style={styles.statIconContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Icon name="people" size={24} color={COLORS.white} />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{selectedClass.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
            </View>
            
            <View style={[styles.statCard, SHADOWS.medium]}>
              <LinearGradient 
                colors={['#43e97b', '#38f9d7']} 
                style={styles.statIconContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Icon name="checkmark-done" size={24} color={COLORS.white} />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{selectedClass.presentToday || 0}</Text>
                <Text style={styles.statLabel}>Present Today</Text>
              </View>
            </View>
          </View>

          {/* Attendance Rate */}
          <View style={[styles.attendanceCard, SHADOWS.medium]}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceTitle}>Today's Attendance</Text>
              <View style={styles.attendancePercentage}>
                <Text style={styles.percentageText}>{attendanceRate}%</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient 
                colors={['#43e97b', '#38f9d7']} 
                style={[styles.progressFill, { width: `${attendanceRate}%` }]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
            </View>
            <Text style={styles.attendanceSubtext}>
              {selectedClass.absentToday || 0} student{(selectedClass.absentToday || 0) !== 1 ? 's' : ''} absent
            </Text>
          </View>

          {/* Fee Collection Status */}
          <View style={[styles.attendanceCard, SHADOWS.medium]}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceTitle}>Fee Collection Status</Text>
              <View style={[styles.attendancePercentage, { backgroundColor: '#e3f2fd' }]}>
                <Text style={[styles.percentageText, { color: '#1565c0' }]}>{feesRate}%</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient 
                colors={['#2196f3', '#1976d2']} 
                style={[styles.progressFill, { width: `${feesRate}%` }]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
            </View>
            <Text style={styles.attendanceSubtext}>
              ₹{(selectedClass.feesCollected || 0).toLocaleString()} collected of ₹{(selectedClass.feesTotal || 0).toLocaleString()}
            </Text>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="newspaper-outline" size={24} color="#667eea" />
              <Text style={styles.quickStatNumber}>{selectedClass.upcomingTests || 0}</Text>
              <Text style={styles.quickStatLabel}>Upcoming Tests</Text>
            </View>
            
            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="calendar-outline" size={24} color="#f093fb" />
              <Text style={styles.quickStatNumber}>5</Text>
              <Text style={styles.quickStatLabel}>Classes This Week</Text>
            </View>
            
            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="trophy-outline" size={24} color="#43e97b" />
              <Text style={styles.quickStatNumber}>12</Text>
              <Text style={styles.quickStatLabel}>Top Performers</Text>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.cardsGrid}>
            {dashboardCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dashCard, { width: cardWidth }]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(card)}
              >
                <LinearGradient 
                  colors={card.color} 
                  style={[styles.dashCardGradient, SHADOWS.medium]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <View style={styles.cardIconContainer}>
                    <Icon name={card.icon} size={28} color={COLORS.white} />
                  </View>
                  <Text style={styles.dashCardTitle}>{card.title}</Text>
                  <Text style={styles.dashCardSubtitle}>{card.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          <View style={[styles.activityCard, SHADOWS.medium]}>
            {selectedClass.recentActivities && selectedClass.recentActivities.length > 0 ? (
              selectedClass.recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  {index > 0 && <View style={styles.activityDivider} />}
                  <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
                    <LinearGradient 
                      colors={activity.color || ['#667eea', '#764ba2']} 
                      style={styles.activityIcon}
                    >
                      <Icon name={activity.icon || 'information-circle'} size={20} color={COLORS.white} />
                    </LinearGradient>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </React.Fragment>
              ))
            ) : (
              <View style={styles.noActivityContainer}>
                <Icon name="time-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.noActivityText}>No recent activity</Text>
              </View>
            )}
          </View>

          <View style={{ height: SIZES.xl }} />
        </Animated.ScrollView>
      )}

      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  onPress={openAddClassModal}
                  style={styles.addIconButton}
                >
                  <Icon name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowClassModal(false)}>
                  <Icon name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <FlatList
              data={classesData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.classItemWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.classItem,
                      selectedClass?.id === item.id && styles.classItemSelected
                    ]}
                    onPress={() => handleClassSelect(item)}
                  >
                    <View style={styles.classItemLeft}>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.classItemIcon}
                      >
                        <Text style={styles.classItemIconText}>
                          {item.section || 'A'}
                        </Text>
                      </LinearGradient>
                      <View>
                        <Text style={styles.classItemName}>
                          {item.name} - Section {item.section || 'A'}
                        </Text>
                        <Text style={styles.classItemStudents}>
                          {item.totalStudents || 0} students
                        </Text>
                      </View>
                    </View>
                    {selectedClass?.id === item.id && (
                      <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.classItemActions}>
                    <TouchableOpacity 
                      onPress={() => openEditClassModal(item)}
                      style={styles.actionButton}
                    >
                      <Icon name="create-outline" size={20} color="#667eea" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteClass(item)}
                      style={styles.actionButton}
                    >
                      <Icon name="trash-outline" size={20} color="#f5576c" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Icon name="school-outline" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyListText}>No classes found</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Add/Edit Class Modal - Centered */}
      <Modal
        visible={showAddEditModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => !formSubmitting && setShowAddEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredModalOverlay}
        >
          <Animated.View 
            style={[
              styles.centeredModalContent,
              { transform: [{ scale: modalScaleAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowAddEditModal(false)}
                disabled={formSubmitting}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Mathematics, Class 10"
                  value={formName}
                  onChangeText={setFormName}
                  editable={!formSubmitting}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Section *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., A, B, C"
                  value={formSection}
                  onChangeText={setFormSection}
                  maxLength={3}
                  editable={!formSubmitting}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Students *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of students"
                  value={formTotalStudents}
                  onChangeText={setFormTotalStudents}
                  keyboardType="numeric"
                  editable={!formSubmitting}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Fees Amount (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter total fees amount"
                  value={formFeesTotal}
                  onChangeText={setFormFeesTotal}
                  keyboardType="numeric"
                  editable={!formSubmitting}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, formSubmitting && styles.saveButtonDisabled]}
                onPress={handleSaveClass}
                disabled={formSubmitting}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.saveButtonGradient}>
                  {formSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {formSubmitting 
                      ? (editingClass ? 'Updating...' : 'Creating...') 
                      : (editingClass ? 'Update Class' : 'Create Class')
                    }
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  emptyIconContainer: {
    marginBottom: SIZES.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SIZES.lg,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryAddButton: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  primaryAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    gap: SIZES.sm,
    ...SHADOWS.medium,
  },
  primaryAddButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    width: '100%',
    ...SHADOWS.small,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  tipsList: {
    gap: SIZES.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  header: { 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: SIZES.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  headerText: {
    flex: 1,
  },
  greeting: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  selectedClass: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
    marginRight: 4,
  },
  logoutButton: { 
    padding: SIZES.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: SIZES.lg,
    marginTop: -10,
  },
  statsSection: { 
    flexDirection: 'row', 
    gap: SIZES.md, 
    marginTop: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  statCard: { 
    flex: 1, 
    backgroundColor: COLORS.white, 
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  statContent: {
    flex: 1,
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary 
  },
  statLabel: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    marginTop: 2 
  },
  attendanceCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.lg,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  attendancePercentage: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#43a047',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  attendanceSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary,
  },
  cardsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SIZES.md, 
    marginBottom: SIZES.lg,
  },
  dashCard: { 
    marginBottom: 0,
  },
  dashCardGradient: { 
    padding: SIZES.lg, 
    borderRadius: SIZES.radiusLg, 
    minHeight: 120,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  dashCardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.white,
  },
  dashCardSubtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  activityItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  activityIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: SIZES.md 
  },
  activityContent: { 
    flex: 1 
  },
  activityTitle: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.textPrimary 
  },
  activityTime: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    marginTop: 2 
  },
  activityDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SIZES.xs,
  },
  noActivityContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  noActivityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
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
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  centeredModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SIZES.xs,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
  },
  addIconButton: {
    padding: 4,
  },
  classItemWrapper: {
    paddingHorizontal: SIZES.lg,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  classItemSelected: {
    backgroundColor: COLORS.gray50,
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  classItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  classItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  classItemIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  classItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  classItemStudents: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  classItemActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginLeft: SIZES.md,
  },
  actionButton: {
    padding: SIZES.xs,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  },
  emptyListContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  emptyListText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.lg,
    maxHeight: height * 0.6,
  },
  inputGroup: {
    marginBottom: SIZES.lg,
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
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  saveButton: {
    marginTop: SIZES.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    gap: SIZES.sm,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TeacherDashboard;