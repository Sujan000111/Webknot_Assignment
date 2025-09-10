import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="title" style={styles.title}>
              Welcome to MVJCE Events
            </ThemedText>
            <ThemedText variant="caption" style={styles.subtitle}>
              Sign in to access events and manage your profile
            </ThemedText>
          </View>

          {/* Sign In Form */}
          <ThemedView variant="card" style={styles.formCard}>
            <View style={styles.inputContainer}>
              <ThemedText variant="default" style={styles.label}>
                Email Address
              </ThemedText>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText variant="default" style={styles.label}>
                Password
              </ThemedText>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
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

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <ThemedText variant="default" style={styles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <ThemedText variant="caption" color={Colors.primary}>
                Don't have an account? Sign Up
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Demo Credentials */}
          <View style={styles.demoContainer}>
            <ThemedText variant="caption" style={styles.demoTitle}>
              Demo Credentials:
            </ThemedText>
            <ThemedText variant="caption" style={styles.demoText}>
              Email: student@mvjce.edu.in
            </ThemedText>
            <ThemedText variant="caption" style={styles.demoText}>
              Password: password123
            </ThemedText>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
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
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  signUpButton: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  demoContainer: {
    backgroundColor: Colors.cardBackground,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  demoTitle: {
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  demoText: {
    textAlign: 'center',
  },
});
