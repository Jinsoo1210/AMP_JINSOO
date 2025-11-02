import React from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CategoryContent() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={30} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>카테고리</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* 본문 영역 */}
      <View style={styles.body}>
        <Text style={styles.text}>여기에 카테고리 목록 또는 기능을 추가하세요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, color: '#555' },
});
