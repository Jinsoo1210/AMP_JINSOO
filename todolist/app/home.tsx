import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TodosScreen from './todos';

const Drawer = createDrawerNavigator();

function formatMonthYear(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function HomeContent() {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList<number>>(null);
  const today = new Date();

  const screenWidth = Dimensions.get('window').width;
  const visibleCount = 8;
  const spacing = 4;
  const horizontalPadding = 16;
  const totalSpacing = spacing * (visibleCount - 1);
  const itemWidth = (screenWidth - totalSpacing - horizontalPadding) / visibleCount;

  const TOTAL_DAYS = 100000;
  const CENTER_INDEX = Math.floor(TOTAL_DAYS / 2);

  const [selected, setSelected] = useState<Date>(today);
  const [todos, setTodos] = useState<{ [key: string]: { id: number; title: string; checked: boolean }[] }>({});
  const [newTodo, setNewTodo] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [focusTodoId, setFocusTodoId] = useState<number | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionTodo, setActionTodo] = useState<{ id: number; title: string } | null>(null);

  const selectedKey = selected.toDateString();
  const currentTodos = todos[selectedKey] || [];

  const getDateFromIndex = (index: number) => {
    const diff = index - CENTER_INDEX;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date;
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: CENTER_INDEX, animated: false, viewPosition: 0.5 });
    }, 150);
  }, []);

  const handleSelectDate = (index: number) => {
    const date = getDateFromIndex(index);
    setSelected(date);
    scrollToIndex(index);
  };

  const handleGoToday = () => {
    setSelected(today);
    scrollToIndex(CENTER_INDEX);
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const newItem = { id: Date.now(), title: newTodo.trim(), checked: false };
    setTodos(prev => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), newItem],
    }));
    setNewTodo('');
    setShowInput(false);
  };

  const handleCheck = (id: number) => {
    setTodos(prev => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).map(todo =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      ),
    }));
  };

  const handleEditTodo = (id: number, newTitle: string) => {
    setTodos(prev => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).map(todo =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      ),
    }));
  };

  // ------------------- 수정 포커스 useEffect -------------------
  useEffect(() => {
    if (editingTodoId !== null) {
      const timer = setTimeout(() => {
        setFocusTodoId(editingTodoId);
      }, 100); // 렌더 후 포커스
      return () => clearTimeout(timer);
    }
  }, [editingTodoId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        {/* 달력 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>
          <Text style={styles.dateText}>
            {today.getMonth() + 1}. {today.getDate()}. ({['일','월','화','수','목','금','토'][today.getDay()]})
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* 무한 달력 */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={handleGoToday} style={styles.goTodayButton}>
              <Text style={styles.goTodayText}>오늘</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.monthText}>{formatMonthYear(selected)}</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <FlatList<number>
            ref={flatListRef}
            data={Array.from({ length: TOTAL_DAYS })}
            horizontal
            keyExtractor={(_, index) => index.toString()}
            initialScrollIndex={CENTER_INDEX}
            getItemLayout={(_, index) => ({
              length: itemWidth + spacing,
              offset: (itemWidth + spacing) * index,
              index,
            })}
            renderItem={({ index }) => {
              const item = getDateFromIndex(index);
              const isToday = item.toDateString() === today.toDateString();
              const isSelected = item.toDateString() === selected.toDateString();
              return (
                <Pressable
                  onPress={() => handleSelectDate(index)}
                  style={[
                    styles.dateButton,
                    { width: itemWidth },
                    isSelected && styles.dateButtonSelected,
                  ]}
                >
                  <Text style={[styles.weekdayText, isSelected && styles.weekdaySelected]}>
                    {['일','월','화','수','목','금','토'][item.getDay()]}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                    {item.getDate()}
                  </Text>
                </Pressable>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
          <View style={{ alignItems: 'center', marginTop: 3, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18, color: '#333', fontWeight: '700' }}>
                {currentTodos.length}
              </Text>
              <Ionicons name="checkmark-outline" size={22} color="#000" />
            </View>
          </View>
        </View>

        {/* 할일 관리 */}
        <View style={{ flex: 1, marginTop: 16 }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable style={styles.addButton} onPress={() => setShowInput(prev => !prev)}>
              <MaterialIcons name="add" size={20} color="#000" />
            </Pressable>
          </View>

          {showInput && (
            <TextInput
              style={styles.input}
              placeholder="새 할일 입력"
              value={newTodo}
              onChangeText={(text) => {
                if (text.length <= 14) setNewTodo(text);
              }}  
              onSubmitEditing={handleAddTodo}
              placeholderTextColor="#888"
            />
          )}

          <FlatList
            style={{ flex: 1 }}
            data={currentTodos}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isEditing = editingTodoId === item.id;

              return (
                <View style={styles.item}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.itemTitle, { flex: 1, borderBottomWidth: 1, borderColor: '#aaa' }]}
                      value={item.title}
                      onChangeText={(text) => {
                        if (text.length <= 14) handleEditTodo(item.id, text);
                      }}
                      onBlur={() => {
                        setEditingTodoId(null);
                        setFocusTodoId(null);
                      }}
                      ref={(ref) => {
                        if (ref && focusTodoId === item.id) {
                          ref.focus();
                        }
                      }}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.itemTitle,
                        item.checked && { textDecorationLine: 'line-through', color: '#888' },
                      ]}
                    >
                      {item.title}
                    </Text>
                  )}

                  <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8, alignItems: 'center' }}>
                    {!isEditing && (
                      <Pressable
                        style={styles.editButton}
                        onPress={() => {
                          if (item) {
                            setActionTodo(item);
                            setActionModalVisible(true);
                          }
                        }}
                      >
                        <Ionicons name="information-circle-outline" size={27} color="black" />
                      </Pressable>
                    )}

                    <Pressable
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#1f7aeb',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: item.checked ? '#1f7aeb' : 'transparent',
                      }}
                      onPress={() => handleCheck(item.id)}
                    >
                      {item.checked && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        </View>

        {/* 하단 모달 */}
        <Modal
          visible={actionModalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setActionModalVisible(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onPress={() => setActionModalVisible(false)}
          />

          <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <View
              style={{
                backgroundColor: '#f6f6f6',
                borderRadius: 20,
                marginHorizontal: 15,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            >
              {/* 수정하기 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  if (actionTodo) {
                    setActionModalVisible(false);
                    setEditingTodoId(actionTodo.id);
                  }
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="blue" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'blue' }}>수정하기</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

              {/* 알림 설정 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={20} color="black" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'black' }}>알림 설정</Text>
              </Pressable>

              <View style={{ height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 4 }} />

              {/* 삭제하기 */}
              <Pressable
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  if (actionTodo) {
                    setTodos(prev => ({
                      ...prev,
                      [selectedKey]: (prev[selectedKey] || []).filter(
                        todo => todo.id !== actionTodo.id
                      ),
                    }));
                  }
                  setActionModalVisible(false);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="red" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 17, color: 'red' }}>삭제하기</Text>
              </Pressable>
            </View>

            {/* 하단 취소 버튼 */}
            <View
              style={{
                backgroundColor: '#f6f6f6',
                borderRadius: 20,
                marginHorizontal: 15,
                marginBottom: 15,
              }}
            >
              <Pressable
                style={{ paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={{ fontSize: 17, color: '#000' }}>취소</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// -------------------- CategoryContent --------------------
function CategoryContent() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>
          <View style={{ width: 28 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>카테고리</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// -------------------- InformationContent --------------------
function InformationContent() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#000" />
          </Pressable>
          <Text style={{ fontSize: 23, fontWeight: '500', color: '#000' }}>
            설정 </Text>
        <View style={{ width: 28 }} /> </View>

        <Text style={{ fontSize: 25, fontWeight: '600', color: '#000', marginLeft: 15 }}>
          계정 정보
        </Text>

        {/* 구분선 */}
        <View style={{ height: 2, backgroundColor: '#000'}} />

        {/* 계정 정보 내용 */}
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 16, color: '#555', marginBottom: 4 }}>이메일</Text>
            <Text style={styles.infoBox}>user@example.com</Text>
          </View>

          <View>
            <Text style={{ fontSize: 16, color: '#555', marginBottom: 4 }}>비밀번호</Text>
            <Text style={styles.infoBox}>********</Text>
          </View>

          <View>
            <Text style={{ fontSize: 16, color: '#555', marginBottom: 4 }}>이름</Text>
            <Text style={styles.infoBox}>홍길동</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


// -------------------- CustomDrawerContent --------------------
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.userText}>User</Text>
      </View>

      <DrawerItem label="오늘의 할 일" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="카테고리" onPress={() => props.navigation.navigate('Category')} />
      {/* <DrawerItem label="할일 목록" onPress={() => props.navigation.navigate('Todos')} /> */}

      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />
      <DrawerItem label="마이페이지" onPress={() => props.navigation.navigate('Home')} />

      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 8 }} />

      <DrawerItem label="계정 정보" onPress={() => props.navigation.navigate('Info')} />
      {/* <DrawerItem
        label="계정 정보"
        onPress={() => {
          router.replace('/');
        }}
      /> */}
    </DrawerContentScrollView>
  );
}

