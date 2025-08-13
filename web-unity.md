# 🚀 웹-Unity 연동 완벽 설계 및 구축 계획

## 📋 **프로젝트 개요**
- **목표**: 웹 승인대기 주문과 Unity AMR 시스템 실시간 연동
- **방식**: TaskBridge를 통한 표준화된 통신 프로토콜
- **범위**: 모든 페이지에서 Unity로 작업 전송 및 완료 상태 실시간 동기화

---

## 🏗️ **전체 아키텍처**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   웹 페이지들    │───▶│  React Query    │───▶│  Unity 통신     │───▶│  TaskBridge     │
│                │    │                │    │     레이어      │    │                │
│ • 입출고관리    │    │ • 실시간 동기화  │    │ • 표준화된 API  │    │ • 작업 검증/변환 │
│ • AMR 작동현황  │    │ • 캐시 무효화   │    │ • 에러 처리     │    │ • 큐 관리       │
│ • 기타 페이지   │    │ • 상태 관리     │    │ • 로깅         │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                    ▲                                          │
                                    │                                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI 자동 업데이트│◀───│  완료 이벤트     │◀───│  Unity AMR      │◀───│  TaskManager    │
│                │    │     처리        │    │    시스템       │    │                │
│ • 목록에서 제거  │    │ • 상태 업데이트  │    │ • AMR 작업 실행  │    │ • 작업 스케줄링  │
│ • 완료 표시     │    │ • 캐시 갱신     │    │ • 완료 알림     │    │ • 경로 계획     │
│ • 알림 표시     │    │                │    │                │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔍 **현재 상황 분석**

### ✅ **기존 구현 상태**
- React Query 기반 데이터 관리 ✅
- Unity WebGL 기본 연결 ✅ (react-unity-webgl)
- 승인대기 주문 목록 표시 ✅
- 기본적인 Unity 통신 함수 ✅

### ❌ **문제점**
- Unity 개발자 규격과 불일치:
  - GameObject: `TaskManager` → `TaskBridge` 필요
  - 메서드: `StartTask` → `AssignTaskFromJson` 필요
  - JSON 구조: `{type, rackId}` → `{type, rackId, taskId, ts}` 필요
- 완료 이벤트 처리 미완성
- 실시간 작업 현황 패널 없음

---

## 📊 **Unity 개발자 규격 분석**

### **TaskBridge.cs 주요 기능**
1. **강력한 입력 검증**
   ```csharp
   // JSON 파싱 에러 처리
   try { m = JsonUtility.FromJson<WebTaskPayload>(json); }
   catch { Debug.LogError("JSON 파싱 실패"); }
   
   // 필수 필드 검증
   if (string.IsNullOrWhiteSpace(m.type) || string.IsNullOrWhiteSpace(m.rackId))
       Debug.LogError("필드 부족");
   ```

2. **유연한 타입 매핑**
   ```csharp
   "in" | "inbound" | "입고" → "INBOUND"
   "out" | "outbound" | "출고" → "OUTBOUND"
   ```

3. **자동 ID 관리**
   ```csharp
   // 웹에서 taskId 주면 사용, 아니면 자동 생성 (1000번대)
   taskId = !string.IsNullOrEmpty(m.taskId) ? SafeParseInt(m.taskId, fallback)
                                            : taskManager.allTasks.Count + 1000
   ```

4. **완전한 작업 생성**
   ```csharp
   var newTask = new TaskManager.TaskType {
       taskId = ...,
       type = "INBOUND",
       rackId = "B03", 
       status = "pending",
       intermediateTarget = inboundArea.position,  // 입고장 먼저
       finalTarget = rackPosition                   // 그 다음 랙
   };
   ```

### **표준 통신 프로토콜**
```javascript
// 웹 → Unity
sendMessage("TaskBridge", "AssignTaskFromJson", JSON.stringify({
  type: "inbound",        // "inbound" | "outbound" | "입고" | "출고"
  rackId: "B003",         // 랙 ID (Unity가 정규화함)
  taskId: "order-123",    // 선택적, 웹 주문 ID
  ts: Date.now()          // 선택적, 타임스탬프
}));

// Unity → 웹 (완료 시)
addEventListener("TaskCompleted", (taskId) => {
  // 해당 작업을 완료 상태로 업데이트
});
```

---

## 🎯 **단계별 구현 계획**

### **1단계: warehouse-simulation.tsx Unity 규격 적용** 🔄
- [x] 현재 코드 분석 완료
- [ ] `assignTaskToAmr` 함수 TaskBridge 규격으로 수정
- [ ] JSON 구조 완전히 맞춤 (`taskId`, `ts` 추가)
- [ ] 에러 처리 강화

### **2단계: Unity 완료 이벤트 처리 개선** 
- [ ] `handleTaskCompleted` 함수 개선
- [ ] React Query Mutation과 연동
- [ ] 모든 페이지 실시간 동기화 보장

### **3단계: 승인대기 주문 목록과 Unity 연동**
- [ ] 승인대기 주문 조회 API 구현
- [ ] "예약" 버튼 클릭 시 Unity로 전송
- [ ] 상태 변경 (승인대기 → 진행중 → 완료)

### **4단계: 실시간 작업 현황 패널 구현**
- [ ] AMR 작동현황 페이지에 실시간 작업 목록 추가
- [ ] 진행중 작업, 대기중 작업 표시
- [ ] Unity 상태와 실시간 동기화

