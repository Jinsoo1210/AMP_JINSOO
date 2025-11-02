import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tokenStorage } from './storage';

export default function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>User</Text>
      </View>

      <DrawerItem label="오늘의 할 일" onPress={() => navigation.navigate('Home')} />
      <DrawerItem label="카테고리" onPress={() => navigation.navigate('Category')} />
      <DrawerItem label="할일 목록" onPress={() => navigation.navigate('Todos')} />

      <DrawerItem
        label="로그아웃"
        onPress={async () => {
          await tokenStorage.removeItem();
          Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }}
      />
    </DrawerContentScrollView>
  );
}
