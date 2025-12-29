// src/services/api.ts
// ==============================================
// Complete API Service for School Management System

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://school-backend-rosy.vercel.app/api'; // Production
// const API_URL = 'http://localhost:3000/api'; // Development

// ==================== TYPES ====================

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'teacher' | 'student';
  uniqueId: string;
}

export interface ClassData {
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

export interface Activity {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: string[];
}

export interface Student {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  address: string;
  rollNumber: string;
  dateOfBirth: string;
  enrollmentDate: string;
  classId: string;
  className: string;
  feesPaid: number;
  feesTotal: number;
  feesPending: number;
  attendance: number;
}

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate: string;
  status: 'paid' | 'partial' | 'pending';
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: string;
  receiptNo: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | null;
}

export interface AttendanceHistory {
  id: string;
  date: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'img' | 'link';
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadDate: string;
  downloads: number;
  views: number;
  className?: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  testDate: string;
  maxMarks: number;
  durationMinutes: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  className: string;
  classId: string;
  submittedCount: number;
  totalStudents: number;
  createdAt: string;
}

export interface TestResult {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
  submittedAt: string;
}

export interface TeacherProfile {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  address: string;
  rollNumber: string;
  dateOfBirth: string;
  createdAt: string;
}

export interface StudentClass {
  classId: string;
  teacherId: string;
  className: string;
  section: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  enrollmentDate: string;
  attendance: {
    totalDays: number;
    presentDays: number;
    percentage: number;
  };
  fees: {
    total: number;
    paid: number;
    pending: number;
    status: string;
    lastPaymentDate: string | null;
  };
  upcomingTests: number;
}

export interface StudentAttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  markedAt: string | null;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export interface StudentFeeSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  lastPaymentDate: string | null;
}

export interface FeePayment {
  id: string;
  amount: number;
  paymentMethod: string;
  receiptNo: string;
  paymentDate: string;
  createdAt: string;
}

export interface StudentNote {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  downloads: number;
  views: number;
  uploadedBy: string;
  uploadDate: string;
}

export interface StudentTest {
  id: string;
  title: string;
  subject: string;
  description: string;
  testDate: string;
  maxMarks: number;
  durationMinutes: number;
  status: string;
  createdAt: string;
  result: {
    marksObtained: number;
    grade: string;
    remarks: string;
    submittedAt: string | null;
    percentage: number;
  } | null;
}

