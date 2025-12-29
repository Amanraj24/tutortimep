// src/screens/teacher/ReportsScreen.tsx
// ==============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';

const { width } = Dimensions.get('window');

type ReportsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reports'>;
type ReportsScreenRouteProp = RouteProp<RootStackParamList, 'Reports'>;

interface Props {
  navigation: ReportsScreenNavigationProp;
  route: ReportsScreenRouteProp;
}

interface PerformanceData {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  color: string[];
}

const ReportsScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const performanceData: PerformanceData[] = [
    { subject: 'Mathematics', average: 78, highest: 98, lowest: 45, color: ['#667eea', '#764ba2'] },
    { subject: 'Physics', average: 72, highest: 92, lowest: 38, color: ['#f093fb', '#f5576c'] },
    { subject: 'Chemistry', average: 81, highest: 95, lowest: 55, color: ['#43e97b', '#38f9d7'] },
    { subject: 'English', average: 75, highest: 88, lowest: 42, color: ['#2196f3', '#1976d2'] },
    { subject: 'Biology', average: 83, highest: 96, lowest: 60, color: ['#ff9800', '#f57c00'] },
  ];

  const attendanceData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 88 },
    { month: 'Mar', rate: 95 },
    { month: 'Apr', rate: 90 },
    { month: 'May', rate: 87 },
  ];

  const topPerformers = [
    { name: 'Rahul Sharma', average: 95, rank: 1 },
    { name: 'Priya Verma', average: 92, rank: 2 },
    { name: 'Amit Kumar', average: 88, rank: 3 },
  ];

  const needsAttention = [
    { name: 'Vikram Singh', average: 42, subjects: 'Math, Physics' },
    { name: 'Neha Gupta', average: 48, subjects: 'Chemistry' },
  ];

  const overallStats = {
    classAverage: 78.5,
    attendanceRate: 90,
    feesCollected: 85,
    totalTests: 12,
  };

  const renderPerformanceCard = (item: PerformanceData) => (
    <View key={item.subject} style={[styles.performanceCard, SHADOWS.medium]}>
      <LinearGradient colors={item.color} style={styles.performanceGradient}>
        <View style={styles.performanceHeader}>
          <Text style={styles.performanceSubject}>{item.subject}</Text>
          <View style={styles.averageBadge}>
            <Text style={styles.averageText}>{item.average}%</Text>
          </View>
        </View>

        <View style={styles.performanceStats}>
          <View style={styles.performanceStat}>
            <Icon name="trending-up" size={16} color={COLORS.white} />
            <Text style={styles.performanceStatLabel}>Highest</Text>
            <Text style={styles.performanceStatValue}>{item.highest}</Text>
          </View>
          <View style={styles.performanceStat}>
            <Icon name="trending-down" size={16} color={COLORS.white} />
            <Text style={styles.performanceStatLabel}>Lowest</Text>
            <Text style={styles.performanceStatValue}>{item.lowest}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.average}%` }]} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderAttendanceBar = (data: { month: string; rate: number }, index: number) => (
    <View key={index} style={styles.barContainer}>
      <View style={styles.bar}>
        <LinearGradient
          colors={['#43e97b', '#38f9d7']}
          style={[styles.barFill, { height: `${data.rate}%` }]}
        />
      </View>
      <Text style={styles.barLabel}>{data.month}</Text>
      <Text style={styles.barValue}>{data.rate}%</Text>
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
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, SHADOWS.medium]}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statBoxGradient}>
                <Icon name="school" size={28} color={COLORS.white} />
                <Text style={styles.statBoxValue}>{overallStats.classAverage}%</Text>
                <Text style={styles.statBoxLabel}>Class Average</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, SHADOWS.medium]}>
              <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.statBoxGradient}>
                <Icon name="checkmark-done" size={28} color={COLORS.white} />
                <Text style={styles.statBoxValue}>{overallStats.attendanceRate}%</Text>
                <Text style={styles.statBoxLabel}>Attendance</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, SHADOWS.medium]}>
              <LinearGradient colors={['#2196f3', '#1976d2']} style={styles.statBoxGradient}>
                <Icon name="cash" size={28} color={COLORS.white} />
                <Text style={styles.statBoxValue}>{overallStats.feesCollected}%</Text>
                <Text style={styles.statBoxLabel}>Fees Collected</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, SHADOWS.medium]}>
              <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.statBoxGradient}>
                <Icon name="document-text" size={28} color={COLORS.white} />
                <Text style={styles.statBoxValue}>{overallStats.totalTests}</Text>
                <Text style={styles.statBoxLabel}>Total Tests</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Subject-wise Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.performanceContainer}>
              {performanceData.map(renderPerformanceCard)}
            </View>
          </ScrollView>
        </View>

        {/* Attendance Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Trend</Text>
          <View style={[styles.chartCard, SHADOWS.medium]}>
            <View style={styles.chartContainer}>
              {attendanceData.map(renderAttendanceBar)}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#43e97b' }]} />
                <Text style={styles.legendText}>Attendance Rate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers 🏆</Text>
          {topPerformers.map((student, index) => (
            <View key={index} style={[styles.rankCard, SHADOWS.small]}>
              <View style={styles.rankBadge}>
                <LinearGradient
                  colors={
                    index === 0
                      ? ['#ffd700', '#ffed4e']
                      : index === 1
                      ? ['#c0c0c0', '#e8e8e8']
                      : ['#cd7f32', '#e8b887']
                  }
                  style={styles.rankBadgeGradient}
                >
                  <Text style={styles.rankNumber}>{student.rank}</Text>
                </LinearGradient>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{student.name}</Text>
                <View style={styles.rankMeta}>
                  <Icon name="trophy" size={14} color="#f39c12" />
                  <Text style={styles.rankAverage}>{student.average}% Average</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
          ))}
        </View>

        {/* Needs Attention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students Need Attention ⚠️</Text>
          {needsAttention.map((student, index) => (
            <View key={index} style={[styles.attentionCard, SHADOWS.small]}>
              <View style={styles.attentionIcon}>
                <Icon name="alert-circle" size={24} color="#f44336" />
              </View>
              <View style={styles.attentionInfo}>
                <Text style={styles.attentionName}>{student.name}</Text>
                <Text style={styles.attentionSubjects}>Weak in: {student.subjects}</Text>
                <View style={styles.attentionMeta}>
                  <Text style={styles.attentionAverage}>{student.average}% Average</Text>
                  <View style={[styles.attentionBadge, { backgroundColor: '#ffebee' }]}>
                    <Text style={[styles.attentionBadgeText, { color: '#f44336' }]}>
                      Below Average
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
    marginTop: SIZES.md,
    marginBottom: SIZES.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
  },
  statBox: {
    width: (width - SIZES.lg * 2 - SIZES.md) / 2,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  statBoxGradient: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.sm,
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  performanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
  },
  performanceCard: {
    width: width * 0.7,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  performanceGradient: {
    padding: SIZES.lg,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  performanceSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  averageBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  averageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  performanceStats: {
    flexDirection: 'row',
    gap: SIZES.lg,
    marginBottom: SIZES.md,
  },
  performanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  performanceStatLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  performanceStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: SIZES.md,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 40,
    height: 150,
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 20,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  chartLegend: {
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.sm,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
  },
  rankBadge: {
    marginRight: SIZES.md,
  },
  rankBadgeGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  rankMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankAverage: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  attentionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
  },
  attentionIcon: {
    marginRight: SIZES.md,
  },
  attentionInfo: {
    flex: 1,
  },
  attentionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  attentionSubjects: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  attentionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  attentionAverage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  attentionBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  attentionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ReportsScreen;