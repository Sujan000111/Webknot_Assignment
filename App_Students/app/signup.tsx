import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, Phone, GraduationCap, Hash } from 'lucide-react-native';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    phone: '',
    department: '',
    yearOfStudy: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, firstName, lastName, studentId, department, yearOfStudy } = formData;

    if (!email || !password || !confirmPassword || !firstName || !lastName || !studentId || !department || !yearOfStudy) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const year = parseInt(yearOfStudy);
    if (isNaN(year) || year < 1 || year > 4) {
      Alert.alert('Error', 'Year of study must be between 1 and 4');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { email, password, firstName, lastName, studentId, phone, department, yearOfStudy } = formData;
      
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        student_id: studentId,
        phone: phone || undefined,
        department,
        year_of_study: parseInt(yearOfStudy),
        college_id: null, // Will be set by the trigger or admin
      });

      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/signin'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.replace('/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText variant="title" style={styles.title}>
                Create Account
              </ThemedText>
              <ThemedText variant="caption" style={styles.subtitle}>
                Join MVJCE Events and start participating in amazing events
              </ThemedText>
            </View>

            {/* Sign Up Form */}
            <ThemedView variant="card" style={styles.formCard}>
              {/* Personal Information */}
              <ThemedText variant="default" style={styles.sectionTitle}>
                Personal Information
              </ThemedText>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText variant="default" style={styles.label}>
                    First Name *
                  </ThemedText>
                  <View style={styles.inputWrapper}>
                    <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="First name"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText variant="default" style={styles.label}>
                    Last Name *
                  </ThemedText>
                  <View style={styles.inputWrapper}>
                    <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Last name"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText variant="default" style={styles.label}>
                  Email Address *
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText variant="default" style={styles.label}>
                  Phone Number
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Academic Information */}
              <ThemedText variant="default" style={styles.sectionTitle}>
                Academic Information
              </ThemedText>

              <View style={styles.inputContainer}>
                <ThemedText variant="default" style={styles.label}>
                  Student ID *
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Hash size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., MVJCE2021CS001"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.studentId}
                    onChangeText={(value) => handleInputChange('studentId', value)}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText variant="default" style={styles.label}>
                    Department *
                  </ThemedText>
                  <View style={styles.inputWrapper}>
                    <GraduationCap size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Computer Science"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.department}
                      onChangeText={(value) => handleInputChange('department', value)}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText variant="default" style={styles.label}>
                    Year of Study *
                  </ThemedText>
                  <View style={styles.inputWrapper}>
                    <Hash size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="1-4"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.yearOfStudy}
                      onChangeText={(value) => handleInputChange('yearOfStudy', value)}
                      keyboardType="numeric"
                      maxLength={1}
                    />
                  </View>
                </View>
              </View>

              {/* Password Section */}
              <ThemedText variant="default" style={styles.sectionTitle}>
                Security
              </ThemedText>

              <View style={styles.inputContainer}>
                <ThemedText variant="default" style={styles.label}>
                  Password *
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText variant="default" style={styles.label}>
                  Confirm Password *
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={Colors.textSecondary}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.disabledButton]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <ThemedText variant="default" style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <ThemedText variant="caption" color={Colors.primary}>
                  Already have an account? Sign In
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
  },
  formCard: {
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    marginBottom: Layout.spacing.sm,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inputIcon: {
    marginRight: Layout.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: Layout.spacing.sm,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
});
