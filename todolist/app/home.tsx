import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';
import { tokenStorage } from './storage';
import { Alert, Button, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

// 기존 홈 화면 UI를 컴포넌트로 분리
function HomeContent() {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await tokenStorage.removeItem();
    Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
    router.replace('/'); // 로그인 화면으로 이동
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#000" />
          </Pressable>
          <ThemedText type="title" style={styles.blackText}>My App</ThemedText>
          <ThemedText style={styles.blackText}>로그인되었습니다!</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={[styles.cardText, styles.blackText]}>
            환영합니다! 이제 앱의 모든 기능을 자유롭게 이용할 수 있습니다.
          </ThemedText>
        </ThemedView>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>로그아웃</ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

// Drawer 내부 메뉴
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="홈"
        onPress={() => props.navigation.navigate('Home')}
      />
      <DrawerItem
        label="할일 목록"
        onPress={() => props.navigation.navigate('todos')} // Todo 화면이 있다면 연결
      />
      <DrawerItem
        label="로그아웃"
        onPress={async () => {
          await tokenStorage.removeItem();
          Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
          router.replace('/'); // 로그인 화면으로 이동
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function HomeScreen() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="todos" component={TodosScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  menuButton: {
    marginRight: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  blackText: { color: '#000' },
  cardText: { fontSize: 16, lineHeight: 24 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});