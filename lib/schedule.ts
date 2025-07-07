// 일정 관련 타입 정의
export interface Schedule {
  id: string
  title: string
  location: string
  date: string
  time: string
  details: string
  type: "inbound" | "outbound" | "work" | "meeting" | "other"
  createdAt: string
}

// 로컬 스토리지 키
const SCHEDULES_KEY = "wms_schedules"

// 일정 데이터 관리 함수들
export const scheduleService = {
  // 모든 일정 가져오기
  getSchedules(): Schedule[] {
    const schedules = localStorage.getItem(SCHEDULES_KEY)
    return schedules ? JSON.parse(schedules) : []
  },

  // 일정 저장
  saveSchedules(schedules: Schedule[]) {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules))
  },

  // 일정 추가
  addSchedule(schedule: Omit<Schedule, "id" | "createdAt">): Schedule {
    const schedules = this.getSchedules()
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    schedules.push(newSchedule)
    this.saveSchedules(schedules)
    return newSchedule
  },

  // 특정 날짜의 일정 가져오기
  getSchedulesByDate(date: string): Schedule[] {
    const schedules = this.getSchedules()
    return schedules.filter((schedule) => schedule.date === date)
  },

  // 일정 삭제
  deleteSchedule(id: string) {
    const schedules = this.getSchedules()
    const filteredSchedules = schedules.filter((schedule) => schedule.id !== id)
    this.saveSchedules(filteredSchedules)
  },
}
