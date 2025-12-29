// src/screens/auth/TermsOfServiceScreen.tsx

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

type TermsOfServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TermsOfService'>;

interface Props {
  navigation: TermsOfServiceScreenNavigationProp;
}

const TermsOfServiceScreen: React.FC<Props> = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.headerSubtitle}>Last updated: January 2025</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="document-text" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          </View>
          <Text style={styles.paragraph}>
            Welcome to our School Management Application. By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              If you do not agree to these terms, please do not use our services.
            </Text>
          </View>
        </View>

        {/* User Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Accounts</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Registration</Text>
            <Text style={styles.paragraph}>
              To use our services, you must create an account by providing:
            </Text>
            <View style={styles.bulletPoint}>
              <Icon name="person" size={18} color={COLORS.primary} />
              <Text style={styles.bulletText}>Valid email address</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="lock-closed" size={18} color={COLORS.primary} />
              <Text style={styles.bulletText}>Secure password</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="information-circle" size={18} color={COLORS.primary} />
              <Text style={styles.bulletText}>Accurate personal information</Text>
            </View>
            
            <Text style={styles.cardTitle}>Account Responsibilities</Text>
            <Text style={styles.paragraph}>You are responsible for:</Text>
            <Text style={styles.listItem}>• Maintaining the confidentiality of your account credentials</Text>
            <Text style={styles.listItem}>• All activities that occur under your account</Text>
            <Text style={styles.listItem}>• Notifying us immediately of any unauthorized access</Text>
            <Text style={styles.listItem}>• Ensuring your account information remains accurate and up-to-date</Text>
          </View>
        </View>

        {/* User Types & Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Types & Permissions</Text>
          <View style={[styles.userTypeCard, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="school" size={28} color="#2563EB" />
            <Text style={styles.userTypeTitle}>Student Accounts</Text>
            <Text style={styles.userTypeText}>
              Students can view assignments, submit work, track progress, and communicate with teachers through the platform.
            </Text>
          </View>
          <View style={[styles.userTypeCard, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="people" size={28} color="#16A34A" />
            <Text style={styles.userTypeTitle}>Teacher Accounts</Text>
            <Text style={styles.userTypeText}>
              Teachers can create assignments, manage classes, grade submissions, and communicate with students.
            </Text>
          </View>
        </View>

        {/* Acceptable Use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptable Use Policy</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>You agree NOT to:</Text>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Share inappropriate, offensive, or harmful content
              </Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Violate any applicable laws or regulations
              </Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Impersonate another person or entity
              </Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Attempt to gain unauthorized access to our systems
              </Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Use the platform for any commercial purposes without permission
              </Text>
            </View>
            <View style={styles.prohibitedItem}>
              <Icon name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.prohibitedText}>
                Interfere with or disrupt the service or servers
              </Text>
            </View>
          </View>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <View style={styles.card}>
            <View style={styles.ipSection}>
              <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
              <View style={styles.ipContent}>
                <Text style={styles.ipTitle}>Our Rights</Text>
                <Text style={styles.paragraph}>
                  All content, features, and functionality of the School Management Application, including but not limited to text, graphics, logos, and software, are owned by F24Tech and protected by intellectual property laws.
                </Text>
              </View>
            </View>
            <View style={styles.ipSection}>
              <Icon name="document" size={24} color={COLORS.success} />
              <View style={styles.ipContent}>
                <Text style={styles.ipTitle}>Your Content</Text>
                <Text style={styles.paragraph}>
                  You retain ownership of any content you submit to the platform. By submitting content, you grant us a license to use, store, and display it solely for providing our services to you.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Availability</Text>
          <View style={styles.warningBox}>
            <Icon name="alert-circle" size={24} color="#F59E0B" />
            <Text style={styles.warningText}>
              We strive to provide uninterrupted service, but we do not guarantee that our platform will be available at all times. We may experience downtime for maintenance, updates, or unforeseen technical issues.
            </Text>
          </View>
        </View>

        {/* Termination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Termination</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Rights</Text>
            <Text style={styles.paragraph}>
              You may terminate your account at any time by contacting our support team. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </Text>
            
            <Text style={styles.cardTitle}>Our Rights</Text>
            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate your account if you:
            </Text>
            <Text style={styles.listItem}>• Violate these Terms of Service</Text>
            <Text style={styles.listItem}>• Engage in fraudulent or illegal activities</Text>
            <Text style={styles.listItem}>• Abuse or misuse the platform</Text>
            <Text style={styles.listItem}>• Harm other users or the platform's integrity</Text>
          </View>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law, F24Tech and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
            </Text>
            <Text style={styles.listItem}>• Your use or inability to use the service</Text>
            <Text style={styles.listItem}>• Any unauthorized access to your data</Text>
            <Text style={styles.listItem}>• Any errors or omissions in the service</Text>
            <Text style={styles.listItem}>• Any loss of data or content</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimer of Warranties</Text>
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Our service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </Text>
          </View>
        </View>

        {/* Indemnification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indemnification</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              You agree to indemnify, defend, and hold harmless F24Tech, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from:
            </Text>
            <Text style={styles.listItem}>• Your use of the service</Text>
            <Text style={styles.listItem}>• Your violation of these Terms</Text>
            <Text style={styles.listItem}>• Your violation of any rights of another party</Text>
            <Text style={styles.listItem}>• Content you submit to the platform</Text>
          </View>
        </View>

        {/* Modifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms of Service at any time. We will notify you of any material changes through:
          </Text>
          <View style={styles.bulletPoint}>
            <Icon name="mail" size={18} color={COLORS.primary} />
            <Text style={styles.bulletText}>Email notification to your registered address</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Icon name="notifications" size={18} color={COLORS.primary} />
            <Text style={styles.bulletText}>In-app notification</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Icon name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.bulletText}>Updated "Last updated" date on this page</Text>
          </View>
          <Text style={styles.paragraph}>
            Your continued use of the service after changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Governing Law</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </Text>
            <Text style={styles.paragraph}>
              Any disputes arising from these terms or your use of the service shall be resolved through binding arbitration in accordance with Indian law.
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.contactBox}>
            <Text style={styles.contactTitle}>Questions About Terms?</Text>
            <Text style={styles.contactSubtitle}>
              If you have any questions or concerns about these Terms of Service, please contact our support team.
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
          </LinearGradient>
        </View>

        {/* Acknowledgment */}
        <View style={styles.section}>
          <View style={styles.acknowledgmentBox}>
            <Icon name="checkmark-done-circle" size={32} color={COLORS.success} />
            <Text style={styles.acknowledgmentTitle}>Acknowledgment</Text>
            <Text style={styles.acknowledgmentText}>
              By creating an account and using our School Management Application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing our School Management Application.
          </Text>
          <Text style={styles.footerSubtext}>
            © 2025 F24Tech. All rights reserved.
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
  highlightBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: SIZES.sm,
  },
  highlightText: {
    fontSize: SIZES.body,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.xs,
  },
  bulletText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  listItem: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginLeft: SIZES.md,
    marginBottom: SIZES.xs,
  },
  userTypeCard: {
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  userTypeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  prohibitedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SIZES.xs,
  },
  prohibitedText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SIZES.sm,
  },
  ipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  ipContent: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  ipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.body,
    color: '#92400E',
    lineHeight: 22,
    marginLeft: SIZES.sm,
  },
  disclaimerBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  disclaimerText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
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
  acknowledgmentBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  acknowledgmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  acknowledgmentText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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

export default TermsOfServiceScreen;