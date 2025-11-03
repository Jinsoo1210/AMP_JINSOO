from sqlalchemy.orm import Session
from . import models, schemas, security

# 사용자 관련 CRUD 함수

# 이메일로 사용자 조회 함수
def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

# 사용자 계정 생성 함수
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = security.get_password_hash(user.password)
    # DB 모델의 'password' 필드에 해시된 비밀번호를 저장합니다.
    db_user = models.User(email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Todo 관련 CRUD 함수
# 사용자 ID로 Todo 목록 조회 함수
def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Todo).filter(models.Todo.owner_id == user_id).offset(skip).limit(limit).all()

# 사용자 ID로 Todo 생성 함수
def create_user_todo(db: Session, todo: schemas.TodoCreate, user_id: int):
    db_todo = models.Todo(**todo.dict(), owner_id=user_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

# ID로 단일 할일 항목 조회 함수
def get_todo(db: Session, todo_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

# ID로 할일 항목 업데이트 함수
def update_todo(db: Session, todo_id: int, todo: schemas.TodoUpdate):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        update_data = todo.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_todo, key, value)
        db.commit()
        db.refresh(db_todo)
    return db_todo

# ID로 할일 항목 삭제 함수
def delete_todo(db: Session, todo_id: int):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)
        db.commit()
    # 삭제 후에는 객체가 세션에서 만료되므로, 삭제 성공 여부를 boolean 등으로 반환하거나
    # 삭제된 객체 정보를 담은 dict를 반환할 수 있습니다. 여기서는 삭제된 객체를 반환합니다.
    return db_todo
