import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react'; 
import { tokenStorage } from '../storage';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, TextInput } from 'react-native';

// 백엔드 서버 주소 (실행 환경에 맞게 수정)
// Android 에뮬레이터에서는 'http://10.0.2.2:8000'
// 실제 기기에서는 PC의 IP 주소를 사용해야 합니다. (예: http://192.168.0.5:8000)
// 환경 변수로 관리하는 것을 권장합니다. (예: process.env.EXPO_PUBLIC_API_URL)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [dateText, setDateText] = useState('');

  // ✅ 현재 시간 실시간 업데이트
  useEffect(() => {
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
      setTime(formattedTime);

      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekday = weekdays[now.getDay()];
      setDateText(`${month}월 ${day}일 ${weekday}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);

  // OAuth2PasswordRequestForm은 'application/x-www-form-urlencoded' 형식을 사용합니다.
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
        // 로그인 성공 시 받은 토큰을 안전하게 저장합니다.
        await tokenStorage.setItem(access_token);
      } catch (storageError: any) {
        // SecureStore 저장 실패 시 (주로 웹 환경에서 발생)
        console.warn('Token storage failed:', storageError);
        Alert.alert('저장소 오류', '토큰을 기기에 저장하는 데 실패했습니다. 앱이 정상적으로 동작하지 않을 수 있습니다.');
        // 저장에 실패하더라도 일단 로그인은 진행시킵니다.
      }

      // Alert may not show on web in some environments; use window.alert fallback on web
      if (Platform.OS === 'web') {
        window.alert('로그인에 성공했습니다.');
      } else {
        Alert.alert('성공', '로그인에 성공했습니다.');
      }

      // 로그인 성공 후 홈 화면으로 이동
      router.replace('/home');

    } catch (error: any) { // API 요청 실패 시의 에러 처리
      if (axios.isAxiosError(error)) {
        // Detailed logging for debugging CORS / network / server errors
        console.error('Login request error:', {
          message: error.message,
          isAxiosError: true,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          } : null,
          request: error.request,
        });

        if (!error.response) {
          // 네트워크 오류 (서버 주소가 틀렸거나, 서버가 꺼져있거나, CORS 문제 등)
          if (Platform.OS === 'web') {
            window.alert('네트워크 오류: 서버에 연결할 수 없습니다. API 주소와 네트워크 연결을 확인해주세요. (브라우저 콘솔에서 자세한 오류를 확인하세요)');
          } else {
            Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다. API 주소와 네트워크 연결을 확인해주세요.');
          }
        } else if (error.response.status === 401) {
          // 서버에서 '인증 실패' 응답을 보낸 경우
          if (Platform.OS === 'web') {
            window.alert('로그인 실패: 이메일 또는 비밀번호가 일치하지 않습니다.');
          } else {
            Alert.alert('로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.');
          }
        } else {
          // 그 외 서버 응답 오류
          const status = error.response.status;
          if (Platform.OS === 'web') {
            window.alert(`서버 오류: 상태 코드 ${status}. 브라우저 콘솔에서 자세한 오류를 확인하세요.`);
          } else {
            Alert.alert('서버 오류', `서버에서 오류가 발생했습니다. (상태 코드: ${status})`);
          }
        }
      } else {
        // Axios 오류가 아닌 다른 예외 상황
        Alert.alert('알 수 없는 오류', `로그인 처리 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* ✅ 큰 시계 */}
      {/* <ThemedText style={styles.time}>{time}</ThemedText> */}
      {/* <ThemedText style={styles.date}>{dateText}</ThemedText> */}
      {/* <TextInput
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
      /> */}
      <ThemedText style={styles.slogan}>
         당신만의 스마트 비서 투두리스트
      </ThemedText>
      <ThemedText style={styles.slogan2}>
         캐롯
      </ThemedText>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>로그인</ThemedText>}
      </Pressable>
      <Pressable
        style={({ pressed }) => [
        styles.signupButton,
        pressed && styles.signupButtonPressed
      ]}
      onPress={() => router.push('/signup')} // 회원가입 화면으로 이동
>
  <ThemedText style={styles.signupButtonText}>회원가입</ThemedText>
</Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5', // 밝은 배경색
    gap: 16,
  },
  slogan: {
    fontSize: 25,
    fontWeight: '700',
    color: '#3A3A3A',
    textAlign: 'center',  // 화면 가운데 정렬
    marginBottom: 5,        // 로그인 박스 위에 여유 공간
  },
  slogan2: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFB347',
    textAlign: 'center',  // 화면 가운데 정렬
    marginBottom: 100,        // 로그인 박스 위에 여유 공간
  },
  time: {
    textAlign: 'center',
    fontSize: 120, // 커다란 시계
    fontWeight: '700',
    color: '#222222',
    marginBottom: 50,

    textShadowColor: '#D3D3D3',    // 그림자(테두리) 색상
    textShadowOffset: { width: 9, height: 6 }, // 그림자 위치
    textShadowRadius: 2, 
  },
  date: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 50,

    textShadowColor: '#D3D3D3',    // 그림자(테두리) 색상
    textShadowOffset: { width: 3, height: 2 }, // 그림자 위치
    textShadowRadius: 2, 
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
  button: {
    height: 50,
    backgroundColor: '#FFB347',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 30,
  },
  buttonPressed: {
    backgroundColor: '#D3D3D3',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
  height: 50,
  backgroundColor: '#FFE0A3', // 
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginTop: 10,
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
  linkContainer: {
      marginTop: 16,
      alignItems: 'center',
  },
});