// ==================== API SERVICE CLASS ====================

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Disable caching
    this.api.defaults.headers.common['Cache-Control'] = 'no-cache';
  }

  // ==================== AUTH METHODS ====================

  async login(email: string, password: string, userType: 'teacher' | 'student'): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', { email, password, userType });
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(name: string, email: string, password: string, userType: 'teacher' | 'student'): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', { name, email, password, userType });
    return response.data;
  }

  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/verify-otp', { email, otp });
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['token', 'user']);
  }

  // ==================== TEACHER PROFILE METHODS ====================

  async getTeacherProfile(): Promise<TeacherProfile> {
    const response = await this.api.get<{ data: TeacherProfile }>('/teacher/profile');
    return response.data.data;
  }

  async updateTeacherProfile(profileData: {
    name: string;
    phone: string;
    address: string;
  }): Promise<void> {
    await this.api.put('/teacher/profile', profileData);
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, name: profileData.name };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/teacher/profile/password', {
      currentPassword,
      newPassword
    });
  }

  // ==================== CLASSES METHODS ====================

  async getClasses(): Promise<ClassData[]> {
    const response = await this.api.get<{ data: ClassData[] }>('/teacher/classes');
    return response.data.data;
  }

  async createClass(classData: {
    name: string;
    section: string;
    totalStudents: number;
    feesTotal: number;
  }): Promise<{ id: string }> {
    const response = await this.api.post<{ data: { id: string } }>('/teacher/classes', classData);
    return response.data.data;
  }

  async updateClass(id: string, classData: {
    name: string;
    section: string;
    totalStudents: number;
    feesTotal: number;
  }): Promise<void> {
    await this.api.put('/teacher/classes', { id, ...classData });
  }

  async deleteClass(id: string): Promise<void> {
    await this.api.delete('/teacher/classes', { data: { id } });
  }

  // ==================== STUDENTS METHODS ====================

  async getStudents(classId?: string): Promise<Student[]> {
    const params = classId ? { classId } : {};
    const response = await this.api.get<{ data: Student[] }>('/teacher/students', { params });
    return response.data.data;
  }

  async searchStudents(uniqueId: string): Promise<Student[]> {
    const response = await this.api.get<{ data: Student[] }>('/teacher/students/search', {
      params: { uniqueId }
    });
    return response.data.data;
  }

  async addExistingStudent(studentUniqueId: string, classId: string): Promise<{
    id: string;
    uniqueId: string;
    name: string;
  }> {
    const response = await this.api.post<{ data: any }>('/teacher/students', { 
      studentUniqueId, 
      classId 
    });
    return response.data.data;
  }

  async createStudent(classId: string, studentData: {
    name: string;
    email?: string;
    phone?: string;
    parentPhone?: string;
    address?: string;
    rollNumber: string;
    dateOfBirth?: string;
  }): Promise<{ id: string; uniqueId: string; name: string }> {
    const response = await this.api.post<{ data: any }>('/teacher/students', {
      classId,
      createNew: true,
      studentData
    });
    return response.data.data;
  }

  async updateStudent(studentId: string, studentData: {
    name: string;
    email: string;
    phone: string;
    parentPhone: string;
    address: string;
    rollNumber: string;
    dateOfBirth: string;
  }): Promise<void> {
    await this.api.put('/teacher/students', { studentId, studentData });
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<void> {
    await this.api.delete('/teacher/students', { data: { studentId, classId } });
  }

  // ==================== ATTENDANCE METHODS ====================

  async getAttendance(classId: string, date?: string): Promise<{
    date: string;
    students: AttendanceRecord[];
  }> {
    const params: any = { classId };
    if (date) params.date = date;
    
    const response = await this.api.get<{ data: any }>('/teacher/attendance', { params });
    return response.data.data;
  }

  async saveAttendance(classId: string, date: string, attendanceData: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late';
  }>): Promise<{
    presentCount: number;
    absentCount: number;
    lateCount: number;
  }> {
    const response = await this.api.post<{ data: any }>('/teacher/attendance', {
      classId,
      date,
      attendanceData
    });
    return response.data.data;
  }

  async getAttendanceHistory(classId: string, limit?: number): Promise<AttendanceHistory[]> {
    const params: any = { classId };
    if (limit) params.limit = limit.toString();
    
    const response = await this.api.get<{ data: AttendanceHistory[] }>('/teacher/attendance/history', { params });
    return response.data.data;
  }

  async getAttendanceStats(classId: string, period?: number): Promise<Array<{
    id: string;
    name: string;
    rollNumber: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
  }>> {
    const params: any = { classId };
    if (period) params.period = period.toString();
    
    const response = await this.api.get<{ data: any[] }>('/teacher/attendance/stats', { params });
    return response.data.data;
  }

  // ==================== FEES METHODS ====================

  async getFees(classId: string, status?: string): Promise<StudentFee[]> {
    const params: any = { classId };
    if (status) params.status = status;
    
    const response = await this.api.get<{ data: StudentFee[] }>('/teacher/fees', { params });
    return response.data.data;
  }

  async addPayment(
    studentId: string, 
    classId: string, 
    amount: number, 
    paymentMethod?: string, 
    receiptNo?: string
  ): Promise<{
    receiptNo: string;
    amount: number;
  }> {
    const response = await this.api.post<{ data: any }>('/teacher/fees', {
      studentId,
      classId,
      amount,
      paymentMethod,
      receiptNo
    });
    return response.data.data;
  }

  async updatePayment(
    paymentId: string,
    amount: number,
    paymentMethod: string,
    receiptNo: string
  ): Promise<void> {
    await this.api.put(`/teacher/fees/${paymentId}`, {
      amount,
      paymentMethod,
      receiptNo
    });
  }

  async deletePayment(paymentId: string): Promise<void> {
    await this.api.delete(`/teacher/fees/${paymentId}`);
  }

  async updateTotalFees(
    studentId: string,
    classId: string,
    totalFees: number
  ): Promise<void> {
    await this.api.put('/teacher/fees', {
      studentId,
      classId,
      totalFees
    });
  }

  async getPaymentHistory(classId?: string, limit?: number): Promise<Payment[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    if (limit) params.limit = limit.toString();
    
    const response = await this.api.get<{ data: Payment[] }>('/teacher/fees/payments', { params });
    return response.data.data;
  }

  async getFeeStats(classId: string): Promise<{
    totalStudents: number;
    totalFeesAmount: number;
    totalCollected: number;
    totalPending: number;
    collectionRate: number;
    paidStudents: number;
    partialStudents: number;
    pendingStudents: number;
  }> {
    const response = await this.api.get<{ data: any }>('/teacher/fees/stats', {
      params: { classId }
    });
    return response.data.data;
  }

  async sendFeeReminder(studentId: string, classId: string, reminderType: 'sms' | 'email'): Promise<void> {
    await this.api.post('/teacher/fees/remind', { studentId, classId, reminderType });
  }

  // ==================== NOTES METHODS ====================

  async getNotes(classId?: string, subject?: string): Promise<Note[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    if (subject) params.subject = subject;
    
    const response = await this.api.get<{ data: Note[] }>('/teacher/notes', { params });
    return response.data.data;
  }

  async createNote(noteData: {
    title: string;
    subject: string;
    description: string;
    fileType: 'pdf' | 'doc' | 'ppt' | 'img' | 'link';
    fileName?: string;
    fileSize?: string;
    fileUrl?: string;
    classId?: string;
  }): Promise<{ id: string }> {
    const response = await this.api.post<{ data: { id: string } }>('/teacher/notes', noteData);
    return response.data.data;
  }

  async updateNote(id: string, noteData: {
    title: string;
    subject: string;
    description: string;
    fileType: 'pdf' | 'doc' | 'ppt' | 'img' | 'link';
    fileName?: string;
    fileSize?: string;
    fileUrl?: string;
  }): Promise<void> {
    await this.api.put('/teacher/notes', { id, ...noteData });
  }

  async deleteNote(id: string): Promise<void> {
    await this.api.delete('/teacher/notes', { data: { id } });
  }

  async recordNoteView(id: string): Promise<void> {
    await this.api.post(`/teacher/notes/${id}/view`);
  }

  async recordNoteDownload(id: string): Promise<void> {
    await this.api.post(`/teacher/notes/${id}/download`);
  }

  async getNoteSubjects(): Promise<string[]> {
    const response = await this.api.get<{ data: string[] }>('/teacher/notes/subjects');
    return response.data.data;
  }

  async shareNote(noteId: string, shareMethod: 'whatsapp' | 'email'): Promise<void> {
    await this.api.post('/teacher/notes/share', { noteId, shareMethod });
  }

  // ==================== TESTS METHODS ====================

  async getTests(classId?: string, status?: string): Promise<Test[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    if (status) params.status = status;
    
    const response = await this.api.get<{ data: Test[] }>('/teacher/tests', { params });
    return response.data.data;
  }

  async createTest(testData: {
    title: string;
    subject: string;
    description: string;
    testDate: string;
    maxMarks: number;
    durationMinutes: number;
    classId: string;
  }): Promise<{ id: string }> {
    const response = await this.api.post<{ data: { id: string } }>('/teacher/tests', testData);
    return response.data.data;
  }

  async updateTest(id: string, testData: {
    title: string;
    subject: string;
    description: string;
    testDate: string;
    maxMarks: number;
    durationMinutes: number;
    status: string;
  }): Promise<void> {
    await this.api.put('/teacher/tests', { id, ...testData });
  }

  async deleteTest(id: string): Promise<void> {
    await this.api.delete('/teacher/tests', { data: { id } });
  }

  async getTestResults(testId: string): Promise<TestResult[]> {
    const response = await this.api.get<{ data: TestResult[] }>(`/teacher/tests/${testId}/results`);
    return response.data.data;
  }

  async saveTestResult(
    testId: string, 
    studentId: string, 
    marksObtained: number, 
    grade?: string, 
    remarks?: string
  ): Promise<void> {
    await this.api.post(`/teacher/tests/${testId}/results`, {
      studentId,
      marksObtained,
      grade,
      remarks
    });
  }

  // ==================== REPORTS METHODS ====================

  async getReports(classId: string, reportType?: string, period?: number): Promise<any> {
    const params: any = { classId };
    if (reportType) params.reportType = reportType;
    if (period) params.period = period.toString();
    
    const response = await this.api.get<{ data: any }>('/teacher/reports', { params });
    return response.data.data;
  }

  // ==================== STUDENT APP METHODS ====================

  async getStudentDashboard(): Promise<StudentClass[]> {
    const response = await this.api.get<{ data: StudentClass[] }>('/student/dashboard');
    return response.data.data;
  }

  async getStudentAttendance(classId: string, period?: number): Promise<{
    records: StudentAttendanceRecord[];
    summary: AttendanceSummary;
  }> {
    const params: any = { classId };
    if (period) params.period = period.toString();
    
    const response = await this.api.get<{ data: any }>('/student/attendance', { params });
    return response.data.data;
  }

  async getStudentFees(classId: string): Promise<{
    summary: StudentFeeSummary;
    payments: FeePayment[];
  }> {
    const response = await this.api.get<{ data: any }>('/student/fees', {
      params: { classId }
    });
    return response.data.data;
  }

  async getStudentNotes(classId: string, subject?: string): Promise<StudentNote[]> {
    const params: any = { classId };
    if (subject) params.subject = subject;
    
    const response = await this.api.get<{ data: StudentNote[] }>('/student/notes', { params });
    return response.data.data;
  }

  async getStudentTests(classId: string, status?: string): Promise<StudentTest[]> {
    const params: any = { classId };
    if (status) params.status = status;
    
    const response = await this.api.get<{ data: StudentTest[] }>('/student/tests', { params });
    return response.data.data;
  }

  async getStudentProfile(): Promise<StudentProfile> {
    const response = await this.api.get<{ data: StudentProfile }>('/student/profile');
    return response.data.data;
  }

  async updateStudentProfile(profileData: {
    name: string;
    phone: string;
    parentPhone: string;
    address: string;
  }): Promise<void> {
    await this.api.put('/student/profile', profileData);
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, name: profileData.name };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  async changeStudentPassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/student/profile/password', {
      currentPassword,
      newPassword
    });
  }

  async getTeachers(): Promise<any[]> {
    const response = await this.api.get<{ data: any[] }>('/student/teachers');
    return response.data.data;
  }

  // ==================== UTILITY METHODS ====================

  async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  }

  async updateUserProfile(userData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    const response = await this.api.put('/profile', userData);
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }
}

// Export singleton instance
export default new ApiService();