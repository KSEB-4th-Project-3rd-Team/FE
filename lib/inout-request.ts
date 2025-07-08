// 입출고 요청 관련 타입 정의
export interface InOutRequest {
  id: string
  type: "inbound" | "outbound"
  itemCode: string
  itemName: string
  quantity: number
  companyCode: string
  companyName: string
  requestDate: string
  notes: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

// 로컬 스토리지 키
const REQUESTS_KEY = "wms_inout_requests"

// 입출고 요청 데이터 관리 함수들
export const inoutRequestService = {
  // 모든 요청 가져오기
  getRequests(): InOutRequest[] {
    const requests = localStorage.getItem(REQUESTS_KEY)
    return requests ? JSON.parse(requests) : []
  },

  // 요청 저장
  saveRequests(requests: InOutRequest[]) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  },

  // 요청 추가 (앱에서 들어오는 데이터 시뮬레이션)
  addRequest(request: Omit<InOutRequest, "id" | "createdAt">): InOutRequest {
    const requests = this.getRequests()
    const newRequest: InOutRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    requests.push(newRequest)
    this.saveRequests(requests)
    return newRequest
  },

  // 요청 상태 업데이트
  updateRequestStatus(id: string, status: "approved" | "rejected") {
    const requests = this.getRequests()
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) {
      requests[index].status = status
      this.saveRequests(requests)
    }
  },
}
