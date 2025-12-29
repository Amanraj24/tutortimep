// src/screens/student/StudentNotesScreen.tsx
// Updated with view and download functionality

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
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService, { StudentNote } from '../../services/api';

type StudentNotesNavigationProp = StackNavigationProp<RootStackParamList, 'StudentNotes'>;
type StudentNotesRouteProp = RouteProp<RootStackParamList, 'StudentNotes'>;

interface Props {
  navigation: StudentNotesNavigationProp;
  route: StudentNotesRouteProp;
}

const StudentNotesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<StudentNote[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedSubject === 'all') {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(notes.filter(note => note.subject === selectedSubject));
    }
  }, [selectedSubject, notes]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getStudentNotes(classId);
      setNotes(data);
      
      const uniqueSubjects = Array.from(new Set(data.map(note => note.subject)));
      setSubjects(uniqueSubjects);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadNotes().finally(() => setRefreshing(false));
  }, []);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 33) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getMimeType = (fileType: string): string => {
    switch (fileType) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'ppt': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'img': return 'image/*';
      default: return '*/*';
    }
  };

  const getFileExtension = (fileName: string, fileType: string): string => {
    if (fileName && fileName.includes('.')) {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (ext) return ext;
    }
    
    switch (fileType) {
      case 'pdf': return 'pdf';
      case 'doc': return 'docx';
      case 'ppt': return 'pptx';
      case 'img': return 'jpg';
      default: return 'file';
    }
  };

  const handleViewFile = async (note: StudentNote) => {
    try {
      if (!note.fileUrl) {
        Alert.alert('Error', 'File URL not available');
        return;
      }

      setDownloading(true);

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Storage permission is required to view files');
          setDownloading(false);
          return;
        }
      }

      // Record view
      try {
        await ApiService.recordNoteView(note.id);
        loadNotes();
      } catch (err) {
        console.log('Failed to record view:', err);
      }

      const { dirs } = ReactNativeBlobUtil.fs;
      const extension = getFileExtension(note.fileName || 'file', note.fileType);
      const timestamp = Date.now();
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${extension}`;
      
      const downloadPath = Platform.OS === 'ios'
        ? `${dirs.CacheDir}/${fileName}`
        : `${dirs.CacheDir}/${fileName}`;

      const token = await ApiService.getAuthToken();

      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: downloadPath,
      }).fetch('GET', note.fileUrl, {
        'Authorization': `Bearer ${token}`,
      });

      const filePath = response.path();

      const fileExists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File download failed - file not found');
      }

      setDownloading(false);

      try {
        if (Platform.OS === 'android') {
          await ReactNativeBlobUtil.android.actionViewIntent(
            filePath,
            getMimeType(note.fileType)
          );
        } else {
          await ReactNativeBlobUtil.ios.openDocument(filePath);
        }
        
        setTimeout(() => {
          Alert.alert(
            'File Opened',
            `${note.fileType.toUpperCase()} file opened in default app`,
            [{ text: 'OK' }]
          );
        }, 500);
      } catch (openError: any) {
        console.error('Error opening file with native app:', openError);
        
        try {
          const supported = await Linking.canOpenURL(note.fileUrl);
          if (supported) {
            await Linking.openURL(note.fileUrl);
            Alert.alert('Opened in Browser', 'File opened in your default browser');
          } else {
            throw new Error('Cannot open file');
          }
        } catch (browserError) {
          Alert.alert(
            'Cannot Open File',
            'No app found to open this file type. Would you like to download it instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Download', onPress: () => handleDownloadFile(note) },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('View file error:', error);
      setDownloading(false);
      Alert.alert(
        'Error',
        error.message || 'Failed to open file. Would you like to download it instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: () => handleDownloadFile(note) },
        ]
      );
    }
  };

  const handleDownloadFile = async (note: StudentNote) => {
    try {
      if (!note.fileUrl) {
        Alert.alert('Error', 'File URL not available');
        return;
      }

      setDownloading(true);

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files');
        setDownloading(false);
        return;
      }

      const { dirs } = ReactNativeBlobUtil.fs;
      const extension = getFileExtension(note.fileName || 'file', note.fileType);
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
      const downloadPath = Platform.OS === 'ios'
        ? `${dirs.DocumentDir}/${fileName}`
        : `${dirs.DownloadDir}/${fileName}`;

      const token = await ApiService.getAuthToken();

      await ReactNativeBlobUtil.config({
        fileCache: true,
        path: downloadPath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading file',
          path: downloadPath,
          mime: getMimeType(note.fileType),
        },
      })
      .fetch('GET', note.fileUrl, {
        'Authorization': `Bearer ${token}`,
      })
      .progress((received: string, total: string) => {
        const receivedNum = parseInt(received, 10);
        const totalNum = parseInt(total, 10);
        const percentage = Math.floor((receivedNum / totalNum) * 100);
        console.log('Download progress:', percentage + '%');
      });

      // Record download
      await ApiService.recordNoteDownload(note.id);
      loadNotes();

      setDownloading(false);
      
      Alert.alert(
        'Download Complete',
        `File saved to: ${Platform.OS === 'ios' ? 'Documents' : 'Downloads'}`,
        [
          { text: 'OK' },
          {
            text: 'Open',
            onPress: async () => {
              try {
                if (Platform.OS === 'android') {
                  await ReactNativeBlobUtil.android.actionViewIntent(downloadPath, getMimeType(note.fileType));
                } else {
                  await ReactNativeBlobUtil.ios.openDocument(downloadPath);
                }
              } catch (err) {
                console.error('Open file error:', err);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Download error:', error);
      setDownloading(false);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleNotePress = (note: StudentNote) => {
    if (!note.fileUrl) {
      Alert.alert('No File', 'This note does not have an attached file');
      return;
    }

    Alert.alert(
      note.title,
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View',
          onPress: () => handleViewFile(note),
        },
        {
          text: 'Download',
          onPress: () => handleDownloadFile(note),
        },
      ]
    );
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'document-text';
      case 'doc':
        return 'document';
      case 'ppt':
        return 'easel';
      case 'img':
        return 'image';
      case 'link':
        return 'link';
      default:
        return 'document';
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return ['#f44336', '#e91e63'];
      case 'doc':
        return ['#2196f3', '#1976d2'];
      case 'ppt':
        return ['#ff9800', '#f57c00'];
      case 'img':
        return ['#9c27b0', '#7b1fa2'];
      case 'link':
        return ['#00bcd4', '#0097a7'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Loading Overlay */}
      {downloading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingOverlayText}>Processing file...</Text>
          </View>
        </View>
      )}

      {/* Header */}
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notes</Text>
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
        {/* Subject Filter */}
        {subjects.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedSubject === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedSubject('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedSubject === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All Subjects
                </Text>
              </TouchableOpacity>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.filterButton,
                    selectedSubject === subject && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedSubject === subject && styles.filterButtonTextActive,
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Notes List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Study Materials ({filteredNotes.length})
          </Text>

          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, SHADOWS.small]}
                activeOpacity={0.7}
                onPress={() => handleNotePress(note)}
              >
                <View style={styles.noteHeader}>
                  <LinearGradient
                    colors={getFileTypeColor(note.fileType)}
                    style={styles.noteIcon}
                  >
                    <Icon
                      name={getFileTypeIcon(note.fileType)}
                      size={24}
                      color={COLORS.white}
                    />
                  </LinearGradient>
                  <View style={styles.noteHeaderText}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <View style={styles.noteMetaRow}>
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectBadgeText}>{note.subject}</Text>
                      </View>
                      <Text style={styles.noteDate}>{note.uploadDate}</Text>
                    </View>
                  </View>
                </View>

                {note.description && (
                  <Text style={styles.noteDescription} numberOfLines={2}>
                    {note.description}
                  </Text>
                )}

                <View style={styles.noteFooter}>
                  <View style={styles.noteStats}>
                    <View style={styles.noteStat}>
                      <Icon name="eye" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.noteStatText}>{note.views} views</Text>
                    </View>
                    <View style={styles.noteStat}>
                      <Icon name="download" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.noteStatText}>
                        {note.downloads} downloads
                      </Text>
                    </View>
                  </View>

                  {note.fileSize && (
                    <View style={styles.fileSizeBadge}>
                      <Icon name="document" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.fileSizeText}>{note.fileSize}</Text>
                    </View>
                  )}
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewFile(note);
                    }}
                    disabled={downloading}
                  >
                    <Icon name="eye-outline" size={18} color={downloading ? COLORS.textSecondary : COLORS.primary} />
                    <Text style={[styles.quickActionText, downloading && { color: COLORS.textSecondary }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(note);
                    }}
                    disabled={downloading}
                  >
                    <Icon name="download-outline" size={18} color={downloading ? COLORS.textSecondary : '#43e97b'} />
                    <Text style={[styles.quickActionText, downloading && { color: COLORS.textSecondary }]}>Download</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.uploadedBy}>
                  <Icon name="person" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.uploadedByText}>
                    Uploaded by {note.uploadedBy}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="document-text-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Notes Found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedSubject === 'all'
                  ? 'No study materials available yet'
                  : `No notes found for ${selectedSubject}`}
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
  loadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    gap: 15,
  },
  loadingOverlayText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  filterContainer: {
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  filterButton: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  filterButtonTextActive: {
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
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  noteHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.sm,
  },
  noteIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  noteHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  noteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: SIZES.sm,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976d2',
  },
  noteDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noteDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    marginBottom: SIZES.sm,
  },
  noteStats: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  noteStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  fileSizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fileSizeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  quickActions: { 
    flexDirection: 'row', 
    gap: SIZES.sm, 
    marginBottom: SIZES.sm,
  },
  quickActionButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: SIZES.sm, 
    borderRadius: SIZES.radiusMd, 
    backgroundColor: COLORS.gray50, 
    gap: 6, 
    borderWidth: 1, 
    borderColor: COLORS.gray100,
  },
  quickActionText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: COLORS.textPrimary,
  },
  uploadedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  uploadedByText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontStyle: 'italic',
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

export default StudentNotesScreen;