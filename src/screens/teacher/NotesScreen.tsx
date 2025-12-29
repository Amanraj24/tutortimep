// src/screens/teacher/NotesScreen.tsx
// Updated with proper file downloading and viewing functionality

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
  Linking,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES, GRADIENTS, SHADOWS } from '../../utils/colors';
import ApiService, { Note } from '../../services/api';
import axios from 'axios';

type NotesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notes'>;
type NotesScreenRouteProp = RouteProp<RootStackParamList, 'Notes'>;

interface Props {
  navigation: NotesScreenNavigationProp;
  route: NotesScreenRouteProp;
}

const NotesScreen: React.FC<Props> = ({ navigation, route }) => {
  const classId = route.params?.classId || '1';
  const className = route.params?.className || 'Class 10 - A';

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('All');

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFileType, setNoteFileType] = useState<'pdf' | 'doc' | 'ppt' | 'img' | 'link'>('pdf');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    fetchNotes();
  }, [filterSubject]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await ApiService.getNotes(
        classId === 'all' ? undefined : classId,
        filterSubject === 'All' ? undefined : filterSubject
      );
      setNotes(fetchedNotes);
    } catch (error: any) {
      console.error('Fetch notes error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch notes',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectList = await ApiService.getNoteSubjects();
      const filteredSubjects = subjectList.filter(subject => subject !== 'All');
      const uniqueSubjects = Array.from(new Set(['All', ...filteredSubjects]));
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Fetch subjects error:', error);
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 33) {
        // Android 13+ doesn't need storage permission for downloads
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

  const pickFile = async () => {
    try {
      const results = await pick({
        type: [types.pdf, types.doc, types.docx, types.ppt, types.pptx, types.images],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      if (results && results.length > 0) {
        const file = results[0];
        setSelectedFile(file);
        
        const fileName = file.name || '';
        const mimeType = file.type || '';
        
        if (mimeType?.includes('pdf') || fileName.endsWith('.pdf')) {
          setNoteFileType('pdf');
        } else if (mimeType?.includes('word') || fileName.match(/\.(doc|docx)$/i)) {
          setNoteFileType('doc');
        } else if (mimeType?.includes('presentation') || fileName.match(/\.(ppt|pptx)$/i)) {
          setNoteFileType('ppt');
        } else if (mimeType?.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
          setNoteFileType('img');
        }

        Alert.alert('File Selected', `${file.name}\nSize: ${formatFileSize(file.size || 0)}`);
      }
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file picker');
      } else {
        console.error('File picker error:', err);
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const uploadFile = async (file: any): Promise<{
    fileName: string;
    fileSize: string;
    fileUrl: string;
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.fileCopyUri || file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const token = await ApiService.getAuthToken();
      
      const response = await axios.post(
        'https://school-backend-rosy.vercel.app/api/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Upload failed');
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleAddNote = async () => {
    if (!noteTitle.trim() || !noteSubject.trim()) {
      Alert.alert('Error', 'Please fill in title and subject');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    try {
      setUploading(true);
      
      const fileData = await uploadFile(selectedFile);

      await ApiService.createNote({
        title: noteTitle,
        subject: noteSubject,
        description: noteDescription,
        fileType: noteFileType,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileUrl: fileData.fileUrl,
        classId: classId === 'all' ? undefined : classId,
      });

      Alert.alert('Success', 'Note added successfully');
      setShowAddNote(false);
      fetchNotes();
      resetForm();
    } catch (error: any) {
      console.error('Add note error:', error);
      Alert.alert('Error', error.message || 'Failed to add note');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteNote(noteId);
              Alert.alert('Success', 'Note deleted successfully');
              setShowNoteDetails(false);
              fetchNotes();
            } catch (error: any) {
              console.error('Delete note error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleShareNote = async (note: Note, method: 'whatsapp' | 'email') => {
    try {
      await ApiService.shareNote(note.id, method);
      Alert.alert('Success', `Note will be shared via ${method}`);
    } catch (error: any) {
      console.error('Share note error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to share note');
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
    // If filename has extension, use it
    if (fileName && fileName.includes('.')) {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      if (ext) return ext;
    }
    
    // Otherwise, use default extension based on file type
    switch (fileType) {
      case 'pdf': return 'pdf';
      case 'doc': return 'docx';
      case 'ppt': return 'pptx';
      case 'img': return 'jpg';
      default: return 'file';
    }
  };

  const handleViewFile = async (note: Note) => {
    try {
      if (!note.fileUrl) {
        Alert.alert('Error', 'File URL not available');
        return;
      }

      setDownloading(true);

      // Request storage permission for Android
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
        fetchNotes();
      } catch (err) {
        console.log('Failed to record view:', err);
      }

      const { dirs } = ReactNativeBlobUtil.fs;
      const extension = getFileExtension(note.fileName || 'file', note.fileType);
      const timestamp = Date.now();
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${extension}`;
      
      // Use cache directory for viewing (temporary storage)
      const downloadPath = Platform.OS === 'ios'
        ? `${dirs.CacheDir}/${fileName}`
        : `${dirs.CacheDir}/${fileName}`;

      console.log('Downloading file to:', downloadPath);

      const token = await ApiService.getAuthToken();

      // Download the file to cache
      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: downloadPath,
      }).fetch('GET', note.fileUrl, {
        'Authorization': `Bearer ${token}`,
      });

      const filePath = response.path();
      console.log('File downloaded to:', filePath);

      // Verify file exists
      const fileExists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File download failed - file not found');
      }

      setDownloading(false);

      // Open the file with the device's default app for this file type
      try {
        if (Platform.OS === 'android') {
          console.log('Opening file on Android with MIME type:', getMimeType(note.fileType));
          await ReactNativeBlobUtil.android.actionViewIntent(
            filePath,
            getMimeType(note.fileType)
          );
        } else {
          console.log('Opening file on iOS');
          await ReactNativeBlobUtil.ios.openDocument(filePath);
        }
        
        // Show success message
        setTimeout(() => {
          Alert.alert(
            'File Opened',
            `${note.fileType.toUpperCase()} file opened in default app`,
            [{ text: 'OK' }]
          );
        }, 500);
      } catch (openError: any) {
        console.error('Error opening file with native app:', openError);
        
        // If native open fails, try opening URL in browser as fallback
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

  const handleDownloadFile = async (note: Note) => {
    try {
      if (!note.fileUrl) {
        Alert.alert('Error', 'File URL not available');
        return;
      }

      setDownloading(true);

      // Request storage permission
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

      // Download the file with progress
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
      fetchNotes();

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

  const resetForm = () => {
    setNoteTitle('');
    setNoteSubject('');
    setNoteDescription('');
    setNoteFileType('pdf');
    setSelectedFile(null);
  };

  const openAddNote = () => {
    resetForm();
    setShowAddNote(true);
  };

  const openNoteDetails = (note: Note) => {
    setSelectedNote(note);
    setShowNoteDetails(true);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'document-text';
      case 'doc': return 'document';
      case 'ppt': return 'easel';
      case 'img': return 'image';
      case 'link': return 'link';
      default: return 'document';
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return ['#f44336', '#e91e63'];
      case 'doc': return ['#2196f3', '#1976d2'];
      case 'ppt': return ['#ff9800', '#f57c00'];
      case 'img': return ['#4caf50', '#388e3c'];
      case 'link': return ['#9c27b0', '#7b1fa2'];
      default: return ['#607d8b', '#455a64'];
    }
  };

  const filteredNotes = filterSubject === 'All' ? notes : notes.filter(n => n.subject === filterSubject);

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, SHADOWS.medium]}
      onPress={() => openNoteDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.noteCardContent}>
        <LinearGradient colors={getFileColor(item.fileType)} style={styles.noteIcon}>
          <Icon name={getFileIcon(item.fileType)} size={28} color={COLORS.white} />
        </LinearGradient>
        
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.noteSubject}>{item.subject}</Text>
          {item.description && (
            <Text style={styles.noteDescription} numberOfLines={2}>{item.description}</Text>
          )}
          
          <View style={styles.noteMetaContainer}>
            <View style={styles.noteMeta}>
              <Icon name="calendar-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.noteMetaText}>{item.uploadDate}</Text>
            </View>
            <View style={styles.noteMeta}>
              <Icon name="download-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.noteMetaText}>{item.downloads}</Text>
            </View>
            <View style={styles.noteMeta}>
              <Icon name="eye-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.noteMetaText}>{item.views}</Text>
            </View>
          </View>
        </View>
      </View>

      {item.fileName && (
        <View style={styles.fileInfo}>
          <Icon name="document-attach" size={14} color={COLORS.textSecondary} />
          <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
          <Text style={styles.fileSize}>{item.fileSize}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleViewFile(item);
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
            handleDownloadFile(item);
          }}
          disabled={downloading}
        >
          <Icon name="download-outline" size={18} color={downloading ? COLORS.textSecondary : '#43e97b'} />
          <Text style={[styles.quickActionText, downloading && { color: COLORS.textSecondary }]}>Download</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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
            <Text style={styles.headerTitle}>Notes & Resources</Text>
            <Text style={styles.headerSubtitle}>{className}</Text>
          </View>
          <TouchableOpacity onPress={openAddNote} style={styles.addButton}>
            <Icon name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="document-text" size={24} color="#667eea" />
          <Text style={styles.statNumber}>{notes.length}</Text>
          <Text style={styles.statLabel}>Total Notes</Text>
        </View>
        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="download" size={24} color="#43e97b" />
          <Text style={styles.statNumber}>{notes.reduce((sum, n) => sum + n.downloads, 0)}</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
        <View style={[styles.statCard, SHADOWS.small]}>
          <Icon name="eye" size={24} color="#2196f3" />
          <Text style={styles.statNumber}>{notes.reduce((sum, n) => sum + n.views, 0)}</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>

      {/* Subject Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={{paddingRight: 20}}
      >
        {subjects.map((subject, index) => (
          <TouchableOpacity
            key={`subject-${subject}-${index}`}
            style={[styles.filterChip, filterSubject === subject && styles.filterChipActive]}
            onPress={() => setFilterSubject(subject)}
          >
            <Text style={[styles.filterText, filterSubject === subject && styles.filterTextActive]}>
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={renderNote}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No notes available</Text>
            <Text style={styles.emptySubtext}>Add notes to share with students</Text>
          </View>
        }
      />

      {/* Add Note Modal */}
      <Modal 
        visible={showAddNote} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setShowAddNote(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Note</Text>
              <TouchableOpacity onPress={() => setShowAddNote(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter note title" 
                  value={noteTitle} 
                  onChangeText={setNoteTitle} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g., Mathematics, Science" 
                  value={noteSubject} 
                  onChangeText={setNoteSubject} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter description (optional)"
                  value={noteDescription}
                  onChangeText={setNoteDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>File Type</Text>
                <View style={styles.fileTypeButtons}>
                  {[
                    { type: 'pdf', label: 'PDF', icon: 'document-text' },
                    { type: 'doc', label: 'DOC', icon: 'document' },
                    { type: 'ppt', label: 'PPT', icon: 'easel' },
                    { type: 'img', label: 'Image', icon: 'image' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.fileTypeButton,
                        noteFileType === item.type && styles.fileTypeButtonActive,
                      ]}
                      onPress={() => setNoteFileType(item.type as any)}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        color={noteFileType === item.type ? COLORS.primary : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.fileTypeText,
                          noteFileType === item.type && styles.fileTypeTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                <Icon name="cloud-upload-outline" size={20} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>
                  {selectedFile ? selectedFile.name : 'Choose File to Upload'}
                </Text>
              </TouchableOpacity>

              {selectedFile && (
                <View style={styles.selectedFileInfo}>
                  <Icon name="checkmark-circle" size={20} color="#4caf50" />
                  <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size || 0)}
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleAddNote} 
                disabled={uploading}
              >
                <LinearGradient colors={GRADIENTS.primary} style={styles.submitButtonGradient}>
                  {uploading ? (
                    <>
                      <ActivityIndicator color={COLORS.white} size="small" />
                      <Text style={styles.submitButtonText}>Uploading...</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="checkmark-circle" size={24} color={COLORS.white} />
                      <Text style={styles.submitButtonText}>Add Note</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Note Details Modal */}
      <Modal 
        visible={showNoteDetails} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setShowNoteDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Note Details</Text>
              <TouchableOpacity onPress={() => setShowNoteDetails(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedNote && (
              <ScrollView style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <LinearGradient 
                    colors={getFileColor(selectedNote.fileType)} 
                    style={styles.detailsIcon}
                  >
                    <Icon name={getFileIcon(selectedNote.fileType)} size={40} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={styles.detailsTitle}>{selectedNote.title}</Text>
                  <View style={styles.detailsSubjectBadge}>
                    <Text style={styles.detailsSubject}>{selectedNote.subject}</Text>
                  </View>
                </View>

                {selectedNote.description && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Description</Text>
                    <Text style={styles.detailsDescription}>{selectedNote.description}</Text>
                  </View>
                )}

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>File Information</Text>
                  <View style={styles.detailsRow}>
                    <Icon name="document-attach" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailsLabel}>File Name:</Text>
                    <Text style={styles.detailsValue}>{selectedNote.fileName}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Icon name="cube" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailsLabel}>File Size:</Text>
                    <Text style={styles.detailsValue}>{selectedNote.fileSize}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Icon name="stats-chart" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailsLabel}>Downloads:</Text>
                    <Text style={styles.detailsValue}>{selectedNote.downloads}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Icon name="eye" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailsLabel}>Views:</Text>
                    <Text style={styles.detailsValue}>{selectedNote.views}</Text>
                  </View>
                </View>

                {/* Primary Actions - View and Download */}
                <View style={styles.primaryActions}>
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => handleViewFile(selectedNote)}
                    disabled={downloading}
                  >
                    <LinearGradient 
                      colors={downloading ? ['#ccc', '#aaa'] : ['#667eea', '#764ba2']} 
                      style={styles.primaryActionGradient}
                    >
                      <Icon name="eye" size={24} color={COLORS.white} />
                      <Text style={styles.primaryActionText}>View File</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => handleDownloadFile(selectedNote)}
                    disabled={downloading}
                  >
                    <LinearGradient 
                      colors={downloading ? ['#ccc', '#aaa'] : ['#43e97b', '#38f9d7']} 
                      style={styles.primaryActionGradient}
                    >
                      <Icon name="download" size={24} color={COLORS.white} />
                      <Text style={styles.primaryActionText}>Download</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Secondary Actions */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#e3f2fd' }]}
                    onPress={() => {
                      Alert.alert('Share Note', 'Choose sharing method', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'WhatsApp', onPress: () => handleShareNote(selectedNote, 'whatsapp') },
                        { text: 'Email', onPress: () => handleShareNote(selectedNote, 'email') },
                      ]);
                    }}
                  >
                    <Icon name="share-social" size={20} color="#2196f3" />
                    <Text style={[styles.actionButtonText, { color: '#2196f3' }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ffebee' }]}
                    onPress={() => handleDeleteNote(selectedNote.id)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.textSecondary },
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
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: SIZES.lg },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: SIZES.xs },
  headerTextContainer: { flex: 1, marginLeft: SIZES.md },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: COLORS.white, opacity: 0.9, marginTop: 2 },
  addButton: { padding: SIZES.sm, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: SIZES.lg, marginTop: -10, marginBottom: SIZES.md, gap: SIZES.sm },
  statCard: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.md, borderRadius: SIZES.radiusMd, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: SIZES.xs },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  filterContainer: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.md, maxHeight: 45 },
  filterChip: { paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: 20, backgroundColor: COLORS.gray50, marginRight: SIZES.sm, maxHeight: 40 },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: COLORS.white, fontWeight: '600' },
  listContainer: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xl },
  noteCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg, padding: SIZES.md, marginBottom: SIZES.md },
  noteCardContent: { flexDirection: 'row', marginBottom: SIZES.sm },
  noteIcon: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  noteInfo: { flex: 1 },
  noteTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  noteSubject: { fontSize: 13, color: COLORS.primary, fontWeight: '500', marginBottom: 4 },
  noteDescription: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  noteMetaContainer: { flexDirection: 'row', gap: SIZES.md },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteMetaText: { fontSize: 12, color: COLORS.textSecondary },
  fileInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, padding: SIZES.sm, borderRadius: SIZES.radiusSm, gap: 6, marginBottom: SIZES.sm },
  fileName: { flex: 1, fontSize: 12, color: COLORS.textPrimary },
  fileSize: { fontSize: 11, color: COLORS.textSecondary },
  quickActions: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.xs },
  quickActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.sm, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.gray50, gap: 6, borderWidth: 1, borderColor: COLORS.gray100 },
  quickActionText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.xl * 2 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: SIZES.md },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: SIZES.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: SIZES.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  formContainer: { paddingHorizontal: SIZES.lg },
  inputGroup: { marginBottom: SIZES.md },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SIZES.xs },
  input: { backgroundColor: COLORS.gray50, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, fontSize: 16, borderWidth: 1, borderColor: COLORS.gray100 },
  textArea: { height: 80, textAlignVertical: 'top' },
  fileTypeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  fileTypeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.gray50, gap: 6, borderWidth: 2, borderColor: 'transparent' },
  fileTypeButtonActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  fileTypeText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  fileTypeTextActive: { color: COLORS.primary, fontWeight: '600' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray50, paddingVertical: SIZES.md, borderRadius: SIZES.radiusMd, gap: SIZES.sm, marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.gray100, borderStyle: 'dashed' },
  uploadButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary, flex: 1, textAlign: 'center' },
  selectedFileInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: SIZES.md, borderRadius: SIZES.radiusMd, marginBottom: SIZES.md, gap: SIZES.sm },
  selectedFileName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  selectedFileSize: { fontSize: 12, color: COLORS.textSecondary },
  submitButton: { marginBottom: SIZES.lg },
  submitButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.md, borderRadius: SIZES.radiusLg, gap: SIZES.sm },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  detailsContainer: { paddingHorizontal: SIZES.lg },
  detailsHeader: { alignItems: 'center', paddingVertical: SIZES.lg },
  detailsIcon: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.md },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: SIZES.sm },
  detailsSubjectBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: SIZES.md, paddingVertical: 6, borderRadius: 16 },
  detailsSubject: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  detailsSection: { marginBottom: SIZES.lg },
  detailsSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SIZES.md },
  detailsDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.sm, gap: SIZES.sm },
  detailsLabel: { fontSize: 14, color: COLORS.textSecondary, width: 100 },
  detailsValue: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  primaryActions: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.md },
  primaryActionButton: { flex: 1, borderRadius: SIZES.radiusLg, overflow: 'hidden' },
  primaryActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.md, gap: SIZES.sm },
  primaryActionText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
  actionButtons: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.xl },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.md, borderRadius: SIZES.radiusMd, gap: SIZES.xs },
  actionButtonText: { fontSize: 15, fontWeight: '600' },
});

export default NotesScreen;