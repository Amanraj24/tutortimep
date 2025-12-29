// src/screens/student/StudentAttendanceScreen.tsx
// ==============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService, { StudentAttendanceRecord, AttendanceSummary } from '../../services/api';

type StudentAttendanceNavigationProp = StackNavigationProp<RootStackParamList, 'StudentAttendance'>;
type StudentAttendanceRouteProp = RouteProp<RootStackParamList, 'StudentAttendance'>;

interface Props {
  navigation: StudentAttendanceNavigationProp;
  route: StudentAttendanceRouteProp;
}

const StudentAttendanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classId, className, teacherName } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadAttendance();
  }, [selectedPeriod]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentAttendance(classId, selectedPeriod);
      setRecords(data.records);
      setSummary(data.summary);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAttendance().finally(() => setRefreshing(false));
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#43a047';
      case 'absent':
        return '#f44336';
      case 'late':
        return '#ff9800';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'checkmark-circle';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const periods = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: 'All Time', value: 365 },
  ];

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
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
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        {summary && (
          <View style={[styles.summaryCard, SHADOWS.medium]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Attendance Summary</Text>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{summary.percentage}%</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={[styles.progressFill, { width: `${summary.percentage}%` }]}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="calendar" size={20} color="#667eea" />
                <Text style={styles.statValue}>{summary.totalDays}</Text>
                <Text style={styles.statLabel}>Total Days</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="checkmark-circle" size={20} color="#43a047" />
                <Text style={styles.statValue}>{summary.presentDays}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="close-circle" size={20} color="#f44336" />
                <Text style={styles.statValue}>{summary.absentDays}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="time" size={20} color="#ff9800" />
                <Text style={styles.statValue}>{summary.lateDays}</Text>
                <Text style={styles.statLabel}>Late</Text>
              </View>
            </View>
          </View>
        )}

        {/* Period Filter */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.value && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Attendance Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance History</Text>

          {records.length > 0 ? (
            <View style={[styles.recordsCard, SHADOWS.small]}>
              {records.map((record, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.recordDivider} />}
                  <View style={styles.recordItem}>
                    <View style={styles.recordLeft}>
                      <View
                        style={[
                          styles.recordIcon,
                          { backgroundColor: `${getStatusColor(record.status)}20` },
                        ]}
                      >
                        <Icon
                          name={getStatusIcon(record.status)}
                          size={24}
                          color={getStatusColor(record.status)}
                        />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordDate}>{record.date}</Text>
                        {record.markedAt && (
                          <Text style={styles.recordTime}>Marked: {record.markedAt}</Text>
                        )}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(record.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(record.status) },
                        ]}
                      >
                        {record.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySubtitle}>
                No attendance records for the selected period
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: SIZES.xl }} />
      </ScrollView>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginTop: SIZES.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  percentageBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#43a047',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  periodContainer: {
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  periodButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  section: {
    marginTop: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  recordsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  recordTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SIZES.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
});

export default StudentAttendanceScreen;