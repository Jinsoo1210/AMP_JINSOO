# 설치해야하는 라이브러리
pip install fastapi
pip install "uvicorn[standard]"
pip install sqlalchemy
pip install psycopg2-binary
pip install "python-jose[cryptography]"
pip install "passlib[bcrypt]"
npx expo install expo-secure-store
npm install axios   
-> 모두 설치 한 후에 
pip uninstall bcrypt
pip install bcrypt==4.1.2
해서 bcrypt 라이브러리는 따로 재설치.

npm install react-native-drawer-layout (10월 19일 추가)

# 실행(cmd)
uvicorn app.main:app --reload
npm start 

# 작동원리
index.tsx(엡)에서 email,pw 입력 -> FastAPI(서버)에서 main.py에서 DB 연결 후 이메일 일치한지 확인 -> security.py에서 비번 일치한지 확인 -> 토큰 생성 함수 호출(담긴 내용: 이메일, 서버만 알고 있는 SECRET_KEY로 이 정보들 암호화 후 JWT 토큰 생성 <=[.env]에서 확인 가능)
-> 로그인 화면에서 home.tsx화면으로 이동..

# 부가 설명
![DB사진](./db.png)
위 사진처럼 회원가입 시 DB 테이블에 저장됨

## 전체 파일 구조

- main.py
총 관리자, FastAPI 접속 
- auth.py 
사용자 인증, 회원가입 등 모든 API 엔드포인트 관리
- crud.py
데이터베이스 관련 모든 작업
- schemas.py
데이터 유효성 검사 및 구조 정의
* 로그인 제약사항 (이메일 유효성 검사, 비밀번호 세부사항)
- models.py
데이터베이스의 테이블 구조 정의 
users 테이블 (id, email, password)
- security.py
사용자 인증 및 보안 관련 로직
* 비밀번로 해싱 
* JWT 생성
- database.py
데이터베이스 연결 관련 설정

### 공인IP 관련 
*** 로그인 테스트 시에 팀장에게 공인IP 알리기
> https://whatismyipaddress.com/
여기 접속하면 공인IP 알 수 있음