import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';
import { tokenStorage } from './storage';
import { Alert, Pressable, StyleSheet, View, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

function formatMonthYear(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function weekdayName(date: Date) {
  return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
}

// 🔁 개선된 무한 스크롤 달력 로직 (상단은 그대로 유지)
function HomeContent() {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList<Date>>(null);
  const today = new Date();

  // 🔹 현재 날짜를 중심으로 초기 31일 생성
  const [dates, setDates] = useState<Date[]>(() => {
    const arr: Date[] = [];
    for (let i = -15; i <= 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  });

  const [selected, setSelected] = useState<Date>(today);

  // ✅ 초기 렌더 시 오늘 날짜 중앙 정렬
  useEffect(() => {
    setTimeout(() => {
      const centerIndex = Math.floor(dates.length / 2);
      flatListRef.current?.scrollToIndex({
        index: centerIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 150);
  }, []);

  // 🔁 스크롤 끝 감지 시 이전/다음 날짜 자동 추가
  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const nearStart = contentOffset.x < 100;
    const nearEnd = contentOffset.x + layoutMeasurement.width > contentSize.width - 100;

    if (nearStart) {
      const firstDate = dates[0];
      const newDates: Date[] = [];
      for (let i = -15; i < 0; i++) {
        const d = new Date(firstDate);
        d.setDate(firstDate.getDate() + i);
        newDates.push(d);
      }
      const updated = [...newDates, ...dates];
      setDates(updated);

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: newDates.length + 15,
          animated: false,
          viewPosition: 0.5,
        });
      });
    }

    if (nearEnd) {
      const lastDate = dates[dates.length - 1];
      const newDates: Date[] = [];
      for (let i = 1; i <= 15; i++) {
        const d = new Date(lastDate);
        d.setDate(lastDate.getDate() + i);
        newDates.push(d);
      }
      setDates([...dates, ...newDates]);
    }
  };

  const handleSelectDate = (item: Date, index: number) => {
    setSelected(item);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const formattedDate = `${today.getMonth() + 1}. ${today.getDate()}. (${weekdayName(today)})`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ThemedView style={styles.container}>
        {/* 상단 헤더 */}
        <ThemedView style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>
          <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
          <ThemedView style={{ width: 28 }} />
        </ThemedView>

        {/* 달력 */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            {/* 왼쪽 버튼 */}
            <Pressable
              onPress={() => {
                setSelected(today);
                const todayIndex = dates.findIndex(
                  (d) => d.toDateString() === today.toDateString()
                );
                if (todayIndex !== -1) {
                  flatListRef.current?.scrollToIndex({
                    index: todayIndex,
                    animated: true,
                    viewPosition: 0.5,
                  });
                }
              }}
              style={styles.goTodayButton}
            >
              <Text style={styles.goTodayText}>오늘</Text>
            </Pressable>

            {/* 중앙 월 텍스트 */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.monthText}>{formatMonthYear(selected)}</Text>
            </View>

            {/* 오른쪽 빈 공간 (좌우 균형) */}
            <View style={{ width: 60 }} />
          </View>

          <FlatList
            ref={flatListRef}
            data={dates}
            horizontal
            keyExtractor={(d) => d.toISOString()}
            renderItem={({ item, index }) => {
              const isToday = item.toDateString() === today.toDateString();
              const isSelected = item.toDateString() === selected.toDateString();

              return (
                <Pressable
                  onPress={() => handleSelectDate(item, index)}
                  style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                >
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                    {item.getDate()}
                  </Text>
                  <Text style={[styles.weekdayText, isSelected && styles.weekdaySelected]}>
                    {weekdayName(item)}
                  </Text>
                  {isToday && <View style={styles.todayDot} />}
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            getItemLayout={(data, index) => ({
              length: 72,
              offset: 72 * index,
              index,
            })}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}



function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <ThemedText style={styles.userText}>User</ThemedText>
      </View>
      <DrawerItem label="오늘의 할 일" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="카테고리" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="할일 목록" onPress={() => props.navigation.navigate('todos')} />
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />
      <DrawerItem label="마이페이지" onPress={() => props.navigation.navigate('Home')} />
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />
      <DrawerItem
        label="계정 정보"
        onPress={async () => {
          await tokenStorage.removeItem();
          Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
          router.replace('/');
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
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  userText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    marginRight: 8,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  goTodayButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  goTodayText: {
    fontSize: 14,
  },
  dateList: {
    paddingHorizontal: 8,
  },
  dateItem: {
    width: 64,
    height: 72,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateItemSelected: {
    backgroundColor: '#1f7aeb22',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  dateNumberSelected: {
    color: '#1f7aeb',
  },
  weekdayText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  weekdaySelected: {
    color: '#1f7aeb',
    fontWeight: '600',
  },
  todayDot: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1f7aeb',
  },
});