// -------------------- Drawer 통합 --------------------
export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Info" component={InformationContent} />
    </Drawer.Navigator>
  );
}

// -------------------- 스타일 --------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 24, backgroundColor: '#fff' },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateText: { fontSize: 24, fontWeight: '700', color: '#000' },
  drawerHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 8 },
  userText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  menuButton: { marginRight: 8 },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  monthText: { fontSize: 19, fontWeight: '700' },
  goTodayButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 7 },
  goTodayText: { fontSize: 14, fontWeight : '600' },
  dateButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFB347',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  dateButtonSelected: { backgroundColor: '#1f7aeb22', borderColor: '#1f7aeb' },
  dateNumber: { fontSize: 16, fontWeight: '700', color: '#111' },
  dateNumberSelected: { color: '#1f7aeb' },
  weekdayText: { fontSize: 14, fontWeight: '600', color: '#000' },
  weekdaySelected: { color: '#1f7aeb', fontWeight: '600' },
  input: { height: 56, marginTop: 12, paddingHorizontal: 16, fontSize: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'},
  addButton: { height: 30, width: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 3, borderColor: '#000' },
  item: { width: '100%', padding: 20, backgroundColor: '#f6f6f6', borderRadius: 8, marginTop: 15, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 19, fontWeight: '600' },
  editButton: { backgroundColor: '#fff', width: 25, height: 25, borderRadius: 18, justifyContent: 'center', alignItems: 'center',},
  deleteButton: { backgroundColor: '#ff4d4f', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  infoBox: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'center', // 안드로이드 수직 가운데 정렬
  },
});
