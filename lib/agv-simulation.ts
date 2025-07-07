// AGV 관련 타입 정의
export interface AGV {
  id: string
  name: string
  x: number
  y: number
  targetX: number
  targetY: number
  status: "idle" | "moving" | "loading" | "unloading" | "charging"
  batteryLevel: number
  currentTask?: string
  speed: number
  path: { x: number; y: number }[]
  color: string
}

export interface WarehouseZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: "storage" | "loading" | "charging" | "office" | "unloading"
  color: string
}

export interface Obstacle {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: "wall" | "shelf" | "equipment"
}

// 창고 레이아웃 데이터 - 제공된 이미지 기반
export const warehouseLayout = {
  width: 1000,
  height: 700,
  zones: [
    // 상단 창고 구역들 (파란색)
    {
      id: "storage-1",
      name: "창고1",
      x: 50,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-2",
      name: "창고2",
      x: 150,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-3",
      name: "창고3",
      x: 250,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-4",
      name: "창고4",
      x: 350,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-5",
      name: "창고5",
      x: 450,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-6",
      name: "창고6",
      x: 550,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-7",
      name: "창고7",
      x: 650,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    {
      id: "storage-8",
      name: "창고8",
      x: 750,
      y: 50,
      width: 80,
      height: 200,
      type: "storage" as const,
      color: "#2196f3",
    },
    // 출고장 (노란색)
    {
      id: "outbound-dock",
      name: "출고장",
      x: 50,
      y: 350,
      width: 150,
      height: 120,
      type: "loading" as const,
      color: "#ffeb3b",
    },
    // 하역장 (빨간색)
    {
      id: "unloading-dock",
      name: "하역장",
      x: 850,
      y: 350,
      width: 100,
      height: 200,
      type: "unloading" as const,
      color: "#f44336",
    },
  ],
  obstacles: [
    // 중앙 선반들 (회색)
    { id: "shelf-1", x: 250, y: 350, width: 30, height: 80, type: "shelf" as const },
    { id: "shelf-2", x: 290, y: 350, width: 30, height: 80, type: "shelf" as const },

    { id: "shelf-3", x: 350, y: 350, width: 30, height: 80, type: "shelf" as const },
    { id: "shelf-4", x: 390, y: 350, width: 30, height: 80, type: "shelf" as const },

    { id: "shelf-5", x: 450, y: 350, width: 30, height: 80, type: "shelf" as const },
    { id: "shelf-6", x: 490, y: 350, width: 30, height: 80, type: "shelf" as const },

    { id: "shelf-7", x: 550, y: 350, width: 30, height: 80, type: "shelf" as const },
    { id: "shelf-8", x: 590, y: 350, width: 30, height: 80, type: "shelf" as const },

    { id: "shelf-9", x: 650, y: 350, width: 30, height: 80, type: "shelf" as const },
    { id: "shelf-10", x: 690, y: 350, width: 30, height: 80, type: "shelf" as const },
  ],
}

// AGV 시뮬레이션 서비스
export class AGVSimulationService {
  private agvs: AGV[] = []
  private isRunning = false
  private animationId: number | null = null
  private callbacks: ((agvs: AGV[]) => void)[] = []

  constructor() {
    this.initializeAGVs()
  }

  private initializeAGVs() {
    this.agvs = [
      {
        id: "agv-1",
        name: "AGV-001",
        x: 100,
        y: 500,
        targetX: 100,
        targetY: 500,
        status: "idle",
        batteryLevel: 85,
        speed: 2,
        path: [],
        color: "#2196f3",
      },
      {
        id: "agv-2",
        name: "AGV-002",
        x: 200,
        y: 500,
        targetX: 200,
        targetY: 500,
        status: "idle",
        batteryLevel: 92,
        speed: 2,
        path: [],
        color: "#4caf50",
      },
      {
        id: "agv-3",
        name: "AGV-003",
        x: 300,
        y: 500,
        targetX: 300,
        targetY: 500,
        status: "idle",
        batteryLevel: 78,
        speed: 2,
        path: [],
        color: "#ff9800",
      },
      {
        id: "agv-4",
        name: "AGV-004",
        x: 400,
        y: 500,
        targetX: 400,
        targetY: 500,
        status: "idle",
        batteryLevel: 65,
        speed: 2,
        path: [],
        color: "#9c27b0",
      },
      {
        id: "agv-5",
        name: "AGV-005",
        x: 500,
        y: 500,
        targetX: 500,
        targetY: 500,
        status: "idle",
        batteryLevel: 88,
        speed: 2,
        path: [],
        color: "#00bcd4",
      },
      {
        id: "agv-6",
        name: "AGV-006",
        x: 600,
        y: 500,
        targetX: 600,
        targetY: 500,
        status: "idle",
        batteryLevel: 73,
        speed: 2,
        path: [],
        color: "#795548",
      },
      {
        id: "agv-7",
        name: "AGV-007",
        x: 700,
        y: 500,
        targetX: 700,
        targetY: 500,
        status: "charging",
        batteryLevel: 45,
        speed: 2,
        path: [],
        color: "#607d8b",
      },
      {
        id: "agv-8",
        name: "AGV-008",
        x: 800,
        y: 500,
        targetX: 800,
        targetY: 500,
        status: "idle",
        batteryLevel: 91,
        speed: 2,
        path: [],
        color: "#e91e63",
      },
    ]
  }

  subscribe(callback: (agvs: AGV[]) => void) {
    this.callbacks.push(callback)
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }

  private notifySubscribers() {
    this.callbacks.forEach((callback) => callback([...this.agvs]))
  }

  getAGVs(): AGV[] {
    return [...this.agvs]
  }

  startSimulation() {
    if (this.isRunning) return

    this.isRunning = true
    this.simulate()
  }

  stopSimulation() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private simulate() {
    if (!this.isRunning) return

    // AGV 움직임 업데이트
    this.agvs.forEach((agv) => {
      if (agv.status === "moving") {
        this.moveAGV(agv)
      } else if (agv.status === "idle" && Math.random() < 0.01) {
        // 가끔씩 랜덤하게 새로운 목표 설정
        this.assignRandomTask(agv)
      }
    })

    this.notifySubscribers()
    this.animationId = requestAnimationFrame(() => this.simulate())
  }

  private moveAGV(agv: AGV) {
    const dx = agv.targetX - agv.x
    const dy = agv.targetY - agv.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < agv.speed) {
      // 목표 지점에 도달
      agv.x = agv.targetX
      agv.y = agv.targetY
      agv.status = "idle"
      agv.path = []
    } else {
      // 목표 지점으로 이동
      agv.x += (dx / distance) * agv.speed
      agv.y += (dy / distance) * agv.speed

      // 경로 추가 (최근 10개 위치만 유지)
      agv.path.push({ x: agv.x, y: agv.y })
      if (agv.path.length > 10) {
        agv.path.shift()
      }
    }
  }

  private assignRandomTask(agv: AGV) {
    const zones = warehouseLayout.zones
    const randomZone = zones[Math.floor(Math.random() * zones.length)]

    agv.targetX = randomZone.x + randomZone.width / 2
    agv.targetY = randomZone.y + randomZone.height / 2
    agv.status = "moving"
    agv.currentTask = `${randomZone.name}으로 이동`
  }

  moveAGVTo(agvId: string, x: number, y: number) {
    const agv = this.agvs.find((a) => a.id === agvId)
    if (agv) {
      agv.targetX = x
      agv.targetY = y
      agv.status = "moving"
      agv.currentTask = "수동 이동"
    }
  }

  assignTaskToAGV(taskType: "inbound" | "outbound", location: string) {
    // 대기 중인 AGV 찾기
    const availableAGV = this.agvs.find((agv) => agv.status === "idle")

    if (availableAGV) {
      const zones = warehouseLayout.zones
      let targetZone

      if (taskType === "inbound") {
        // 입고 - 하역장에서 창고로
        targetZone = zones.find((zone) => zone.name === location) || zones.find((zone) => zone.type === "storage")
        availableAGV.targetX = 900 // 하역장 근처에서 시작
        availableAGV.targetY = 450
        availableAGV.currentTask = `${location} 입고 작업`
      } else {
        // 출고 - 창고에서 출고장으로
        targetZone = zones.find((zone) => zone.id === "outbound-dock")
        availableAGV.targetX = targetZone?.x + targetZone?.width / 2 || 125
        availableAGV.targetY = targetZone?.y + targetZone?.height / 2 || 410
        availableAGV.currentTask = `${location} 출고 작업`
      }

      availableAGV.status = "moving"
      this.notifySubscribers()
      return availableAGV.name
    }

    return null
  }
}

// 싱글톤 인스턴스
export const agvSimulation = new AGVSimulationService()
