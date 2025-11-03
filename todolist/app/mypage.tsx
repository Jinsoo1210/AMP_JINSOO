//UI 개발 및 테스트를 위해 로컬 JSON 파일(shopItems.json)을 임시 데이터로 사용하고 있으며,
// 실제 서버와 통신하는 API 연동 로직은 주석 처리되어 있습니다. 

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList, useWindowDimensions, Alert, Modal, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import axios from 'axios';
import { tokenStorage } from './storage';
import * as RawShopData from './shopItems.json'; // 임시 추가

const rabbitImage = require('../assets/images/item/rabbit.png');

const strawHat = require('../assets/images/item/strawHat.png');
const cowboyHat = require('../assets/images/item/cowboyHat.png');
const chefsHat = require('../assets/images/item/chefsHat.png');
const santaHat = require('../assets/images/item/santa-hat.png');
const birthdayHat = require('../assets/images/item/birthdayHat.png');
const crown = require('../assets/images/item/crown.png');

// 장신구 이미지 (실제 파일 이름으로 확인/수정 필요)
const heartAccessory = require('../assets/images/item/heart-accessory.png');
const bowTie = require('../assets/images/item/bowtie.png');
const necktie = require('../assets/images/item/necktie.png');
const dotRibbon = require('../assets/images/item/dot-ribbon.png');
const scarf = require('../assets/images/item/scarf.png');
const ribbon = require('../assets/images/item/ribbon.png');

// 배경 이미지 (실제 파일 이름으로 확인/수정 필요)
const tulipBg = require('../assets/images/item/tulip-bg.png');
const cactusBg = require('../assets/images/item/cactus-bg.png');
const snowmanBg = require('../assets/images/item/snowman-bg.png');
const birthdayBg = require('../assets/images/item/birthday-bg.png');
const cakeBg = require('../assets/images/item/cake-bg.png');
const stairsBg = require('../assets/images/item/stairs-bg.png');

// 기존의 RAW_ITEMS 상수는 제거하고 아래 코드로 대체
const RAW_ITEMS = RawShopData;

// --- 상수 및 타입 정의 ---
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type ItemCategory = '모자' | '장신구' | '배경';
// 탭을 표시하기 위한 카테고리 배열
const CATEGORIES: ItemCategory[] = ['모자', '장신구', '배경'];
// 한글 카테고리 이름을 API의 영문 타입으로 매핑합니다.
const CATEGORY_MAP: Record<ItemCategory, string> = {
  '모자': 'hat',
  '장신구': 'accessory',
  '배경': 'background',
};


// API 명세서에 맞는 아이템 타입 정의
type Item = { id: string; item_id: number; name: string; price: number; type: string; emoji?: string; image?: any };

const imageMap: { [key: string]: any } = {
  'h1': strawHat,
  'h2': cowboyHat,
  'h3': chefsHat,
  'h4': santaHat,
  'h5': birthdayHat,
  'h6': crown,
  // 장신구 이미지 매핑
  'a1': heartAccessory,
  'a2': bowTie,
  'a3': necktie,
  'a4': dotRibbon,
  'a5': scarf,
  'a6': ribbon,
  // 배경 이미지 매핑
  'b1': tulipBg,
  'b2': cactusBg,
  'b3': snowmanBg,
  'b4': birthdayBg,
  'b5': cakeBg,
  'b6': stairsBg,
};

