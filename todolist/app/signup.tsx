import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';

// 백엔드 서버 주소
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function SignupScreen() {
  const { width, height } = useWindowDimensions(); // ✅ 반응형 적용

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
      await axios.post(`${API_URL}/signup/`, { email, password });
      Alert.alert('성공', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.replace('/');
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        Alert.alert('가입 실패', '이미 사용 중인 이메일입니다.');
      } else if (error.response && error.response.status === 422) {
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView
        style={[
          styles.container,
          { padding: width * 0.06, gap: height * 0.02 }, // ✅ 동적 스타일
        ]}
      >
        <ThemedText type="title" style={[styles.title2, { marginLeft: width * 0.06 }]}>
          캐롯
        </ThemedText>
        <ThemedText
          type="title"
          style={[styles.title, { marginLeft: width * 0.06, marginBottom: height * 0.08 }]}
        >
          가입하기
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              width: width * 0.85,
              height: height * 0.06,
              paddingHorizontal: width * 0.04,
              fontSize: width * 0.04,
            },
          ]}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <TextInput
          style={[
            styles.input,
            {
              width: width * 0.85,
              height: height * 0.06,
              paddingHorizontal: width * 0.04,
              fontSize: width * 0.04,
            },
          ]}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        <Pressable
          style={({ pressed }) => [
            styles.signupButton,
            {
              width: width * 0.85,
              height: height * 0.06,
              marginTop: height * 0.12,
              borderRadius: width * 0.08,
            },
            pressed && styles.signupButtonPressed,
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={[styles.signupButtonText, { fontSize: width * 0.04 }]}>
              회원가입
            </ThemedText>
          )}
        </Pressable>

        <View style={[styles.loginContainer, { marginTop: height * 0.01 }]}>
          <Text style={[styles.normalText, { fontSize: width * 0.035 }]}>
            이미 계정이 있으신가요?{' '}
          </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={[styles.loginText, { fontSize: width * 0.035 }]}>로그인</Text>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'left',
  },
  title2: {
    textAlign: 'left',
    color: '#FFB347',
  },
  input: {
    backgroundColor: '#D3D3D3',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    alignSelf: 'center',
  },
  signupButton: {
    backgroundColor: '#FFE0A3',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  signupButtonPressed: {
    backgroundColor: '#D3D3D3',
  },
  signupButtonText: {
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  normalText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loginText: {
    color: '#FFB347',
    fontWeight: 'bold',
  },
});
