from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import get_db
from .auth import get_current_user

# APIRouter 인스턴스를 생성하여 Todo 관련 API 엔드포인트를 그룹화합니다.
# 이렇게 하면 main.py에서 라우터를 쉽게 포함시킬 수 있습니다.
router = APIRouter()

# --- 할일(Todo) 생성 API ---
@router.post("/todos/", response_model=schemas.Todo)
def create_todo_for_user(
    todo: schemas.TodoCreate,  # 요청 본문(body)에서 받을 데이터 (제목 등)
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    현재 로그인된 사용자를 위해 새로운 할일을 생성합니다.
    - `todo`: 생성할 할일의 제목과 설명을 담고 있습니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    # crud 함수를 호출하여 데이터베이스에 할일을 생성하고, 생성된 할일 객체를 반환합니다.
    return crud.create_user_todo(db=db, todo=todo, user_id=current_user.id)

# --- 할일(Todo) 목록 조회 API ---
@router.get("/todos/", response_model=list[schemas.Todo])
def read_todos(
    skip: int = 0,  # 페이징을 위한 시작 위치 (쿼리 파라미터)
    limit: int = 100,  # 한 번에 가져올 최대 개수 (쿼리 파라미터)
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    현재 로그인된 사용자의 모든 할일 목록을 조회합니다.
    - `skip`, `limit`: 페이징 처리를 위한 쿼리 파라미터입니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    # crud 함수를 호출하여 해당 사용자의 할일 목록을 데이터베이스에서 가져옵니다.
    todos = crud.get_todos(db, user_id=current_user.id, skip=skip, limit=limit)
    return todos

# --- 특정 할일(Todo) 조회 API ---
@router.get("/todos/{todo_id}", response_model=schemas.Todo)
def read_todo_by_id(
    todo_id: int,  # URL 경로에서 받을 할일의 ID
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    특정 ID의 할일을 조회합니다.
    - `todo_id`: 조회할 할일의 고유 ID입니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this todo")
    return db_todo

# --- 특정 할일(Todo) 수정 API ---
@router.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo_by_id(
    todo_id: int,  # URL 경로에서 받을 할일의 ID
    todo: schemas.TodoUpdate,  # 요청 본문에서 받을 수정할 데이터
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    특정 ID의 할일을 수정합니다.
    - `todo_id`: 수정할 할일의 고유 ID입니다.
    - `todo`: 수정할 제목, 완료 여부 등의 정보를 담고 있습니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    # 먼저 데이터베이스에서 해당 ID의 할일이 있는지 확인합니다.
    db_todo = crud.get_todo(db, todo_id=todo_id)
    # 할일이 존재하지 않으면 404 Not Found 에러를 발생시킵니다.
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    # 할일의 소유자가 현재 로그인한 사용자가 아니면 403 Forbidden 에러를 발생시킵니다.
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this todo")
    # 모든 검사를 통과하면 crud 함수를 호출하여 할일을 수정합니다.
    return crud.update_todo(db=db, todo_id=todo_id, todo=todo)

# --- 특정 할일(Todo) 삭제 API ---
@router.delete("/todos/{todo_id}", response_model=schemas.Todo)
def delete_todo_by_id(
    todo_id: int,  # URL 경로에서 받을 할일의 ID
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    특정 ID의 할일을 삭제합니다.
    - `todo_id`: 삭제할 할일의 고유 ID입니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    # 데이터베이스에서 해당 ID의 할일이 있는지 확인합니다.
    db_todo = crud.get_todo(db, todo_id=todo_id)
    # 할일이 존재하지 않으면 404 Not Found 에러를 발생시킵니다.
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    # 할일의 소유자가 현재 로그인한 사용자가 아니면 403 Forbidden 에러를 발생시킵니다.
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this todo")
    # 모든 검사를 통과하면 crud 함수를 호출하여 할일을 삭제합니다.
    return crud.delete_todo(db=db, todo_id=todo_id)

# --- 할일(Todo) 당근 지급 로직 API ---
@router.post("/todos/{todo_id}/complete/", response_model=schemas.User)
def complete_todo(
    todo_id: int,  # URL 경로에서 받을 할일의 ID
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    특정 ID의 할일을 완료 처리하고, 보상으로 당근 1개를 지급합니다.
    - `todo_id`: 완료할 할일의 고유 ID입니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this todo")
    if db_todo.completed:
        raise HTTPException(status_code=400, detail="Todo is already completed")
    db_todo.completed = True
    current_user.carrot_balance += 1
    db.commit()
    db.refresh(current_user)
    return current_user

# --- 할일(Todo) 완료 취소 API ---
@router.post("/todos/{todo_id}/uncomplete/", response_model=schemas.User)
def uncomplete_todo(
    todo_id: int,  # URL 경로에서 받을 할일의 ID
    db: Session = Depends(get_db),  # 데이터베이스 세션 의존성 주입
    current_user: models.User = Depends(get_current_user),  # 현재 로그인된 사용자 정보 의존성 주입
):
    """
    특정 ID의 할일 완료를 취소하고, 지급했던 당근 1개를 회수합니다.
    - `todo_id`: 완료를 취소할 할일의 고유 ID입니다.
    - `db`: 데이터베이스 작업을 위한 세션입니다.
    - `current_user`: JWT 토큰을 통해 인증된 사용자 정보입니다.
    """
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    if db_todo.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to uncomplete this todo")
    if not db_todo.completed:
        raise HTTPException(status_code=400, detail="Todo is not completed yet")
    db_todo.completed = False
    current_user.carrot_balance = max(0, current_user.carrot_balance - 1)
    db.commit()
    db.refresh(current_user)
    return current_user