// src/screens/teacher/FeesScreen.tsx
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
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import api from '../../services/api';
import type { StudentFee, Payment } from '../../services/api';

type FeesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Fees'>;
type FeesScreenRouteProp = RouteProp<RootStackParamList, 'Fees'>;

interface Props {
  navigation: FeesScreenNavigationProp;
  route: FeesScreenRouteProp;
}

const FeesScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [showEditTotalFees, setShowEditTotalFees] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [totalFeesAmount, setTotalFeesAmount] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalFees: 0,
    collectionRate: 0,
    totalStudents: 0,
    paidStudents: 0,
    partialStudents: 0,
    pendingStudents: 0,
  });

  useEffect(() => {
    fetchFeesData();
    fetchStats();
  }, [classId, filterStatus]);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await api.getFees(classId, status);
      setStudentFees(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch fees data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getFeeStats(classId);
      setStats({
        totalCollected: data.totalCollected,
        totalPending: data.totalPending,
        totalFees: data.totalFeesAmount,
        collectionRate: data.collectionRate,
        totalStudents: data.totalStudents,
        paidStudents: data.paidStudents,
        partialStudents: data.partialStudents,
        pendingStudents: data.pendingStudents,
      });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getPaymentHistory(classId, 50);
      setPayments(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch payment history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const openAddPayment = (student: StudentFee) => {
    setSelectedStudent(student);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setReceiptNo(`REC${Date.now().toString().slice(-6)}`);
    setShowAddPayment(true);
  };

  const openEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentAmount(payment.amount.toString());
    setPaymentMethod(payment.method.toLowerCase());
    setReceiptNo(payment.receiptNo);
    setShowEditPayment(true);
  };

  const openEditTotalFees = (student: StudentFee) => {
    setSelectedStudent(student);
    setTotalFeesAmount(student.totalFees.toString());
    setShowEditTotalFees(true);
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid payment amount');
      return;
    }

    if (!selectedStudent) return;

    const amount = parseFloat(paymentAmount);
    if (amount > selectedStudent.pendingAmount) {
      Alert.alert('Error', 'Payment amount cannot exceed pending amount');
      return;
    }

    try {
      setSaving(true);
      await api.addPayment(
        selectedStudent.studentId,
        classId,
        amount,
        paymentMethod,
        receiptNo
      );

      setShowAddPayment(false);
      Alert.alert('Success', `Payment of ₹${amount.toLocaleString()} added successfully`);
      
      setTimeout(async () => {
        await Promise.all([fetchFeesData(), fetchStats()]);
      }, 500);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add payment');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid payment amount');
      return;
    }

    if (!selectedPayment) return;

    const amount = parseFloat(paymentAmount);

    try {
      setSaving(true);
      await api.updatePayment(
        selectedPayment.id,
        amount,
        paymentMethod,
        receiptNo
      );

      setShowEditPayment(false);
      Alert.alert('Success', 'Payment updated successfully');
      
      setTimeout(async () => {
        await Promise.all([
          fetchFeesData(),
          fetchStats(),
          fetchPaymentHistory()
        ]);
      }, 500);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTotalFees = async () => {
    if (!totalFeesAmount || parseFloat(totalFeesAmount) < 0) {
      Alert.alert('Error', 'Please enter valid total fees amount');
      return;
    }

    if (!selectedStudent) return;

    const newTotal = parseFloat(totalFeesAmount);

    try {
      setSaving(true);
      await api.updateTotalFees(
        selectedStudent.studentId,
        classId,
        newTotal
      );

      setShowEditTotalFees(false);
      Alert.alert('Success', 'Total fees updated successfully');
      
      setTimeout(async () => {
        await Promise.all([fetchFeesData(), fetchStats()]);
      }, 500);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update total fees');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete payment of ₹${payment.amount} (${payment.receiptNo})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePayment(payment.id);
              Alert.alert('Success', 'Payment deleted successfully');
              await Promise.all([
                fetchFeesData(),
                fetchStats(),
                fetchPaymentHistory()
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const sendFeeReminder = (student: StudentFee) => {
    Alert.alert(
      'Send Reminder',
      `Send fee reminder to ${student.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS',
          onPress: () => handleSendReminder(student, 'sms'),
        },
        {
          text: 'Send Email',
          onPress: () => handleSendReminder(student, 'email'),
        },
      ]
    );
  };

  const handleSendReminder = async (student: StudentFee, type: 'sms' | 'email') => {
    try {
      await api.sendFeeReminder(student.studentId, classId, type);
      Alert.alert('Success', `${type.toUpperCase()} reminder sent successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reminder');
    }
  };

  const openPaymentHistory = async () => {
    setShowPaymentHistory(true);
    await fetchPaymentHistory();
  };

  const renderStudentFee = ({ item }: { item: StudentFee }) => {
    const percentage = Math.round((item.paidAmount / item.totalFees) * 100);
    const statusColor = item.status === 'paid' ? '#43a047' : item.status === 'partial' ? '#ff9800' : '#f44336';
    const statusBg = item.status === 'paid' ? '#e8f5e9' : item.status === 'partial' ? '#fff3e0' : '#ffebee';

    return (
      <View style={[styles.feeCard, SHADOWS.small]}>
        <View style={styles.feeCardHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.feeProgress}>
          <View style={styles.feeAmounts}>
            <Text style={styles.feeAmount}>₹{item.paidAmount.toLocaleString()}</Text>
            <Text style={styles.feeSeparator}>/</Text>
            <TouchableOpacity onPress={() => openEditTotalFees(item)}>
              <View style={styles.editableTotalContainer}>
                <Text style={styles.feeTotalAmount}>₹{item.totalFees.toLocaleString()}</Text>
                <Icon name="create-outline" size={14} color={COLORS.primary} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.feePercentage}>{percentage}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#2196f3', '#1976d2']}
              style={[styles.progressFill, { width: `${percentage}%` }]}
            />
          </View>
        </View>

        {item.pendingAmount > 0 && (
          <View style={styles.feeActions}>
            <TouchableOpacity
              style={styles.addPaymentButton}
              onPress={() => openAddPayment(item)}
            >
              <Icon name="add-circle" size={18} color={COLORS.primary} />
              <Text style={styles.addPaymentText}>Add Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => sendFeeReminder(item)}
            >
              <Icon name="notifications-outline" size={18} color="#ff9800" />
              <Text style={styles.reminderText}>Remind</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.lastPaymentDate !== '-' && (
          <Text style={styles.lastPaymentText}>Last payment: {item.lastPaymentDate}</Text>
        )}
      </View>
    );
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={[styles.paymentCard, SHADOWS.small]}>
      <View style={styles.paymentHeader}>
        <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.paymentIcon}>
          <Icon name="cash" size={20} color={COLORS.white} />
        </LinearGradient>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentStudent}>{item.studentName}</Text>
          <Text style={styles.paymentDate}>{item.date} • {item.method}</Text>
        </View>
        <Text style={styles.paymentAmount}>+₹{item.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.receiptContainer}>
        <Text style={styles.receiptText}>Receipt: {item.receiptNo}</Text>
        <View style={styles.paymentActions}>
          <TouchableOpacity 
            style={styles.editPaymentBtn}
            onPress={() => openEditPayment(item)}
          >
            <Icon name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editPaymentText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deletePaymentBtn}
            onPress={() => handleDeletePayment(item)}
          >
            <Icon name="trash-outline" size={16} color="#f44336" />
            <Text style={styles.deletePaymentText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading fees data...</Text>
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
            <Text style={styles.headerTitle}>Fees Management</Text>
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
          <TouchableOpacity
            onPress={openPaymentHistory}
            style={styles.historyButton}
          >
            <Icon name="receipt-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.medium]}>
          <Icon name="cash" size={28} color="#43a047" />
          <Text style={[styles.statNumber, { color: '#43a047' }]}>
            ₹{(stats.totalCollected / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Collected</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.medium]}>
          <Icon name="hourglass" size={28} color="#ff9800" />
          <Text style={[styles.statNumber, { color: '#ff9800' }]}>
            ₹{(stats.totalPending / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, SHADOWS.medium]}>
          <Icon name="trending-up" size={28} color="#2196f3" />
          <Text style={[styles.statNumber, { color: '#2196f3' }]}>{stats.collectionRate}%</Text>
          <Text style={styles.statLabel}>Collection Rate</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
            All ({stats.totalStudents})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'paid' && styles.filterTabActive]}
          onPress={() => setFilterStatus('paid')}
        >
          <Text style={[styles.filterText, filterStatus === 'paid' && styles.filterTextActive]}>
            Paid ({stats.paidStudents})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'partial' && styles.filterTabActive]}
          onPress={() => setFilterStatus('partial')}
        >
          <Text style={[styles.filterText, filterStatus === 'partial' && styles.filterTextActive]}>
            Partial ({stats.partialStudents})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'pending' && styles.filterTabActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
            Pending ({stats.pendingStudents})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Students List */}
      {studentFees.length > 0 ? (
        <FlatList
          data={studentFees}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentFee}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="cash-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No students found</Text>
          <Text style={styles.emptySubtext}>
            {filterStatus === 'all' 
              ? 'Add students to the class to manage fees'
              : `No students with ${filterStatus} fee status`
            }
          </Text>
        </View>
      )}

      {/* Add Payment Modal */}
      <Modal
        visible={showAddPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddPayment(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment</Text>
              <TouchableOpacity onPress={() => setShowAddPayment(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {selectedStudent && (
                <>
                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Student</Text>
                    <Text style={styles.summaryValue}>{selectedStudent.studentName}</Text>
                  </View>

                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Pending Amount</Text>
                    <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                      ₹{selectedStudent.pendingAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Payment Amount *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Payment Method *</Text>
                    <View style={styles.methodButtons}>
                      {['cash', 'online', 'cheque', 'card'].map((method) => (
                        <TouchableOpacity
                          key={method}
                          style={[
                            styles.methodButton,
                            paymentMethod === method && styles.methodButtonActive,
                          ]}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <Text
                            style={[
                              styles.methodButtonText,
                              paymentMethod === method && styles.methodButtonTextActive,
                            ]}
                          >
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Receipt Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Auto-generated"
                      value={receiptNo}
                      onChangeText={setReceiptNo}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleAddPayment}
                    disabled={saving}
                  >
                    <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                      {saving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      )}
                      <Text style={styles.submitButtonText}>
                        {saving ? 'Adding...' : 'Add Payment'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        visible={showEditPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditPayment(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Payment</Text>
              <TouchableOpacity onPress={() => setShowEditPayment(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {selectedPayment && (
                <>
                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Student</Text>
                    <Text style={styles.summaryValue}>{selectedPayment.studentName}</Text>
                  </View>

                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Original Amount</Text>
                    <Text style={styles.summaryValue}>
                      ₹{selectedPayment.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Payment Amount *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Payment Method *</Text>
                    <View style={styles.methodButtons}>
                      {['cash', 'online', 'cheque', 'card'].map((method) => (
                        <TouchableOpacity
                          key={method}
                          style={[
                            styles.methodButton,
                            paymentMethod === method && styles.methodButtonActive,
                          ]}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <Text
                            style={[
                              styles.methodButtonText,
                              paymentMethod === method && styles.methodButtonTextActive,
                            ]}
                          >
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Receipt Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Receipt number"
                      value={receiptNo}
                      onChangeText={setReceiptNo}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleEditPayment}
                    disabled={saving}
                  >
                    <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                      {saving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      )}
                      <Text style={styles.submitButtonText}>
                        {saving ? 'Updating...' : 'Update Payment'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Total Fees Modal */}
      <Modal
        visible={showEditTotalFees}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditTotalFees(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Total Fees</Text>
              <TouchableOpacity onPress={() => setShowEditTotalFees(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {selectedStudent && (
                <>
                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Student</Text>
                    <Text style={styles.summaryValue}>{selectedStudent.studentName}</Text>
                  </View>

                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Current Total Fees</Text>
                    <Text style={styles.summaryValue}>
                      ₹{selectedStudent.totalFees.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.studentSummary}>
                    <Text style={styles.summaryLabel}>Already Paid</Text>
                    <Text style={[styles.summaryValue, { color: '#43a047' }]}>
                      ₹{selectedStudent.paidAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Total Fees *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new total amount"
                      value={totalFeesAmount}
                      onChangeText={setTotalFeesAmount}
                      keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>
                      Note: Total fees must be at least ₹{selectedStudent.paidAmount.toLocaleString()} (already paid)
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleUpdateTotalFees}
                    disabled={saving}
                  >
                    <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                      {saving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      )}
                      <Text style={styles.submitButtonText}>
                        {saving ? 'Updating...' : 'Update Total Fees'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment History Modal */}
      <Modal
        visible={showPaymentHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment History</Text>
              <TouchableOpacity onPress={() => setShowPaymentHistory(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {loadingHistory ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : payments.length > 0 ? (
              <FlatList
                data={payments}
                keyExtractor={(item) => item.id}
                renderItem={renderPayment}
                contentContainerStyle={styles.paymentList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <Icon name="receipt-outline" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No payments found</Text>
                <Text style={styles.emptySubtext}>Payment history will appear here</Text>
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
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
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
    maxHeight: 45,
    minHeight: 45,
  },
  filterTab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    marginRight: SIZES.sm,
    maxHeight: 40,
    minHeight: 40,
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
  feeCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
  },
  feeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
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
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feeProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  feeAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  feeSeparator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  editableTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feeTotalAmount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editIcon: {
    marginLeft: 2,
  },
  feePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  progressBarContainer: {
    marginBottom: SIZES.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  feeActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
  },
  addPaymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reminderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3e0',
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
  },
  lastPaymentText: {
    fontSize: 12,
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
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl,
  },
  formContainer: {
    paddingHorizontal: SIZES.lg,
  },
  studentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    marginBottom: SIZES.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    fontStyle: 'italic',
  },
  methodButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  methodButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  methodButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
  paymentList: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentStudent: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  paymentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#43a047',
  },
  receiptContainer: {
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  receiptText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
  },
  editPaymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    gap: 4,
  },
  editPaymentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deletePaymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    gap: 4,
  },
  deletePaymentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f44336',
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
  },
});

export default FeesScreen;