// src/screens/student/StudentDashboard.tsx
// ==============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService, { StudentClass } from '../../services/api';

type StudentDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'StudentDashboard'>;

interface Props {
  navigation: StudentDashboardNavigationProp;
}

interface DashboardCard {
  title: string;
  icon: string;
  color: string[];
  screen: string;
  subtitle: string;
}

const StudentDashboard: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await ApiService.getStudentDashboard();
      setClasses(dashboardData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboard().finally(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await ApiService.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleClassSelect = (classData: StudentClass) => {
    setSelectedClass(classData);
    setShowClassModal(false);
  };

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Attendance',
      icon: 'checkmark-circle',
      color: GRADIENTS.success,
      screen: 'StudentAttendance',
      subtitle: 'View history'
    },
    {
      title: 'Fees',
      icon: 'cash',
      color: GRADIENTS.secondary,
      screen: 'StudentFees',
      subtitle: 'Payment details'
    },
    {
      title: 'Notes',
      icon: 'document-text',
      color: GRADIENTS.purple,
      screen: 'StudentNotes',
      subtitle: 'Study materials'
    },
    {
      title: 'Tests',
      icon: 'newspaper',
      color: ['#667eea', '#764ba2'],
      screen: 'StudentTests',
      subtitle: 'Results & schedule'
    },
  ];

  const handleCardPress = (card: DashboardCard) => {
    if (!selectedClass) {
      Alert.alert('No Class Selected', 'Please select a class first');
      return;
    }

    navigation.navigate(card.screen as any, {
      classId: selectedClass.classId,
      className: `${selectedClass.className} - ${selectedClass.section}`,
      teacherName: selectedClass.teacherName
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (classes.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('StudentProfile' as any)}
              >
                <Icon name="person" size={28} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.greeting}>Hello, Student! 🎓</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Icon name="school-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Classes Enrolled</Text>
          <Text style={styles.emptySubtitle}>
            Please contact your teacher to get enrolled in a class
          </Text>
        </View>
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
              onPress={() => navigation.navigate('StudentProfile' as any)}
            >
              <Icon name="person" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hello, Student! 🎓</Text>
              {selectedClass && (
                <TouchableOpacity
                  onPress={() => setShowClassModal(true)}
                  style={styles.classSelector}
                >
                  <Text style={styles.selectedClass}>
                    {selectedClass.className} - {selectedClass.section}
                  </Text>
                  <Icon name="chevron-down" size={16} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {selectedClass && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Teacher Info Card */}
          <View style={[styles.teacherCard, SHADOWS.medium]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.teacherIcon}
            >
              <Text style={styles.teacherInitial}>
                {selectedClass.teacherName.charAt(0)}
              </Text>
            </LinearGradient>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{selectedClass.teacherName}</Text>
              <Text style={styles.teacherEmail}>{selectedClass.teacherEmail}</Text>
              {selectedClass.teacherPhone && (
                <Text style={styles.teacherPhone}>{selectedClass.teacherPhone}</Text>
              )}
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={[styles.statCard, SHADOWS.small]}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.statIconContainer}
              >
                <Icon name="checkmark-done" size={24} color={COLORS.white} />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{selectedClass.attendance.percentage}%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
            </View>

            <View style={[styles.statCard, SHADOWS.small]}>
              <LinearGradient
                colors={['#2196f3', '#1976d2']}
                style={styles.statIconContainer}
              >
                <Icon name="cash" size={24} color={COLORS.white} />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={[
                  styles.statNumber,
                  { fontSize: 16 }
                ]}>
                  {selectedClass.fees.status.toUpperCase()}
                </Text>
                <Text style={styles.statLabel}>Fee Status</Text>
              </View>
            </View>
          </View>

          {/* Attendance Progress */}
          <View style={[styles.progressCard, SHADOWS.medium]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Attendance Progress</Text>
              <Text style={styles.progressPercentage}>
                {selectedClass.attendance.percentage}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={[
                  styles.progressFill,
                  { width: `${selectedClass.attendance.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {selectedClass.attendance.presentDays} of {selectedClass.attendance.totalDays} days present
            </Text>
          </View>

          {/* Fee Details */}
          <View style={[styles.progressCard, SHADOWS.medium]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Fee Payment</Text>
              <Text style={[
                styles.progressPercentage,
                { color: '#1565c0' }
              ]}>
                ₹{selectedClass.fees.paid.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#2196f3', '#1976d2']}
                style={[
                  styles.progressFill,
                  { width: `${(selectedClass.fees.paid / selectedClass.fees.total) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              ₹{selectedClass.fees.pending.toLocaleString()} pending of ₹{selectedClass.fees.total.toLocaleString()}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsRow}>
            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="calendar-outline" size={24} color="#667eea" />
              <Text style={styles.quickStatNumber}>
                {selectedClass.attendance.totalDays}
              </Text>
              <Text style={styles.quickStatLabel}>Total Days</Text>
            </View>

            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="newspaper-outline" size={24} color="#f093fb" />
              <Text style={styles.quickStatNumber}>{selectedClass.upcomingTests}</Text>
              <Text style={styles.quickStatLabel}>Upcoming Tests</Text>
            </View>

            <View style={[styles.quickStatCard, SHADOWS.small]}>
              <Icon name="time-outline" size={24} color="#43e97b" />
              <Text style={styles.quickStatNumber}>
                {new Date(selectedClass.enrollmentDate.split('/').reverse().join('-')).getMonth() + 1}
              </Text>
              <Text style={styles.quickStatLabel}>Months Enrolled</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.cardsGrid}>
            {dashboardCards.map((card, index) => (
              <View key={index} style={styles.dashCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCardPress(card)}
                >
                  <LinearGradient
                    colors={card.color}
                    style={[styles.dashCardGradient, SHADOWS.medium]}
                  >
                    <View style={styles.cardIconContainer}>
                      <Icon name={card.icon} size={28} color={COLORS.white} />
                    </View>
                    <View style={styles.cardTextContent}>
                      <Text style={styles.dashCardTitle}>{card.title}</Text>
                      <Text style={styles.dashCardSubtitle}>{card.subtitle}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: SIZES.xl }} />
        </ScrollView>
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
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={classes}
              keyExtractor={(item) => item.classId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.classItem,
                    selectedClass?.classId === item.classId && styles.classItemSelected
                  ]}
                  onPress={() => handleClassSelect(item)}
                >
                  <View style={styles.classItemLeft}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.classItemIcon}
                    >
                      <Text style={styles.classItemIconText}>{item.section}</Text>
                    </LinearGradient>
                    <View>
                      <Text style={styles.classItemName}>
                        {item.className} - Section {item.section}
                      </Text>
                      <Text style={styles.classItemTeacher}>
                        Teacher: {item.teacherName}
                      </Text>
                    </View>
                  </View>
                  {selectedClass?.classId === item.classId && (
                    <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
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
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
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
    alignItems: 'center',
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
    color: COLORS.white,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
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
  teacherCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  teacherIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  teacherInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  teacherEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  teacherPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: -SIZES.sm / 2,
    marginBottom: SIZES.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.sm / 2,
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
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressPercentage: {
    fontSize: 16,
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
  progressSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickStatsRow: {
    flexDirection: 'row',
    marginHorizontal: -SIZES.sm / 2,
    marginBottom: SIZES.lg,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginHorizontal: SIZES.sm / 2,
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
    marginTop: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.sm / 2,
    marginBottom: SIZES.lg,
  },
  dashCard: {
    width: '50%',
    paddingHorizontal: SIZES.sm / 2,
    marginBottom: SIZES.md,
  },
  dashCardGradient: {
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContent: {
    marginTop: SIZES.sm,
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
    marginTop: 4,
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
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  classItemSelected: {
    backgroundColor: COLORS.gray50,
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
  classItemTeacher: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default StudentDashboard;