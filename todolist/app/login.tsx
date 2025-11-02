import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { Link, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { tokenStorage } from './storage';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from 'react-native';

// 백엔드 서버 주소 (실행 환경에 맞게 수정)
// Android 에뮬레이터: http://10.0.2.2:8000
// 실제 기기: PC IP 사용 (예: http://192.168.0.5:8000)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions(); // ✅ 반응형 훅 사용
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const response = await axios.post(`${API_URL}/login/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;

      try {
        await tokenStorage.setItem(access_token);
      } catch (storageError: any) {
        console.warn('Token storage failed:', storageError);
        Alert.alert('저장소 오류', '토큰 저장에 실패했습니다. 앱이 정상적으로 동작하지 않을 수 있습니다.');
      }

      if (Platform.OS === 'web') {
        window.alert('로그인에 성공했습니다.');
      } else {
        Alert.alert('성공', '로그인에 성공했습니다.');
      }

      router.replace('./drawer/home');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Login request error:', error);

        if (!error.response) {
          Platform.OS === 'web'
            ? window.alert('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
            : Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다.');
        } else if (error.response.status === 401) {
          Platform.OS === 'web'
            ? window.alert('이메일 또는 비밀번호가 일치하지 않습니다.')
            : Alert.alert('로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.');
        } else {
          const status = error.response.status;
          Platform.OS === 'web'
            ? window.alert(`서버 오류: 상태 코드 ${status}`)
            : Alert.alert('서버 오류', `서버 오류 발생 (상태 코드: ${status})`);
        }
      } else {
        Alert.alert('알 수 없는 오류', `로그인 중 오류가 발생했습니다: ${error.message}`);
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
          { padding: width * 0.06, gap: height * 0.02 },
        ]}
      >
        <ThemedText
          style={[
            styles.slogan,
            {
              fontSize: width * 0.09,
              marginBottom: height * 0.15,
              marginLeft: width * 0.06,
            },
          ]}
        >
          계정
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              width: width * 0.85,
              height: height * 0.06,
              paddingHorizontal: width * 0.04,
              borderRadius: width * 0.08,
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
              borderRadius: width * 0.08,
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
            {
              width: width * 0.85,
              height: height * 0.06,
              backgroundColor: pressed ? '#D3D3D3' : '#FFB347',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: width * 0.08,
              marginTop: height * 0.12,
            },
          ]}
          onPress={() => router.replace('./home')} // ✅ 임시: 직접 홈으로 이동
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText
              style={{
                color: '#000',
                fontSize: width * 0.04,
                fontWeight: 'bold',
              }}
            >
              로그인
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slogan: {
    fontWeight: 'bold',
    color: '#3A3A3A',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#D3D3D3',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
