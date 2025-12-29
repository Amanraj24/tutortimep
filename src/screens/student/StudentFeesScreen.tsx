// src/screens/student/StudentFeesScreen.tsx
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
import ApiService, { StudentFeeSummary, FeePayment } from '../../services/api';

type StudentFeesNavigationProp = StackNavigationProp<RootStackParamList, 'StudentFees'>;
type StudentFeesRouteProp = RouteProp<RootStackParamList, 'StudentFees'>;

interface Props {
  navigation: StudentFeesNavigationProp;
  route: StudentFeesRouteProp;
}

const StudentFeesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<StudentFeeSummary | null>(null);
  const [payments, setPayments] = useState<FeePayment[]>([]);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentFees(classId);
      setSummary(data.summary);
      setPayments(data.payments);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFees().finally(() => setRefreshing(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#43a047';
      case 'partial':
        return '#ff9800';
      case 'pending':
        return '#f44336';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partially Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading fees...</Text>
      </View>
    );
  }

  const paidPercentage = summary
    ? Math.round((summary.paidAmount / summary.totalFees) * 100)
    : 0;

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
            <Text style={styles.headerTitle}>Fees</Text>
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
              <Text style={styles.summaryTitle}>Fee Summary</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(summary.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(summary.status) },
                  ]}
                >
                  {getStatusLabel(summary.status).toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total Fees</Text>
                <Text style={styles.amountValue}>
                  ₹{summary.totalFees.toLocaleString()}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Paid Amount</Text>
                <Text style={[styles.amountValue, { color: '#43a047' }]}>
                  ₹{summary.paidAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.amountRow}>
                <Text style={styles.amountLabelBold}>Pending Amount</Text>
                <Text style={[styles.amountValueBold, { color: '#f44336' }]}>
                  ₹{summary.pendingAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#2196f3', '#1976d2']}
                style={[styles.progressFill, { width: `${paidPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {paidPercentage}% of fees paid
            </Text>

            {summary.lastPaymentDate && (
              <View style={styles.lastPaymentContainer}>
                <Icon name="calendar" size={16} color={COLORS.textSecondary} />
                <Text style={styles.lastPaymentText}>
                  Last payment: {summary.lastPaymentDate}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>

          {payments.length > 0 ? (
            <View style={[styles.paymentsCard, SHADOWS.small]}>
              {payments.map((payment, index) => (
                <View key={payment.id}>
                  {index > 0 && <View style={styles.paymentDivider} />}
                  <View style={styles.paymentItem}>
                    <View style={styles.paymentLeft}>
                      <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.paymentIcon}
                      >
                        <Icon name="checkmark" size={24} color={COLORS.white} />
                      </LinearGradient>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentAmount}>
                          ₹{payment.amount.toLocaleString()}
                        </Text>
                        <Text style={styles.paymentDate}>{payment.paymentDate}</Text>
                        <Text style={styles.paymentMethod}>
                          {payment.paymentMethod.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentRight}>
                      {payment.receiptNo && (
                        <View style={styles.receiptContainer}>
                          <Icon name="receipt" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.receiptNo}>{payment.receiptNo}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cash-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Payments Yet</Text>
              <Text style={styles.emptySubtitle}>
                No payment records found for this class
              </Text>
            </View>
          )}
        </View>

        {/* Payment Instructions */}
        {summary && summary.pendingAmount > 0 && (
          <View style={[styles.instructionsCard, SHADOWS.small]}>
            <View style={styles.instructionsHeader}>
              <Icon name="information-circle" size={24} color="#2196f3" />
              <Text style={styles.instructionsTitle}>Payment Instructions</Text>
            </View>
            <Text style={styles.instructionsText}>
              Please contact your teacher to make fee payments. Once the payment
              is processed, it will be reflected here.
            </Text>
          </View>
        )}

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
    marginBottom: SIZES.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
  amountContainer: {
    marginBottom: SIZES.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountValueBold: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SIZES.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  lastPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  lastPaymentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
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
  paymentsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  paymentDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentMethod: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentRight: {
    justifyContent: 'center',
  },
  receiptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receiptNo: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  paymentDivider: {
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
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginTop: SIZES.lg,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginLeft: SIZES.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});

export default StudentFeesScreen;