export default function MyPageScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('모자');
  const [carrots, setCarrots] = useState(0); // 당근 개수 (서버에서 가져올 예정)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [shopItems, setShopItems] = useState<Item[]>([]); // 서버에서 가져온 아이템 목록
  const [loading, setLoading] = useState(false);
  const [isSheetMinimized, setIsSheetMinimized] = useState(true);
  const [isHandleTouched, setIsHandleTouched] = useState(false);

  // 인증 헤더를 가져오는 헬퍼 함수
  const getAuthHeaders = async () => {
		const token = await tokenStorage.getItem();
		return token ? { Authorization: `Bearer ${token}` } : {};
	};

  // Bottom Sheet의 높이와 최소화되었을 때의 높이를 정의합니다.
  const sheetHeight = screenHeight * 0.55;
  const partialHeight = sheetHeight - 120; // 상단 핸들, 탭 컨테이너 높이를 제외한 만큼 이동

  // Bottom Sheet의 Y축 위치를 위한 공유 값
  const translateY = useSharedValue(partialHeight);
  // 제스처 컨텍스트를 저장하기 위한 공유 값
  const context = useSharedValue({ y: 0 });

  // 드래그 제스처 정의
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      setIsHandleTouched(true);
    })
    .onStart(() => {
      context.value = { y: translateY.value }; // 제스처 시작 시 현재 위치 저장
    })
    .onUpdate((event) => {
      // 드래그하는 동안 위치 업데이트 (위로 스크롤 방지)
      translateY.value = Math.max(context.value.y + event.translationY, 0);
    })
    .onEnd((event) => {
      // 제스처가 끝났을 때, 특정 임계값 또는 속도를 기준으로 시트를 닫거나 열기
      if (event.translationY > sheetHeight / 3 || event.velocityY > 500) {
        // 아래로 충분히 스와이프하면 시트를 최소화합니다.
        translateY.value = withSpring(partialHeight, { damping: 90 });
        setIsSheetMinimized(true);
      } else {
        // 그렇지 않으면 원래 위치로 복귀
        translateY.value = withSpring(0, { damping: 20 });
        setIsSheetMinimized(false);
      }
    })
    .onFinalize(() => {
      setIsHandleTouched(false);
    });

  // // --- API 연동 로직 ---
  // // 컴포넌트가 마운트될 때 상점 아이템 목록을 불러옵니다.
  // const fetchShopItems = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const headers = await getAuthHeaders();
  //     const response = await axios.get(`${API_URL}/api/v1/shop/items`, { headers });
  //     // TODO: 서버에서 emoji 정보를 주지 않는 경우, type에 따라 프론트에서 매핑 필요
  //     const itemsWithEmoji = response.data.map((item: Item) => ({...item, emoji: '👒'}));
  //     setShopItems(itemsWithEmoji);
  //     // TODO: 사용자 정보 API에서 당근 개수(carrots)를 가져와 setCarrots로 설정해야 합니다.
  //     // 예: const userRes = await axios.get(`${API_URL}/api/v1/users/me`, { headers });
  //     //     setCarrots(userRes.data.carrots);
  //     setCarrots(120); // 임시 데이터
  //   } catch (error) {
  //     console.error("상점 목록 로딩 실패:", error);
  //     Alert.alert("오류", "아이템 목록을 불러오는 데 실패했습니다.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [getAuthHeaders]);

  // useEffect(() => {
  //   fetchShopItems();
  // }, [fetchShopItems]);

  // 로컬 JSON 데이터를 사용하도록 수정
  useEffect(() => {
    // const allItems = Object.entries(RAW_ITEMS).flatMap(([category, items]) => items.map(item => ({ ...item, item_id: item.id, type: CATEGORY_MAP[category as ItemCategory] })));
    const allItems = Object.entries(RAW_ITEMS.default).flatMap(([category, items]) => 
      (items as any[]).map(item => ({ 
        ...item, 
        item_id: item.id, 
        type: CATEGORY_MAP[category as ItemCategory],
        image: imageMap[item.id] || null, // 이미지 매핑
      }))
    );
    setShopItems(allItems);
    setCarrots(120); // 임시 당근 데이터
  }, []);

  // 구매 모달을 여는 함수
  const openPurchaseModal = (item: Item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  // 실제 구매를 처리하는 함수 (API 연동)
  const confirmPurchase = async () => {
    if (!selectedItem) return;
    setIsModalVisible(false); // 먼저 모달을 닫습니다.

    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(`${API_URL}/api/v1/shop/purchase`, 
        { item_id: selectedItem.item_id }, // API 명세서에 따라 item_id 전송
        { headers }
      );
      // 성공 시 서버가 보내준 새 잔액으로 상태 업데이트
      setCarrots(response.data.new_balance);
      Alert.alert('구매 완료', response.data.message);
    } catch (error: any) {
      console.error("구매 실패:", error.response?.data || error);
      Alert.alert('구매 실패', error.response?.data?.error || "오류가 발생했습니다.");
    }
  };

  const cancelPurchase = () => {
    setIsModalVisible(false);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <Pressable
      style={[
        styles.itemContainer,
        selectedItem?.item_id === item.item_id && styles.itemSelected,
      ]}
      onPress={() => openPurchaseModal(item)}
    >
      <View style={styles.itemImage}>
        {item.image ? (
          <Image source={item.image} style={styles.itemImageContent} resizeMode="contain" />
        ) : (
          <ThemedText style={{ fontSize: 40 }}>{item.emoji || '❓'}</ThemedText>
        )}
      </View>
      <ThemedText style={styles.itemText}>🥕 {item.price}</ThemedText>
    </Pressable>
  );

  // Bottom Sheet의 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // 토끼 캐릭터의 애니메이션 스타일
  const animatedRabbitStyle = useAnimatedStyle(() => {
    // BottomSheet의 움직임(0 ~ partialHeight)에 따라 토끼의 Y 위치를 조정합니다.
    const rabbitTranslateY = interpolate(
      translateY.value,
      [0, partialHeight], // 입력 범위: BottomSheet의 Y 위치
      // 출력 범위: 토끼가 내려올 거리입니다.
      // (sheetHeight / 2)는 대략적인 화면 중앙을 향한 이동을 의미하며,
      // 110은 토끼 이미지 높이(220)의 절반으로, 이미지의 중앙을 맞추기 위한 값입니다.
      [0, screenHeight / 2 - 150] // 화면 중앙으로 이동하도록 값 재조정
    );

    // BottomSheet의 움직임에 따라 토끼의 크기를 조정합니다.
    const rabbitScale = interpolate(
      translateY.value,
      [0, partialHeight], // 입력 범위
      [1, 1.25]           // 출력 범위: 1배에서 1.25배로 더 크게 커짐
    );

    return {
      transform: [{ translateY: rabbitTranslateY }, { scale: rabbitScale }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={cancelPurchase}
          onDismiss={() => {
            setSelectedItem(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalItemImage}>
                {selectedItem?.image ? (
                  <Image source={selectedItem.image} style={styles.itemImageContent} resizeMode="contain" />
                ) : (
                  <ThemedText style={{ fontSize: 60 }}>{selectedItem?.emoji || '❓'}</ThemedText>
                )}
              </View>
              <ThemedText style={styles.modalText}>
                🥕 {selectedItem?.price}
              </ThemedText>
              <View style={styles.modalButtonContainer}>
                <Pressable style={[styles.modalButton, styles.purchaseButton]} onPress={confirmPurchase}>
                  <ThemedText style={styles.modalButtonText}>구매하기</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={cancelPurchase}>
                  <ThemedText style={[styles.modalButtonText, { color: 'black' }]}>취소</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* 하단 아이템 상점 (Bottom Sheet) */}
        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleContainer} >
                <View style={styles.handle} />
            </View>
          </GestureDetector>
          {/* 아이템 카테고리 탭 */}
            <View style={styles.tabContainer}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  style={[styles.tab, selectedCategory === category && styles.activeTab]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText style={[styles.tabText, selectedCategory === category && styles.activeTabText]}>
                    {category}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* 아이템 목록 */}
            {loading ? <ActivityIndicator style={{marginTop: 20}} /> : (
              <FlatList
                // 선택된 카테고리에 따라 shopItems 필터링
                data={shopItems.filter(item => item.type.toLowerCase() === CATEGORY_MAP[selectedCategory])}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.item_id)}
                numColumns={3}
                contentContainerStyle={styles.itemList} // 스크롤은 FlatList가 담당
              />
            )}
        </Animated.View>

        {/* 상단 영역 (캐릭터, 재화) */}
        <View style={styles.characterSection}>
          <View style={styles.carrotContainer}>
            <ThemedText style={styles.carrotText}>🥕 {carrots}</ThemedText>
          </View>
          {isSheetMinimized && !isHandleTouched && (
            <Pressable 
              style={styles.inventoryButton} 
              onPress={() => { translateY.value = withSpring(0); setIsSheetMinimized(false); }}>
              <ThemedText style={styles.inventoryButtonText}>인벤토리 &gt;</ThemedText>
            </Pressable>
          )}
          <Animated.View style={[styles.rabbitContainer, animatedRabbitStyle]}>
            <Image source={rabbitImage} style={styles.rabbitImage} resizeMode="contain" />
          </Animated.View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
  },
  header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 56, // 표준 높이
        paddingHorizontal: 16,
        backgroundColor: '#fff', // 배경색을 흰색으로 지정 (필요에 따라)
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1, // 중앙 타이틀이 남은 공간을 차지하여 정렬되도록 함
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1d1b20',
    },
  characterSection: {
    flex: 1, // 남은 공간을 모두 차지하도록 변경
    justifyContent: 'flex-start', // 자식 요소를 상단에 배치
    alignItems: 'center',
    paddingTop: 20, // 토끼와 상단바 사이의 간격을 설정합니다.
    pointerEvents: 'box-none', // 캐릭터 영역의 터치 이벤트를 통과시켜 하단 BottomSheet가 조작되도록 함
  },
  carrotContainer: {
    position: 'absolute',
    top: 10, // 위쪽 여백을 줄입니다.
    left: 10, // 왼쪽 여백을 줄입니다.
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  carrotText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Jua',
  },
  inventoryButton: {
    position: 'absolute', // characterSection 기준으로 위치
    top: 60,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inventoryButtonText: {
    color: '#49454F',
    fontSize: 16,
    fontFamily: 'Jua',
  },
  rabbitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rabbit: {
    fontSize: 150,
  },
  rabbitImage: {
    width: 220,
    height: 220,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%', // 화면의 약 55%를 차지
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    cursor: 'grab',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8730D8A',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Jua',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemList: {
    padding: 10,
  },
  itemContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    margin: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemSelected: {
    opacity: 0.5,
  },
  itemImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 5,
  },
  itemImageContent: {
    width: '90%',
    height: '90%',
  },
  itemText: {
    fontSize: 12,
    fontFamily: 'Jua',
  },
  modalItemImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Jua',
    fontSize: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 25, 
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  purchaseButton: {
    backgroundColor: '#E8730D8A',
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Jua',
    fontSize: 16,
  },
});