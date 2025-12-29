// src/screens/teacher/StudentsScreen.tsx
// ==============================================
// Updated with Create New Student feature

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
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
import type { Student } from '../../services/api';

type StudentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Students'>;
type StudentsScreenRouteProp = RouteProp<RootStackParamList, 'Students'>;

interface Props {
  navigation: StudentsScreenNavigationProp;
  route: StudentsScreenRouteProp;
}

const StudentsScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchUniqueId, setSearchUniqueId] = useState('');
  const [saving, setSaving] = useState(false);

  // Form states for creating/editing
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    filterStudents(searchQuery);
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents(classId);
      setStudents(data);
      setFilteredStudents(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = (query: string) => {
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowercaseQuery) ||
        student.uniqueId.toLowerCase().includes(lowercaseQuery) ||
        student.rollNumber.includes(lowercaseQuery) ||
        student.email.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredStudents(filtered);
  };

  const searchStudentByUniqueId = async (uniqueId: string) => {
    if (uniqueId.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await api.searchStudents(uniqueId);
      setSearchResults(results);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search students');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormParentPhone('');
    setFormAddress('');
    setFormRollNumber('');
    setFormDateOfBirth('');
    setContactMethod('email');
  };

  const openSearchModal = () => {
    setSearchUniqueId('');
    setSearchResults([]);
    setShowSearchModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowSearchModal(false);
    setShowCreateModal(true);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormPhone(student.phone);
    setFormParentPhone(student.parentPhone);
    setFormAddress(student.address);
    setFormRollNumber(student.rollNumber);
    setFormDateOfBirth(student.dateOfBirth);
    setShowEditModal(true);
  };

  const openDetailsModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const addStudentFromSearch = async (student: Student) => {
    try {
      await api.addExistingStudent(student.uniqueId, classId);
      setShowSearchModal(false);
      Alert.alert('Success', `${student.name} has been added to the class`);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add student');
    }
  };

  const handleCreateStudent = async () => {
    // Validation
    if (!formName || !formRollNumber) {
      Alert.alert('Error', 'Name and roll number are required');
      return;
    }

    if (contactMethod === 'email' && !formEmail) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (contactMethod === 'phone' && !formPhone) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    try {
      setSaving(true);
      
      const studentData = {
        name: formName,
        email: contactMethod === 'email' ? formEmail : '',
        phone: formPhone,
        parentPhone: formParentPhone,
        address: formAddress,
        rollNumber: formRollNumber,
        dateOfBirth: formDateOfBirth,
      };

      await api.createStudent(classId, studentData);
      
      setShowCreateModal(false);
      Alert.alert('Success', `${formName} has been created and added to the class`);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!formName || !formRollNumber) {
      Alert.alert('Error', 'Name and roll number are required');
      return;
    }

    if (!selectedStudent) return;

    try {
      setSaving(true);
      await api.updateStudent(selectedStudent.id, {
        name: formName,
        email: formEmail,
        phone: formPhone,
        parentPhone: formParentPhone,
        address: formAddress,
        rollNumber: formRollNumber,
        dateOfBirth: formDateOfBirth,
      });

      setShowEditModal(false);
      Alert.alert('Success', 'Student updated successfully');
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${student.name} from this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeStudentFromClass(student.id, classId);
              Alert.alert('Success', 'Student removed from class');
              fetchStudents();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove student');
            }
          },
        },
      ]
    );
  };

  const renderStudentCard = ({ item }: { item: Student }) => {
    const feesPercentage = Math.round((item.feesPaid / item.feesTotal) * 100);

    return (
      <TouchableOpacity
        style={[styles.studentCard, SHADOWS.small]}
        onPress={() => openDetailsModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.studentCardLeft}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.studentAvatar}
          >
            <Text style={styles.studentAvatarText}>
              {item.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </Text>
          </LinearGradient>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentMeta}>Roll No: {item.rollNumber} • ID: {item.uniqueId}</Text>
            <View style={styles.studentStats}>
              <View style={styles.statBadge}>
                <Icon name="checkmark-circle" size={14} color="#43a047" />
                <Text style={styles.statBadgeText}>{item.attendance}%</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#e3f2fd' }]}>
                <Icon name="cash" size={14} color="#1565c0" />
                <Text style={[styles.statBadgeText, { color: '#1565c0' }]}>
                  {feesPercentage}%
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.studentCardActions}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={styles.iconButton}
          >
            <Icon name="create-outline" size={20} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteStudent(item)}
            style={styles.iconButton}
          >
            <Icon name="trash-outline" size={20} color="#f5576c" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addStudentFromSearch(item)}
    >
      <View style={styles.searchResultLeft}>
        <LinearGradient
          colors={['#43e97b', '#38f9d7']}
          style={styles.searchResultAvatar}
        >
          <Text style={styles.searchResultAvatarText}>
            {item.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
          </Text>
        </LinearGradient>
        <View>
          <Text style={styles.searchResultName}>{item.name}</Text>
          <Text style={styles.searchResultId}>ID: {item.uniqueId}</Text>
          {item.email && <Text style={styles.searchResultEmail}>{item.email}</Text>}
        </View>
      </View>
      <Icon name="add-circle" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Students</Text>
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
          <TouchableOpacity
            onPress={openSearchModal}
            style={styles.addButton}
          >
            <Icon name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, SHADOWS.small]}>
          <Icon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or roll number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, SHADOWS.small]}>
          <Icon name="people" size={24} color="#667eea" />
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={[styles.statItem, SHADOWS.small]}>
          <Icon name="checkmark-done" size={24} color="#43e97b" />
          <Text style={styles.statNumber}>
            {Math.round(
              students.reduce((acc, s) => acc + s.attendance, 0) / students.length || 0
            )}%
          </Text>
          <Text style={styles.statLabel}>Avg Attendance</Text>
        </View>
        <View style={[styles.statItem, SHADOWS.small]}>
          <Icon name="cash" size={24} color="#2196f3" />
          <Text style={styles.statNumber}>
            {Math.round(
              (students.reduce((acc, s) => acc + s.feesPaid, 0) /
                students.reduce((acc, s) => acc + s.feesTotal, 0)) *
                100 || 0
            )}%
          </Text>
          <Text style={styles.statLabel}>Fees Collected</Text>
        </View>
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderStudentCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add students from the database to get started'}
            </Text>
          </View>
        }
      />

      {/* Search/Add Student Modal */}
      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Student</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchModalContent}>
              <Text style={styles.instructionText}>
                Search for existing students or create a new one
              </Text>

              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchModalInput}
                  placeholder="Enter Student Unique ID (e.g., STD001)"
                  value={searchUniqueId}
                  onChangeText={(text) => {
                    setSearchUniqueId(text);
                    searchStudentByUniqueId(text);
                  }}
                  autoCapitalize="characters"
                />
                {searching && <ActivityIndicator size="small" color={COLORS.primary} />}
              </View>

              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSearchResult}
                  style={styles.searchResultsList}
                />
              ) : searchUniqueId.length >= 3 && !searching ? (
                <View style={styles.noResultsContainer}>
                  <Icon name="alert-circle-outline" size={40} color={COLORS.textSecondary} />
                  <Text style={styles.noResultsText}>
                    No student found with this ID
                  </Text>
                </View>
              ) : null}

              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.manualAddButton}
                onPress={openCreateModal}
              >
                <Icon name="person-add" size={20} color={COLORS.primary} />
                <Text style={styles.manualAddText}>Create New Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Student Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Student</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Contact Method</Text>
              <View style={styles.contactMethodButtons}>
                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'email' && styles.contactMethodButtonActive,
                  ]}
                  onPress={() => setContactMethod('email')}
                >
                  <Icon
                    name="mail"
                    size={20}
                    color={contactMethod === 'email' ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.contactMethodText,
                      contactMethod === 'email' && styles.contactMethodTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'phone' && styles.contactMethodButtonActive,
                  ]}
                  onPress={() => setContactMethod('phone')}
                >
                  <Icon
                    name="call"
                    size={20}
                    color={contactMethod === 'phone' ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.contactMethodText,
                      contactMethod === 'phone' && styles.contactMethodTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter student name"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {contactMethod === 'email' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="student@email.com"
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter phone number"
                      value={formPhone}
                      onChangeText={setFormPhone}
                      keyboardType="phone-pad"
                    />
                    <Text style={styles.helperText}>
                      Email will be auto-generated: {formPhone}@gmail.com
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter email if available"
                      value={formEmail}
                      onChangeText={setFormEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </>
              )}

              {contactMethod === 'email' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={formPhone}
                    onChangeText={setFormPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter parent phone"
                  value={formParentPhone}
                  onChangeText={setFormParentPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Roll Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter roll number"
                  value={formRollNumber}
                  onChangeText={setFormRollNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={formDateOfBirth}
                  onChangeText={setFormDateOfBirth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter address"
                  value={formAddress}
                  onChangeText={setFormAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleCreateStudent}
                disabled={saving}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.saveButtonGradient}>
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Creating...' : 'Create Student'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Student Modal - Same as before */}
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
              <Text style={styles.modalTitle}>Edit Student</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter student name"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="student@email.com"
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={formPhone}
                  onChangeText={setFormPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter parent phone"
                  value={formParentPhone}
                  onChangeText={setFormParentPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Roll Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter roll number"
                  value={formRollNumber}
                  onChangeText={setFormRollNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={formDateOfBirth}
                  onChangeText={setFormDateOfBirth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter address"
                  value={formAddress}
                  onChangeText={setFormAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateStudent}
                disabled={saving}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.saveButtonGradient}>
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Updating...' : 'Update Student'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Student Details Modal - Same as before */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.detailsAvatar}
                  >
                    <Text style={styles.detailsAvatarText}>
                      {selectedStudent.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.detailsName}>{selectedStudent.name}</Text>
                  <Text style={styles.detailsId}>ID: {selectedStudent.uniqueId}</Text>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Personal Information</Text>
                  <View style={styles.detailRow}>
                    <Icon name="mail" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="call" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="people" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Parent Phone:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.parentPhone || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>DOB:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.dateOfBirth || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="location" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.address || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Academic Information</Text>
                  <View style={styles.detailRow}>
                    <Icon name="document-text" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Roll No:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.rollNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Enrollment:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.enrollmentDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="checkmark-circle" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Attendance:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.attendance}%</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Fee Details</Text>
                  <View style={styles.feeProgressContainer}>
                    <View style={styles.feeProgressHeader}>
                      <Text style={styles.feeAmount}>
                        ₹{selectedStudent.feesPaid.toLocaleString()} / ₹
                        {selectedStudent.feesTotal.toLocaleString()}
                      </Text>
                      <Text style={styles.feePercentage}>
                        {Math.round((selectedStudent.feesPaid / selectedStudent.feesTotal) * 100)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={['#2196f3', '#1976d2']}
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.round(
                              (selectedStudent.feesPaid / selectedStudent.feesTotal) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
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
  addButton: {
    padding: SIZES.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  searchContainer: {
    paddingHorizontal: SIZES.lg,
    marginTop: -10,
    marginBottom: SIZES.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
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
  listContainer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
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
  studentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  studentAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  studentMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  studentStats: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43a047',
  },
  studentCardActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  iconButton: {
    padding: SIZES.xs,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
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
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
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
  searchModalContent: {
    paddingHorizontal: SIZES.lg,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  searchModalInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  searchResultsList: {
    marginTop: SIZES.md,
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  searchResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchResultAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchResultId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchResultEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  orText: {
    paddingHorizontal: SIZES.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  manualAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  manualAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  formContainer: {
    paddingHorizontal: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  contactMethodButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  contactMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contactMethodButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  contactMethodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  contactMethodTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    fontStyle: 'italic',
  },
  saveButton: {
    marginVertical: SIZES.lg,
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
  detailsContainer: {
    paddingHorizontal: SIZES.lg,
  },
  detailsHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  detailsAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  detailsId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
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
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  feeProgressContainer: {
    backgroundColor: COLORS.gray50,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  feeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  feePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default StudentsScreen;