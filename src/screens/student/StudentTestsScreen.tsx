// src/screens/student/StudentTestsScreen.tsx
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
import ApiService, { StudentTest } from '../../services/api';

type StudentTestsNavigationProp = StackNavigationProp<RootStackParamList, 'StudentTests'>;
type StudentTestsRouteProp = RouteProp<RootStackParamList, 'StudentTests'>;

interface Props {
  navigation: StudentTestsNavigationProp;
  route: StudentTestsRouteProp;
}

const StudentTestsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentTests(classId);
      setTests(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadTests().finally(() => setRefreshing(false));
  }, []);

  const getFilteredTests = () => {
    if (selectedTab === 'upcoming') {
      return tests.filter(test => test.status === 'upcoming');
    } else if (selectedTab === 'completed') {
      return tests.filter(test => test.status === 'completed');
    }
    return tests;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#2196f3';
      case 'ongoing':
        return '#ff9800';
      case 'completed':
        return '#43a047';
      case 'cancelled':
        return '#f44336';
      default:
        return COLORS.textSecondary;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#43a047';
    if (percentage >= 75) return '#66bb6a';
    if (percentage >= 60) return '#ff9800';
    if (percentage >= 40) return '#ff5722';
    return '#f44336';
  };

  const handleTestPress = (test: StudentTest) => {
    if (test.result) {
      // Show result details
      Alert.alert(
        test.title,
        `Marks: ${test.result.marksObtained}/${test.maxMarks}\n` +
        `Percentage: ${test.result.percentage}%\n` +
        `Grade: ${test.result.grade}\n` +
        (test.result.remarks ? `\nRemarks: ${test.result.remarks}` : ''),
        [{ text: 'OK' }]
      );
    } else {
      // Show test details
      Alert.alert(
        test.title,
        `Subject: ${test.subject}\n` +
        `Date: ${test.testDate}\n` +
        `Duration: ${test.durationMinutes} minutes\n` +
        `Max Marks: ${test.maxMarks}\n` +
        `Status: ${test.status.toUpperCase()}\n\n` +
        (test.description || ''),
        [{ text: 'OK' }]
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tests...</Text>
      </View>
    );
  }

  const filteredTests = getFilteredTests();
  const upcomingCount = tests.filter(t => t.status === 'upcoming').length;
  const completedCount = tests.filter(t => t.status === 'completed').length;

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
            <Text style={styles.headerTitle}>Tests</Text>
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
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, SHADOWS.small]}>
            <LinearGradient colors={['#2196f3', '#1976d2']} style={styles.statIcon}>
              <Icon name="time" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>

          <View style={[styles.statCard, SHADOWS.small]}>
            <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.statIcon}>
              <Icon name="checkmark-done" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={[styles.statCard, SHADOWS.small]}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statIcon}>
              <Icon name="newspaper" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.statValue}>{tests.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              All ({tests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming ({upcomingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tests List */}
        <View style={styles.section}>
          {filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={[styles.testCard, SHADOWS.small]}
                activeOpacity={0.7}
                onPress={() => handleTestPress(test)}
              >
                <View style={styles.testHeader}>
                  <View style={styles.testHeaderLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(test.status) },
                      ]}
                    />
                    <View style={styles.testHeaderText}>
                      <Text style={styles.testTitle}>{test.title}</Text>
                      <Text style={styles.testSubject}>{test.subject}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(test.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(test.status) },
                      ]}
                    >
                      {test.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.testDetails}>
                  <View style={styles.testDetail}>
                    <Icon name="calendar" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.testDetailText}>{test.testDate}</Text>
                  </View>
                  <View style={styles.testDetail}>
                    <Icon name="time" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.testDetailText}>{test.durationMinutes} min</Text>
                  </View>
                  <View style={styles.testDetail}>
                    <Icon name="trophy" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.testDetailText}>{test.maxMarks} marks</Text>
                  </View>
                </View>

                {test.result ? (
                  <View style={styles.resultContainer}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultTitle}>Your Result</Text>
                      <View
                        style={[
                          styles.percentageBadge,
                          { backgroundColor: `${getGradeColor(test.result.percentage)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.percentageText,
                            { color: getGradeColor(test.result.percentage) },
                          ]}
                        >
                          {test.result.percentage}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.resultRow}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Marks Obtained</Text>
                        <Text style={styles.resultValue}>
                          {test.result.marksObtained}/{test.maxMarks}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Grade</Text>
                        <Text
                          style={[
                            styles.resultValue,
                            { color: getGradeColor(test.result.percentage) },
                          ]}
                        >
                          {test.result.grade}
                        </Text>
                      </View>
                    </View>

                    {test.result.remarks && (
                      <View style={styles.remarksContainer}>
                        <Icon name="chatbubble-ellipses" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.remarksText}>{test.result.remarks}</Text>
                      </View>
                    )}

                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={[getGradeColor(test.result.percentage), getGradeColor(test.result.percentage)]}
                        style={[
                          styles.progressFill,
                          { width: `${test.result.percentage}%` },
                        ]}
                      />
                    </View>
                  </View>
                ) : (
                  test.description && (
                    <Text style={styles.testDescription} numberOfLines={2}>
                      {test.description}
                    </Text>
                  )
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="newspaper-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Tests Found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === 'all'
                  ? 'No tests scheduled yet'
                  : `No ${selectedTab} tests`}
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
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 4,
    marginTop: SIZES.lg,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  section: {
    marginTop: SIZES.lg,
  },
  testCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  testHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: SIZES.sm,
  },
  testHeaderText: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  testSubject: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  testDetails: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  testDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  testDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  resultContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  percentageBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 16,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    gap: SIZES.lg,
    marginBottom: SIZES.md,
  },
  resultItem: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.sm,
  },
  remarksText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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

export default StudentTestsScreen;