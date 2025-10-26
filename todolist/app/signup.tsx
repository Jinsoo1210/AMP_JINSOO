import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput } from 'react-native';

// 백엔드 서버 주소 (login.tsx와 동일하게 설정)
// 환경 변수로 관리하는 것을 권장합니다. (예: process.env.EXPO_PUBLIC_API_URL)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);

    try {
      // 회원가입 API는 JSON 형식으로 데이터를 전송합니다.
      // ES6 단축 속성명 사용
      await axios.post(`${API_URL}/signup/`, { email, password });

      Alert.alert('성공', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.replace('/'); // 회원가입 성공 후 로그인 페이지(첫 화면)로 이동

    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        Alert.alert('가입 실패', '이미 사용 중인 이메일입니다.');
      } else if (error.response && error.response.status === 422) {
        // Pydantic 유효성 검사 실패 시 (비밀번호 길이 등)
        const errorDetail = error.response.data?.detail?.[0]?.msg || '입력 값이 유효하지 않습니다.';
        Alert.alert('가입 실패', errorDetail);
      } else {
        Alert.alert('가입 실패', '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title2}>캐롯</ThemedText>
      <ThemedText type="title" style={styles.title}>가입하기</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <Pressable style={({ pressed }) => [styles.signupButton, pressed && styles.signupButtonPressed]} onPress={handleSignup} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.signupButtonText}>회원가입</ThemedText>}
      </Pressable>
      <Link href="/" asChild>
        <Pressable style={styles.linkContainer}>
          <ThemedText type="link">이미 계정이 있으신가요? 로그인</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  title: {
    textAlign: 'left',
    marginLeft: 30,
    marginBottom: 60,
  },
  title2: {
    textAlign: 'left',
    color: '#FFB347',
    marginLeft: 30,
  },
  input: {
    height: 50,
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 16,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signupButton: {
  height: 50,
  backgroundColor: '#FFE0A3', // 
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginTop: 100,
  },
  signupButtonPressed: {
    backgroundColor: '#D3D3D3', // 버튼 눌렀을 때 살짝 진한 오렌지
  },
  signupButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  linkContainer: { marginTop: 16, alignItems: 'center' },
});
