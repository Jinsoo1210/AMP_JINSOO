import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';

// 백엔드 서버 주소 설정 (환경 변수로 관리 권장)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function LoginScreen() {
  const { width, height } = useWindowDimensions(); // ✅ 실시간 반응형 크기

  return (
    <ThemedView
      style={[
        styles.container,
        { padding: width * 0.06, gap: height * 0.02 },
      ]}
    >
      <ThemedText
        style={[
          styles.slogan,
          { fontSize: width * 0.05, marginBottom: height * 0.012 },
        ]}
      >
        당신만의 스마트 비서 투두리스트
      </ThemedText>

      <ThemedText
        style={[
          styles.slogan2,
          { fontSize: width * 0.1, marginBottom: height * 0.05 },
        ]}
      >
        캐롯
      </ThemedText>

      <Image
        source={require('../../assets/images/rabbit.png')}
        style={{
          width: width * 0.6,
          height: height * 0.3,
          marginBottom: height * 0.05,
        }}
        resizeMode="contain"
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
            marginTop: height * 0.04,
          },
        ]}
        onPress={() => router.push('/login')}
      >
        <ThemedText
          style={{ color: '#000', fontSize: width * 0.04, fontWeight: 'bold' }}
        >
          로그인
        </ThemedText>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            width: width * 0.85,
            height: height * 0.06,
            backgroundColor: pressed ? '#D3D3D3' : '#FFE0A3',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: width * 0.08,
            marginTop: height * 0.015,
          },
        ]}
        onPress={() => router.push('/signup')}
      >
        <ThemedText
          style={{
            color: '#000',
            fontSize: width * 0.04,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          회원가입
        </ThemedText>
      </Pressable>
    </ThemedView>
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
    fontWeight: '700',
    color: '#3A3A3A',
    textAlign: 'center',
  },
  slogan2: {
    fontWeight: '700',
    color: '#FFB347',
    textAlign: 'center',
  },
});
