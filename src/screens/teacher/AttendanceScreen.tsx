// src/screens/teacher/AttendanceScreen.tsx
// ==============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import api from '../../services/api';
import type { AttendanceRecord, AttendanceHistory } from '../../services/api';

type AttendanceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Attendance'>;
type AttendanceScreenRouteProp = RouteProp<RootStackParamList, 'Attendance'>;

interface Props {
  navigation: AttendanceScreenNavigationProp;
  route: AttendanceScreenRouteProp;
}

const AttendanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Calculate stats from current students array
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const percentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  useEffect(() => {
    fetchAttendance();
  }, [classId, selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendance(classId, selectedDate);
      setStudents(data.students);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getAttendanceHistory(classId, 30);
      setHistory(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, status: student.status === status ? null : status }
          : student
      )
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((student) => ({ ...student, status: 'present' as const })));
  };

  const markAllAbsent = () => {
    setStudents((prev) => prev.map((student) => ({ ...student, status: 'absent' as const })));
  };

  const handleSaveAttendance = () => {
    const unmarkedStudents = students.filter((s) => s.status === null);
    
    if (unmarkedStudents.length > 0) {
      Alert.alert(
        'Warning', 
        `${unmarkedStudents.length} students are not marked. Do you want to continue?`, 
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveAttendance() },
        ]
      );
    } else {
      saveAttendance();
    }
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      // Prepare attendance data for API
      const attendanceData = students
        .filter(student => student.status !== null)
        .map(student => ({
          studentId: student.id,
          status: student.status as 'present' | 'absent' | 'late'
        }));

      const result = await api.saveAttendance(classId, selectedDate, attendanceData);
      
      Alert.alert('Success', 'Attendance saved successfully');
      
      // Refresh attendance data to show updated status
      await fetchAttendance();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setShowHistory(false);
  };

  const openHistory = async () => {
    setShowHistory(true);
    await fetchHistory();
  };

  const renderStudent = ({ item }: { item: AttendanceRecord }) => (
    <View style={[styles.studentCard, SHADOWS.small]}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>
      </View>
      <View style={styles.statusButtons}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            styles.presentButton,
            item.status === 'present' && styles.statusButtonActive,
          ]}
          onPress={() => handleStatusChange(item.id, 'present')}
        >
          <Icon
            name="checkmark-circle"
            size={20}
            color={item.status === 'present' ? COLORS.white : '#43a047'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            styles.lateButton,
            item.status === 'late' && styles.statusButtonActive,
          ]}
          onPress={() => handleStatusChange(item.id, 'late')}
        >
          <Icon
            name="time"
            size={20}
            color={item.status === 'late' ? COLORS.white : '#ff9800'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            styles.absentButton,
            item.status === 'absent' && styles.statusButtonActive,
          ]}
          onPress={() => handleStatusChange(item.id, 'absent')}
        >
          <Icon
            name="close-circle"
            size={20}
            color={item.status === 'absent' ? COLORS.white : '#f44336'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: AttendanceHistory }) => {
    const rate = Math.round((item.presentCount / item.totalStudents) * 100);
    return (
      <TouchableOpacity 
        style={[styles.historyCard, SHADOWS.small]}
        onPress={() => handleDateChange(item.date.split('/').reverse().join('-'))} // Convert DD/MM/YYYY to YYYY-MM-DD
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>{item.date}</Text>
          <View style={[styles.historyBadge, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[styles.historyBadgeText, { color: '#43a047' }]}>{rate}%</Text>
          </View>
        </View>
        <View style={styles.historyStats}>
          <View style={styles.historyStat}>
            <Icon name="checkmark-circle" size={16} color="#43a047" />
            <Text style={styles.historyStatText}>{item.presentCount} Present</Text>
          </View>
          <View style={styles.historyStat}>
            <Icon name="time" size={16} color="#ff9800" />
            <Text style={styles.historyStatText}>{item.lateCount} Late</Text>
          </View>
          <View style={styles.historyStat}>
            <Icon name="close-circle" size={16} color="#f44336" />
            <Text style={styles.historyStatText}>{item.absentCount} Absent</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading attendance...</Text>
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSubtitle}>
              {className} • {new Date(selectedDate).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={openHistory}
            style={styles.historyButton}
          >
            <Icon name="calendar-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.medium, { backgroundColor: '#e8f5e9' }]}>
          <Icon name="checkmark-circle" size={24} color="#43a047" />
          <Text style={[styles.statNumber, { color: '#43a047' }]}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.medium, { backgroundColor: '#fff3e0' }]}>
          <Icon name="time" size={24} color="#ff9800" />
          <Text style={[styles.statNumber, { color: '#ff9800' }]}>{lateCount}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.medium, { backgroundColor: '#ffebee' }]}>
          <Icon name="close-circle" size={24} color="#f44336" />
          <Text style={[styles.statNumber, { color: '#f44336' }]}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressCard, SHADOWS.medium]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Attendance Rate</Text>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={percentage >= 75 ? ['#43e97b', '#38f9d7'] : percentage >= 50 ? ['#ffb74d', '#ff9800'] : ['#f44336', '#d32f2f']}
            style={[styles.progressFill, { width: `${percentage}%` }]}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#e8f5e9' }]}
          onPress={markAllPresent}
        >
          <Icon name="checkmark-done" size={20} color="#43a047" />
          <Text style={[styles.quickActionText, { color: '#43a047' }]}>Mark All Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#ffebee' }]}
          onPress={markAllAbsent}
        >
          <Icon name="close-circle-outline" size={20} color="#f44336" />
          <Text style={[styles.quickActionText, { color: '#f44336' }]}>Mark All Absent</Text>
        </TouchableOpacity>
      </View>

      {/* Students List */}
      {students.length > 0 ? (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No students found</Text>
          <Text style={styles.emptySubtext}>Add students to the class to mark attendance</Text>
        </View>
      )}

      {/* Save Button */}
      {students.length > 0 && (
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveAttendance}
          disabled={saving}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.saveButtonGradient}>
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Icon name="save" size={24} color={COLORS.white} />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* History Modal */}
      <Modal
        visible={showHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendance History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {loadingHistory ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : history.length > 0 ? (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.historyList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <Icon name="calendar-outline" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No attendance history</Text>
                <Text style={styles.emptySubtext}>Start marking attendance to see history</Text>
              </View>
            )}
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
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SIZES.xs,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  historyButton: {
    padding: SIZES.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    marginTop: -10,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#43a047',
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.gray100,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: 100,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  studentRoll: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  statusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  presentButton: {
    backgroundColor: COLORS.white,
    borderColor: '#43a047',
  },
  lateButton: {
    backgroundColor: COLORS.white,
    borderColor: '#ff9800',
  },
  absentButton: {
    backgroundColor: COLORS.white,
    borderColor: '#f44336',
  },
  statusButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: SIZES.lg,
    left: SIZES.lg,
    right: SIZES.lg,
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
    maxHeight: '70%',
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
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl,
  },
  historyList: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyStats: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
  },
});

export default AttendanceScreen;