// // Install required packages first:
// // npm install react-native-pdf
// // npm install react-native-webview
// // npm install react-native-fs

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Modal,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Pdf from 'react-native-pdf';
// import { WebView } from 'react-native-webview';
// import RNFS from 'react-native-fs';
// import { COLORS, SIZES } from '../utils/colors';

// interface DocumentViewerProps {
//   visible: boolean;
//   fileUrl: string;
//   fileType: 'pdf' | 'doc' | 'ppt' | 'img' | 'link';
//   fileName: string;
//   onClose: () => void;
//   onDownload?: () => void;
// }

// const DocumentViewer: React.FC<DocumentViewerProps> = ({
//   visible,
//   fileUrl,
//   fileType,
//   fileName,
//   onClose,
//   onDownload,
// }) => {
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);

//   const handleDownload = async () => {
//     try {
//       setDownloading(true);
      
//       // Create download path
//       const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      
//       // Download file
//       const download = RNFS.downloadFile({
//         fromUrl: fileUrl,
//         toFile: downloadDest,
//       });

//       const result = await download.promise;

//       if (result.statusCode === 200) {
//         Alert.alert(
//           'Download Complete',
//           `File saved to Downloads folder`,
//           [{ text: 'OK' }]
//         );
//         onDownload?.();
//       } else {
//         throw new Error('Download failed');
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       Alert.alert('Error', 'Failed to download file');
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleOpenExternal = () => {
//     Linking.openURL(fileUrl).catch(() => {
//       Alert.alert('Error', 'Cannot open this file type');
//     });
//   };

//   const renderContent = () => {
//     if (fileType === 'pdf') {
//       return (
//         <Pdf
//           source={{ uri: fileUrl }}
//           style={styles.pdf}
//           onLoadComplete={() => setLoading(false)}
//           onError={(error) => {
//             console.error('PDF error:', error);
//             setLoading(false);
//             Alert.alert('Error', 'Failed to load PDF');
//           }}
//           trustAllCerts={false}
//         />
//       );
//     }

//     if (fileType === 'img') {
//       return (
//         <WebView
//           source={{ uri: fileUrl }}
//           style={styles.webview}
//           onLoadEnd={() => setLoading(false)}
//           onError={() => {
//             setLoading(false);
//             Alert.alert('Error', 'Failed to load image');
//           }}
//         />
//       );
//     }

//     // For DOC, PPT, and other types - use Google Docs Viewer
//     const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    
//     return (
//       <WebView
//         source={{ uri: googleDocsUrl }}
//         style={styles.webview}
//         onLoadEnd={() => setLoading(false)}
//         onError={() => {
//           setLoading(false);
//           Alert.alert('Error', 'Failed to load document');
//         }}
//       />
//     );
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.headerButton}>
//             <Icon name="close" size={24} color={COLORS.textPrimary} />
//           </TouchableOpacity>
          
//           <View style={styles.headerTitle}>
//             <Text style={styles.fileName} numberOfLines={1}>
//               {fileName}
//             </Text>
//           </View>

//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               onPress={handleDownload}
//               style={styles.headerButton}
//               disabled={downloading}
//             >
//               {downloading ? (
//                 <ActivityIndicator size="small" color={COLORS.primary} />
//               ) : (
//                 <Icon name="download-outline" size={24} color={COLORS.primary} />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleOpenExternal}
//               style={styles.headerButton}
//             >
//               <Icon name="open-outline" size={24} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Document Content */}
//         <View style={styles.content}>
//           {loading && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Loading document...</Text>
//             </View>
//           )}
//           {renderContent()}
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: SIZES.md,
//     paddingVertical: SIZES.md,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//     backgroundColor: COLORS.white,
//   },
//   headerButton: {
//     padding: SIZES.xs,
//   },
//   headerTitle: {
//     flex: 1,
//     marginHorizontal: SIZES.md,
//   },
//   fileName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: SIZES.sm,
//   },
//   content: {
//     flex: 1,
//   },
//   pdf: {
//     flex: 1,
//     backgroundColor: COLORS.gray50,
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   loadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     zIndex: 999,
//   },
//   loadingText: {
//     marginTop: SIZES.md,
//     fontSize: 16,
//     color: COLORS.textSecondary,
//   },
// });

// export default DocumentViewer;