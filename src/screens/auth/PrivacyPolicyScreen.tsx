// src/screens/auth/PrivacyPolicyScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { COLORS, SIZES } from '../../utils/colors';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

interface Props {
  navigation: PrivacyPolicyScreenNavigationProp;
}

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const handleContactPress = (type: 'email' | 'phone') => {
    if (type === 'email') {
      Linking.openURL('mailto:sales@f24tech.com');
    } else {
      Linking.openURL('tel:+919425707050');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSubtitle}>Last updated: January 2025</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Your Privacy Matters</Text>
          </View>
          <Text style={styles.paragraph}>
            Welcome to our School Management Application. This privacy policy explains how we collect, use, and protect your personal information. Our platform serves teachers and students worldwide, and we are committed to maintaining the highest standards of data protection and privacy.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Personal Information</Text>
            <Text style={styles.paragraph}>
              We collect the following information for authentication and service provision:
            </Text>
            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Email Address:</Text> Used for account authentication, login, and communication
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Name:</Text> Used to personalize your experience and identify you within the platform
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>User Role:</Text> Teacher or Student designation for appropriate access control
              </Text>
            </View>
          </View>
        </View>

        {/* How We Use Your Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <View style={styles.usageGrid}>
            <View style={[styles.usageCard, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="key" size={24} color="#2563EB" />
              <Text style={styles.usageCardTitle}>Authentication</Text>
              <Text style={styles.usageCardText}>
                Securely verify your identity and maintain your account access
              </Text>
            </View>
            <View style={[styles.usageCard, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="mail" size={24} color="#16A34A" />
              <Text style={styles.usageCardTitle}>Communication</Text>
              <Text style={styles.usageCardText}>
                Send important updates, notifications, and support messages
              </Text>
            </View>
            <View style={[styles.usageCard, { backgroundColor: '#FAF5FF' }]}>
              <Icon name="document-text" size={24} color="#9333EA" />
              <Text style={styles.usageCardTitle}>Service Delivery</Text>
              <Text style={styles.usageCardText}>
                Provide and improve our educational management services
              </Text>
            </View>
            <View style={[styles.usageCard, { backgroundColor: '#FFFBEB' }]}>
              <Icon name="lock-closed" size={24} color="#CA8A04" />
              <Text style={styles.usageCardTitle}>Security</Text>
              <Text style={styles.usageCardText}>
                Protect against unauthorized access and maintain platform integrity
              </Text>
            </View>
          </View>
        </View>

        {/* Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Protect Your Data</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your personal information:
          </Text>
          <Text style={styles.emojiList}>🔒 Encrypted data transmission using SSL/TLS protocols</Text>
          <Text style={styles.emojiList}>🛡️ Secure password storage with encryption</Text>
          <Text style={styles.emojiList}>🔐 Regular security audits and updates</Text>
          <Text style={styles.emojiList}>👥 Limited access to personal data by authorized personnel only</Text>
          <Text style={styles.emojiList}>📊 Secure database infrastructure with backup systems</Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Your data is kept secure throughout this period.
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              When you delete your account, your personal information is permanently removed from our active systems within 30 days.
            </Text>
          </View>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the following rights regarding your personal data:
          </Text>
          <View style={styles.rightItem}>
            <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
            <View style={styles.rightContent}>
              <Text style={styles.rightTitle}>Access</Text>
              <Text style={styles.rightText}>Request a copy of your personal data</Text>
            </View>
          </View>
          <View style={styles.rightItem}>
            <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
            <View style={styles.rightContent}>
              <Text style={styles.rightTitle}>Correction</Text>
              <Text style={styles.rightText}>Update or correct inaccurate information</Text>
            </View>
          </View>
          <View style={styles.rightItem}>
            <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
            <View style={styles.rightContent}>
              <Text style={styles.rightTitle}>Deletion</Text>
              <Text style={styles.rightText}>Request deletion of your account and personal data</Text>
            </View>
          </View>
          <View style={styles.rightItem}>
            <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
            <View style={styles.rightContent}>
              <Text style={styles.rightTitle}>Portability</Text>
              <Text style={styles.rightText}>Export your data in a machine-readable format</Text>
            </View>
          </View>
        </View>

        {/* Account Deletion */}
        <View style={styles.section}>
          <View style={styles.deletionBox}>
            <View style={styles.deletionHeader}>
              <Icon name="trash" size={28} color="#DC2626" />
              <Text style={styles.deletionTitle}>Delete Your Account</Text>
            </View>
            <Text style={styles.paragraph}>
              If you wish to permanently delete your account and all associated data, please contact us using the support information below. We will process your request within 48 hours and confirm once your data has been removed.
            </Text>
            <View style={styles.importantBox}>
              <Text style={styles.importantText}>
                ⚠️ Important: Account deletion is permanent and cannot be undone. All your data, including notes, assignments, and progress, will be permanently removed.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.contactBox}>
            <Text style={styles.contactTitle}>Contact & Support</Text>
            <Text style={styles.contactSubtitle}>
              Have questions about our privacy policy or need assistance? Our support team is here to help you with any concerns, including account deletion requests.
            </Text>
            
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('email')}
            >
              <Icon name="mail" size={24} color={COLORS.white} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>sales@f24tech.com</Text>
                <Text style={styles.contactDetail}>Response time: Within 24 hours</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleContactPress('phone')}
            >
              <Icon name="call" size={24} color={COLORS.white} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone Support</Text>
                <Text style={styles.contactValue}>+91 9425707050</Text>
                <Text style={styles.contactDetail}>Available: Mon-Fri, 9 AM - 6 PM IST</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.deletionRequestBox}>
              <Text style={styles.deletionRequestText}>
                ✉️ For Account Deletion Requests:{'\n'}
                Please email us at <Text style={styles.bold}>sales@f24tech.com</Text> with the subject line "Account Deletion Request" and include your registered email address.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* International Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>International Users</Text>
          <View style={styles.internationalBox}>
            <Icon name="globe" size={24} color={COLORS.primary} />
            <Text style={styles.paragraph}>
              Our School Management Application is available to teachers and students worldwide. We comply with international data protection regulations and ensure that your data is handled with the same level of care regardless of your location.
            </Text>
          </View>
        </View>

        {/* Changes to Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes, we will notify you through:
          </Text>
          <Text style={styles.bulletText}>• Email notification to your registered email address</Text>
          <Text style={styles.bulletText}>• In-app notification when you next log in</Text>
          <Text style={styles.bulletText}>• Update to the "Last updated" date at the top of this page</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using our School Management Application, you agree to this Privacy Policy.
          </Text>
          <Text style={styles.footerSubtext}>
            © 2025 F24Tech. All rights reserved. | Serving teachers and students worldwide.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    paddingTop: SIZES.xxl + 20,
    paddingBottom: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  backButton: {
    marginBottom: SIZES.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  section: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    marginLeft: SIZES.sm,
  },
  paragraph: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.sm,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SIZES.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SIZES.sm,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  usageGrid: {
    gap: SIZES.md,
  },
  usageCard: {
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  usageCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  usageCardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emojiList: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SIZES.xs,
  },
  warningBox: {
    backgroundColor: COLORS.gray100,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gray400,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    marginTop: SIZES.md,
  },
  warningText: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  rightContent: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  rightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  rightText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  deletionBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  deletionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  deletionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SIZES.sm,
  },
  importantBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: SIZES.md,
  },
  importantText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  contactBox: {
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
  },
  contactSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  deletionRequestBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  deletionRequestText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  internationalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
  },
  footer: {
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.xxl,
  },
  footerText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;