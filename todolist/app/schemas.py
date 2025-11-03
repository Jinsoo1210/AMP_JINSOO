from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import time

# --- Todo Schemas ---
class TodoBase(BaseModel):
    title: str

class TodoCreate(TodoBase):
    pass

    # ⏰ 알람 시간 필드 추가
    # DB에 String으로 저장할 경우 Optional[str]
    # DB에 Time으로 저장할 경우 Optional[time]
    alarm_time: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

class Todo(TodoBase):
    id: int
    completed: bool
    owner_id: int

    class Config:
        from_attributes = True

# --- Item & Inventory Schemas ---
class ItemBase(BaseModel):
    name: str
    price: int
    item_type: str # 'hat' 또는 'accessory'
    image_url: str

class Item(ItemBase):
    id: int
    class Config:
        from_attributes = True

class Inventory(BaseModel):
    # 인벤토리 목록 조회 시 필요한 정보
    item: Item # Item 전체 정보 포함
    is_equipped: bool
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="비밀번호는 8자 이상, 72자 이하여야 합니다."
    )

class User(UserBase):
    id: int
    todos: List[Todo] = []

    # 🥕 당근 갯수 필드 추가
    carrot_balance: int 
    
    # 👒 현재 장착 정보 필드 추가 (인벤토리와의 빠른 조회를 위해)
    equipped_hat_id: Optional[int] = None
    equipped_acc_id: Optional[int] = None

    # 인벤토리 목록을 포함할 경우 (선택사항)
    inventory: List[Inventory] = []

    class Config:
        from_attributes = True # SQLAlchemy 모델을 Pydantic 모델로 변환

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None