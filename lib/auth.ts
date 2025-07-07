// 사용자 타입 정의
export interface User {
  id: string
  username: string
  fullName: string
  createdAt: string
}

// 로컬 스토리지 키
const USERS_KEY = "wms_users"
const CURRENT_USER_KEY = "wms_current_user"

// 사용자 데이터 관리 함수들
export const authService = {
  // 모든 사용자 가져오기
  getUsers(): Array<{ username: string; password: string; fullName: string; id: string; createdAt: string }> {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  },

  // 사용자 저장
  saveUsers(users: Array<{ username: string; password: string; fullName: string; id: string; createdAt: string }>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  },

  // 회원가입
  async register(username: string, password: string, fullName: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // 실제 API 호출을 시뮬레이션하기 위한 지연
      setTimeout(() => {
        const users = this.getUsers()

        // 중복 아이디 확인
        if (users.find((user) => user.username === username)) {
          resolve({ success: false, message: "이미 사용 중인 아이디입니다." })
          return
        }

        // 새 사용자 추가
        const newUser = {
          id: Date.now().toString(),
          username,
          password, // 실제 환경에서는 해시화해야 함
          fullName,
          createdAt: new Date().toISOString(),
        }

        users.push(newUser)
        this.saveUsers(users)

        resolve({ success: true, message: "회원가입이 완료되었습니다." })
      }, 1000) // 1초 지연으로 실제 API 호출 시뮬레이션
    })
  },

  // 로그인
  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    return new Promise((resolve) => {
      // 실제 API 호출을 시뮬레이션하기 위한 지연
      setTimeout(() => {
        const users = this.getUsers()
        const user = users.find((u) => u.username === username && u.password === password)

        if (user) {
          const userInfo: User = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            createdAt: user.createdAt,
          }

          // 현재 사용자 정보 저장
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo))

          resolve({ success: true, message: "로그인 성공", user: userInfo })
        } else {
          resolve({ success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." })
        }
      }, 800) // 0.8초 지연
    })
  },

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  },

  // 로그아웃
  logout() {
    localStorage.removeItem(CURRENT_USER_KEY)
  },

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  },
}
