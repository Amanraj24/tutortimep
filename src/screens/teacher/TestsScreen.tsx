// src/screens/teacher/TestsScreen.tsx
// ==============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';

type TestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tests'>;
type TestsScreenRouteProp = RouteProp<RootStackParamList, 'Tests'>;

interface Props {
  navigation: TestsScreenNavigationProp;
  route: TestsScreenRouteProp;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  totalMarks: number;
  passingMarks: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  studentsAppeared?: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
}

interface StudentResult {
  id: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
}

const mockTests: Test[] = [
  {
    id: '1',
    title: 'Mid-Term Mathematics',
    subject: 'Mathematics',
    date: '2024-02-05',
    time: '10:00 AM',
    duration: '2 hours',
    totalMarks: 100,
    passingMarks: 40,
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Unit Test - Physics',
    subject: 'Physics',
    date: '2024-01-28',
    time: '11:00 AM',
    duration: '1 hour',
    totalMarks: 50,
    passingMarks: 20,
    status: 'completed',
    studentsAppeared: 42,
    averageScore: 38.5,
    highestScore: 48,
    lowestScore: 15,
  },
  {
    id: '3',
    title: 'English Grammar Test',
    subject: 'English',
    date: '2024-01-25',
    time: '9:00 AM',
    duration: '1.5 hours',
    totalMarks: 75,
    passingMarks: 30,
    status: 'completed',
    studentsAppeared: 40,
    averageScore: 52.3,
    highestScore: 72,
    lowestScore: 28,
  },
];

const mockResults: StudentResult[] = [
  {
    id: '1',
    studentName: 'Rahul Sharma',
    rollNumber: '101',
    marksObtained: 48,
    totalMarks: 50,
    percentage: 96,
    grade: 'A+',
    status: 'pass',
  },
  {
    id: '2',
    studentName: 'Priya Verma',
    rollNumber: '102',
    marksObtained: 42,
    totalMarks: 50,
    percentage: 84,
    grade: 'A',
    status: 'pass',
  },
  {
    id: '3',
    studentName: 'Amit Kumar',
    rollNumber: '103',
    marksObtained: 15,
    totalMarks: 50,
    percentage: 30,
    grade: 'F',
    status: 'fail',
  },
];

const TestsScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [tests, setTests] = useState<Test[]>(mockTests);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  // Form states
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testDuration, setTestDuration] = useState('');
  const [testTotalMarks, setTestTotalMarks] = useState('');
  const [testPassingMarks, setTestPassingMarks] = useState('');

  const filteredTests = filterStatus === 'all' ? tests : tests.filter((t) => t.status === filterStatus);

  const upcomingCount = tests.filter((t) => t.status === 'upcoming').length;
  const completedCount = tests.filter((t) => t.status === 'completed').length;

  const openAddTest = () => {
    setTestTitle('');
    setTestSubject('');
    setTestDate('');
    setTestTime('');
    setTestDuration('');
    setTestTotalMarks('');
    setTestPassingMarks('');
    setShowAddTest(true);
  };

  const openTestDetails = (test: Test) => {
    setSelectedTest(test);
    setShowTestDetails(true);
  };

  const openResults = (test: Test) => {
    setSelectedTest(test);
    setShowResults(true);
  };

  const handleAddTest = () => {
    if (!testTitle || !testSubject || !testDate || !testTotalMarks) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newTest: Test = {
      id: Date.now().toString(),
      title: testTitle,
      subject: testSubject,
      date: testDate,
      time: testTime,
      duration: testDuration,
      totalMarks: parseInt(testTotalMarks),
      passingMarks: parseInt(testPassingMarks),
      status: 'upcoming',
    };

    setTests([newTest, ...tests]);
    setShowAddTest(false);
    Alert.alert('Success', 'Test scheduled successfully');
  };

  const handleDeleteTest = (testId: string) => {
    Alert.alert('Delete Test', 'Are you sure you want to delete this test?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTests(tests.filter((t) => t.id !== testId));
          setShowTestDetails(false);
          Alert.alert('Success', 'Test deleted successfully');
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { bg: '#e3f2fd', text: '#2196f3' };
      case 'ongoing':
        return { bg: '#fff3e0', text: '#ff9800' };
      case 'completed':
        return { bg: '#e8f5e9', text: '#43a047' };
      default:
        return { bg: COLORS.gray50, text: COLORS.textSecondary };
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return '#43a047';
    if (grade === 'B+' || grade === 'B') return '#2196f3';
    if (grade === 'C') return '#ff9800';
    return '#f44336';
  };

  const renderTest = ({ item }: { item: Test }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={[styles.testCard, SHADOWS.medium]}
        onPress={() => openTestDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.testHeader}>
          <View style={styles.testIcon}>
            <LinearGradient colors={GRADIENTS.purple} style={styles.testIconGradient}>
              <Icon name="document-text" size={24} color={COLORS.white} />
            </LinearGradient>
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>{item.title}</Text>
            <Text style={styles.testSubject}>{item.subject}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.testDetails}>
          <View style={styles.testDetailItem}>
            <Icon name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.testDetailText}>{item.date}</Text>
          </View>
          <View style={styles.testDetailItem}>
            <Icon name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.testDetailText}>{item.time}</Text>
          </View>
          <View style={styles.testDetailItem}>
            <Icon name="hourglass-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.testDetailText}>{item.duration}</Text>
          </View>
        </View>

        <View style={styles.testMarks}>
          <View style={styles.markItem}>
            <Text style={styles.markLabel}>Total Marks</Text>
            <Text style={styles.markValue}>{item.totalMarks}</Text>
          </View>
          <View style={styles.markItem}>
            <Text style={styles.markLabel}>Passing</Text>
            <Text style={styles.markValue}>{item.passingMarks}</Text>
          </View>
          {item.averageScore && (
            <View style={styles.markItem}>
              <Text style={styles.markLabel}>Average</Text>
              <Text style={[styles.markValue, { color: COLORS.primary }]}>{item.averageScore}</Text>
            </View>
          )}
        </View>

        {item.status === 'completed' && (
          <TouchableOpacity
            style={styles.viewResultsButton}
            onPress={() => openResults(item)}
          >
            <Icon name="bar-chart" size={16} color={COLORS.primary} />
            <Text style={styles.viewResultsText}>View Results</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderResult = ({ item }: { item: StudentResult }) => (
    <View style={[styles.resultCard, SHADOWS.small]}>
      <View style={styles.resultHeader}>
        <View style={styles.studentResultInfo}>
          <Text style={styles.resultStudentName}>{item.studentName}</Text>
          <Text style={styles.resultRollNumber}>Roll No: {item.rollNumber}</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: `${getGradeColor(item.grade)}20` }]}>
          <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>{item.grade}</Text>
        </View>
      </View>
      <View style={styles.resultDetails}>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Marks</Text>
          <Text style={styles.resultValue}>
            {item.marksObtained}/{item.totalMarks}
          </Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Percentage</Text>
          <Text style={styles.resultValue}>{item.percentage}%</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Status</Text>
          <Text
            style={[
              styles.resultValue,
              { color: item.status === 'pass' ? '#43a047' : '#f44336' },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Tests & Exams</Text>
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
          <TouchableOpacity onPress={openAddTest} style={styles.addButton}>
            <Icon name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="calendar" size={24} color="#2196f3" />
          <Text style={styles.statNumber}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="checkmark-done" size={24} color="#43a047" />
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="document-text" size={24} color="#667eea" />
          <Text style={styles.statNumber}>{tests.length}</Text>
          <Text style={styles.statLabel}>Total Tests</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filterStatus === status && styles.filterTabActive]}
            onPress={() => setFilterStatus(status as any)}
          >
            <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tests List */}
      <FlatList
        data={filteredTests}
        keyExtractor={(item) => item.id}
        renderItem={renderTest}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No tests found</Text>
            <Text style={styles.emptySubtext}>Schedule a test to get started</Text>
          </View>
        }
      />

      {/* Add Test Modal */}
      <Modal
        visible={showAddTest}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddTest(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule New Test</Text>
              <TouchableOpacity onPress={() => setShowAddTest(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Test Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Mid-Term Mathematics"
                  value={testTitle}
                  onChangeText={setTestTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Mathematics"
                  value={testSubject}
                  onChangeText={setTestSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={testDate}
                  onChangeText={setTestDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 10:00 AM"
                  value={testTime}
                  onChangeText={setTestTime}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2 hours"
                  value={testDuration}
                  onChangeText={setTestDuration}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Marks *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 100"
                  value={testTotalMarks}
                  onChangeText={setTestTotalMarks}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Passing Marks *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 40"
                  value={testPassingMarks}
                  onChangeText={setTestPassingMarks}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddTest}>
                <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                  <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Schedule Test</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Test Details Modal */}
      <Modal
        visible={showTestDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTestDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Test Details</Text>
              <TouchableOpacity onPress={() => setShowTestDetails(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTest && (
              <ScrollView style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <LinearGradient colors={GRADIENTS.purple} style={styles.detailsIcon}>
                    <Icon name="document-text" size={40} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={styles.detailsTitle}>{selectedTest.title}</Text>
                  <View
                    style={[
                      styles.detailsStatusBadge,
                      { backgroundColor: getStatusColor(selectedTest.status).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailsStatusText,
                        { color: getStatusColor(selectedTest.status).text },
                      ]}
                    >
                      {selectedTest.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Test Information</Text>
                  <View style={styles.detailRow}>
                    <Icon name="book" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Subject:</Text>
                    <Text style={styles.detailValue}>{selectedTest.subject}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedTest.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="time" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{selectedTest.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="hourglass" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{selectedTest.duration}</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Marks</Text>
                  <View style={styles.marksGrid}>
                    <View style={styles.marksGridItem}>
                      <Text style={styles.marksGridValue}>{selectedTest.totalMarks}</Text>
                      <Text style={styles.marksGridLabel}>Total</Text>
                    </View>
                    <View style={styles.marksGridItem}>
                      <Text style={styles.marksGridValue}>{selectedTest.passingMarks}</Text>
                      <Text style={styles.marksGridLabel}>Passing</Text>
                    </View>
                    {selectedTest.highestScore && (
                      <View style={styles.marksGridItem}>
                        <Text style={[styles.marksGridValue, { color: '#43a047' }]}>
                          {selectedTest.highestScore}
                        </Text>
                        <Text style={styles.marksGridLabel}>Highest</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  {selectedTest.status === 'completed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#e3f2fd' }]}
                      onPress={() => openResults(selectedTest)}
                    >
                      <Icon name="bar-chart" size={20} color="#2196f3" />
                      <Text style={[styles.actionButtonText, { color: '#2196f3' }]}>
                        View Results
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ffebee' }]}
                    onPress={() => handleDeleteTest(selectedTest.id)}
                  >
                    <Icon name="trash" size={20} color="#f44336" />
                    <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Test Results</Text>
                {selectedTest && <Text style={styles.modalSubtitle}>{selectedTest.title}</Text>}
              </View>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={mockResults}
              keyExtractor={(item) => item.id}
              renderItem={renderResult}
              contentContainerStyle={styles.resultsList}
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
  addButton: {
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
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
 
    maxHeight:45,
    minHeight:45,
  },
  filterTab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 17,
    backgroundColor: COLORS.gray50,
    marginRight: SIZES.sm,
    maxHeight:40,
    minHeight:40,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  testCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  testIcon: {
    marginRight: SIZES.md,
  },
  testIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  testSubject: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  testDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  testMarks: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    gap: SIZES.lg,
  },
  markItem: {
    alignItems: 'center',
  },
  markLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  markValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  viewResultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusMd,
    gap: 6,
  },
  viewResultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
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
    maxHeight: '85%',
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
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  submitButton: {
    marginVertical: SIZES.lg,
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
  detailsContainer: {
    paddingHorizontal: SIZES.lg,
  },
  detailsHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  detailsIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  detailsStatusBadge: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailsStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: SIZES.lg,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  marksGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    gap: SIZES.lg,
  },
  marksGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  marksGridValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  marksGridLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultsList: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  studentResultInfo: {
    flex: 1,
  },
  resultStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultRollNumber: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gradeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultDetails: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    gap: SIZES.md,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});

export default TestsScreen;