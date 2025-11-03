import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 크로스 플랫폼(cross-platform)을 지원하는 스토리지 유틸리티입니다.
 * 네이티브(iOS/Android) 환경에서는 SecureStore를, 웹 환경에서는 localStorage를 사용합니다.
 * 웹의 localStorage는 보안에 취약하지만, SecureStore를 사용할 수 없는 웹 빌드 및
 * 개발 환경에서 기능적으로 동일한 역할을 제공합니다.
 */
export const tokenStorage = {
  /**
   * 인증 토큰을 저장합니다.
   * @param token 저장할 토큰
   */
  async setItem(token: string): Promise<void> {
    if (Platform.OS !== 'web') {
      return SecureStore.setItemAsync('authToken', token);
    }
    // 웹 환경에서는 localStorage를 사용합니다.
    localStorage.setItem('authToken', token);
  },

  /**
   * 인증 토큰을 가져옵니다.
   * @returns 저장된 토큰. 없을 경우 null을 반환합니다.
   */
  async getItem(): Promise<string | null> {
    if (Platform.OS !== 'web') {
      return SecureStore.getItemAsync('authToken');
    }
    // 웹 환경에서는 localStorage를 사용합니다.
    return localStorage.getItem('authToken');
  },

  /**
   * 인증 토큰을 삭제합니다.
   */
  async removeItem(): Promise<void> {
    if (Platform.OS !== 'web') {
      return SecureStore.deleteItemAsync('authToken');
    }
    // 웹 환경에서는 localStorage를 사용합니다.
    localStorage.removeItem('authToken');
  },
};