### **5단계: 전체 페이지 Unity 연동**
- [ ] 입출고관리 페이지 연동
- [ ] 기타 관련 페이지들 연동 
- [ ] 통합 테스트

---

## 🔧 **구현 세부사항**

### **Unity 통신 함수 개선안**
```javascript
// 개선된 assignTaskToAmr 함수
const assignTaskToAmr = useCallback((order) => {
  if (!sendMessage) {
    console.error('[Unity] sendMessage not available');
    return false;
  }

  const taskData = {
    type: order.type,                    // "inbound" | "outbound"
    rackId: order.rackId,               // "B003" 등
    taskId: order.id || crypto.randomUUID?.() || String(Date.now()),
    ts: Date.now()
  };

  try {
    sendMessage("TaskBridge", "AssignTaskFromJson", JSON.stringify(taskData));
    console.log('[Unity] Task sent:', taskData);
    return true;
  } catch (error) {
    console.error('[Unity] Send failed:', error);
    return false;
  }
}, [sendMessage]);
```

### **완료 이벤트 처리 개선안**
```javascript
const handleTaskCompleted = useCallback((taskId) => {
  console.log(`[Unity] Task completed: ${taskId}`);
  
  // 1. 해당 주문의 상태를 완료로 업데이트
  updateOrderStatus({ 
    orderId: taskId, 
    status: 'COMPLETED' 
  });

  // 2. 성공 알림 표시
  toast.success(`작업 완료: ${taskId}`);
  
  // 3. React Query 캐시 무효화로 모든 페이지 동기화
  queryClient.invalidateQueries(['pendingOrders']);
  queryClient.invalidateQueries(['inOutData']);
}, [updateOrderStatus, queryClient]);
```

### **실시간 작업 현황 패널**
```javascript
// AMR 작동현황 페이지에 추가될 컴포넌트
const RealTimeTaskPanel = () => {
  const { data: pendingOrders } = usePendingOrders();
  const { data: inProgressOrders } = useInProgressOrders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>실시간 작업 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4>대기중 ({pendingOrders?.length || 0})</h4>
            {pendingOrders?.map(order => (
              <div key={order.id} className="flex justify-between">
                <span>{order.type} - {order.rackId}</span>
                <Button onClick={() => assignTaskToAmr(order)}>
                  예약
                </Button>
              </div>
            ))}
          </div>
          
          <div>
            <h4>진행중 ({inProgressOrders?.length || 0})</h4>
            {inProgressOrders?.map(order => (
              <div key={order.id} className="flex justify-between">
                <span>{order.type} - {order.rackId}</span>
                <span className="text-blue-500">AMR 작업중...</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 📈 **기대 효과**

### **사용자 경험 개선**
- ✅ **즉시 반응**: 예약 버튼 클릭 → Unity AMR 즉시 작업 시작
- ✅ **실시간 동기화**: Unity 완료 → 모든 페이지 즉시 반영
- ✅ **투명한 상태**: 대기중/진행중/완료 상태 실시간 확인
- ✅ **에러 처리**: 연결 실패, JSON 오류 등 명확한 피드백

### **운영 효율성**
- ✅ **자동화**: 수동 AMR 조작 → 웹에서 자동 할당
- ✅ **추적성**: 각 주문의 taskId로 완벽한 작업 추적
- ✅ **확장성**: 새로운 작업 타입, 우선순위 등 쉽게 추가

### **기술적 장점**
- ✅ **표준화**: TaskBridge 프로토콜로 일관된 통신
- ✅ **안정성**: Unity 개발자의 검증된 시스템 활용
- ✅ **유지보수**: 명확한 역할 분리로 디버깅 용이

---

## 🚨 **주의사항 및 체크리스트**

### **Unity 빌드 설정**
- [ ] TaskBridge GameObject가 씬에 존재
- [ ] TaskBridge.taskManager가 실제 TaskManager 연결됨
- [ ] Development Build로 콘솔 로그 확인 가능
- [ ] Decompression Fallback 설정 (압축 빌드 시)

### **웹 환경 설정**
- [ ] Unity 빌드 파일들이 올바른 경로에 위치
- [ ] react-unity-webgl 버전 호환성 확인
- [ ] HTTPS 환경에서 정상 작동 확인

### **테스트 시나리오**
1. **연결 테스트**: Unity 로드 → 콘솔에서 연결 확인
2. **전송 테스트**: 예약 버튼 → Unity 콘솔에 `[TaskBridge] 작업 등록 OK` 로그
3. **완료 테스트**: Unity 작업 완료 → 웹에서 상태 변경 확인
4. **동기화 테스트**: 여러 페이지에서 동시에 상태 변경 확인

---

## 📝 **개발 진행 상황**

### ✅ **완료된 작업**
- Unity 개발자 규격 분석
- 현재 코드와 차이점 파악
- 전체 아키텍처 설계
- 단계별 구현 계획 수립

### 🔄 **진행 중인 작업**
- warehouse-simulation.tsx Unity 규격 적용

### 📋 **다음 작업**
- Unity 작업 전송 함수 개선
- 완료 이벤트 처리 개선
- 승인대기 주문 목록과 Unity 연동
- 실시간 작업 현황 패널 구현

---

## 🎯 **최종 목표**

**"웹에서 예약 버튼 클릭 → Unity AMR 즉시 작업 → 완료 시 모든 페이지 실시간 반영"**

이 목표를 달성하면 **완전 자동화된 스마트 WMS 시스템**이 완성됩니다!