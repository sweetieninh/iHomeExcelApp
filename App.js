import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MathByGradeScreen from './src/screens/MathByGradeScreen';
import SkillExerciseScreen from './src/screens/SkillExerciseScreen';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Platform.select({
    web: 'http://localhost:4000',
    default: 'http://localhost:4000',
  });

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('roleSelect');
  const [username, setUsername] = useState('emma.smith');
  const [password, setPassword] = useState('1234');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  function openStudentLogin() {
    setAuthError('');
    setCurrentScreen('login');
  }

  async function handleStudentLogin() {
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/student-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Login failed');
      }

      setDisplayName(payload.displayName || username);
      setCurrentScreen('mathByGrade');
    } catch (error) {
      setAuthError(error.message || 'Unable to login.');
    } finally {
      setIsAuthenticating(false);
    }
  }

  function renderRoleSelectScreen() {
    return (
      <View style={styles.centerPanel}>
        <Text style={styles.title}>Choose your role</Text>
        <Text style={styles.subtitle}>Start by selecting how you use iHomeExcel.</Text>

        <View style={styles.roleButtonStack}>
          <Pressable onPress={openStudentLogin} style={({ pressed }) => [styles.roleButton, pressed && styles.roleButtonPressed]}>
            <Text style={styles.roleButtonText}>Student</Text>
            <Text style={styles.roleButtonHint}>Continue to login</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.roleButtonDisabled, pressed && styles.roleButtonPressed]}>
            <Text style={styles.roleButtonText}>Parent</Text>
            <Text style={styles.roleButtonHint}>Coming soon</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.roleButtonDisabled, pressed && styles.roleButtonPressed]}>
            <Text style={styles.roleButtonText}>Teacher</Text>
            <Text style={styles.roleButtonHint}>Coming soon</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderLoginScreen() {
    return (
      <View style={styles.centerPanel}>
        <Text style={styles.title}>Student Login</Text>
        <Text style={styles.subtitle}>Use your credentials to continue.</Text>

        <View style={styles.loginCard}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
            placeholder="username"
            placeholderTextColor="#7f8f9b"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#7f8f9b"
          />

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

          <View style={styles.loginActionRow}>
            <Pressable
              onPress={() => setCurrentScreen('roleSelect')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.roleButtonPressed]}
              disabled={isAuthenticating}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={handleStudentLogin}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.roleButtonPressed]}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Login</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  function renderCurrentScreen() {
    if (currentScreen === 'skillExercise') {
      return <SkillExerciseScreen onBack={() => setCurrentScreen('mathByGrade')} />;
    }

    if (currentScreen === 'mathByGrade') {
      return (
        <MathByGradeScreen
          displayName={displayName}
          onBack={() => setCurrentScreen('roleSelect')}
          onOpenSkillExercise={() => setCurrentScreen('skillExercise')}
        />
      );
    }

    if (currentScreen === 'login') {
      return renderLoginScreen();
    }

    return renderRoleSelectScreen();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appHeader}>
        <Text style={styles.brand}>iHomeExcel</Text>
        <Text style={styles.userLabel}>{displayName ? `Signed in: ${displayName}` : 'Signed in: Guest'}</Text>
      </View>

      <View style={styles.screenWrap}>{renderCurrentScreen()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef5ea',
  },
  appHeader: {
    backgroundColor: '#1b8ccc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  userLabel: {
    color: '#e8f5ff',
    fontSize: 16,
    fontWeight: '600',
  },
  screenWrap: {
    flex: 1,
  },
  centerPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    color: '#224f35',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4f6c5b',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleButtonStack: {
    width: '100%',
    maxWidth: 560,
    gap: 18,
  },
  roleButton: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: '#2f9f52',
    paddingHorizontal: 24,
    paddingVertical: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#288645',
  },
  roleButtonDisabled: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: '#8fb8cc',
    paddingHorizontal: 24,
    paddingVertical: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#739eb3',
  },
  roleButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  roleButtonText: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
  },
  roleButtonHint: {
    color: '#e8f7ef',
    fontSize: 16,
    marginTop: 6,
    fontWeight: '600',
  },
  loginCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d6e6d8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  label: {
    fontSize: 14,
    color: '#456255',
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#b9cbba',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontSize: 16,
    color: '#2d4839',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  errorText: {
    color: '#a52d2d',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  loginActionRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9db4a5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6fbf7',
  },
  secondaryButtonText: {
    color: '#3c5a49',
    fontWeight: '700',
    fontSize: 15,
  },
  primaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b8ccc',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
