from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Time, DATETIME
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    todos = relationship("Todo", back_populates="owner")

    # 🥕 당근 갯수 필드 추가
    carrot_balance = Column(Integer, default=0, nullable=False) 
    
    # 👒 현재 장착된 물품 ID 추가 (빠른 조회를 위함)
    equipped_hat_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    equipped_acc_id = Column(Integer, ForeignKey("items.id"), nullable=True)

    # 인벤토리와 관계 설정 (역참조)
    inventory = relationship("Inventory", back_populates="owner")

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True) # 고유 항목 ID
    title = Column(String, index=True) # 할일 제목
    completed = Column(Boolean, default=False) # 완료 여부
    owner_id = Column(Integer, ForeignKey("users.id")) # 소유자 ID

    owner = relationship("User", back_populates="todos") # 소유자 정보

    # ⏰ 알람 시간 필드 추가
    alarm_time = Column(Time, nullable=True) # Python time 객체로 저장
    # 혹은 Column(String)으로 "06:20" 문자열 저장도 가능

# 1. 물품 모델 (Item Model)
class Item(Base):
    """상점 물품의 정보(가격, 타입, 이미지 등)를 저장"""
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer, nullable=False) # 판매 가격 (당근)
    item_type = Column(String, nullable=False) # 'hat' 또는 'accessory'
    image_url = Column(String) 
    
    # 이 물품을 소유한 인벤토리 목록을 참조 (역참조)
    owners = relationship("Inventory", back_populates="item")

# 2. 인벤토리 모델 (Inventory Model)
class Inventory(Base):
    """사용자가 소유한 물품 목록 및 장착 여부를 저장"""
    __tablename__ = "inventories"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # 외래 키 (FK)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    
    is_equipped = Column(Boolean, default=False) # 현재 장착 여부
    
    # 관계 설정
    owner = relationship("User", back_populates="inventory")
    item = relationship("Item", back_populates="owners")