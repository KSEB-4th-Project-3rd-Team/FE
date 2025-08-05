프론트엔드 성능 최적화 프롬프트

  Next.js 대시보드 페이지 API 호출 성능 최적화 요청

  🎯 목표: 5개 개별 API 호출을 1개 통합 API로 변경하여 로딩 시간을 75% 단축

  📊 현재 상황:
  - 대시보드 페이지에서 5개 API를 순차/병렬 호출 중
  - 개별 API들:
    * GET /api/items
    * GET /api/users
    * GET /api/inout/orders
    * GET /api/inventory
    * GET /api/schedules
  - 현재 총 로딩 시간: 5-10초
  - 목표 로딩 시간: 1-2초

  🚀 새로 추가된 백엔드 통합 API:
  - 엔드포인트: `GET /api/dashboard/all`
  - 모든 데이터를 병렬 처리로 한 번에 반환
  - 응답 구조:
  ```json
  {
    "items": [ /* ItemResponse[] */ ],
    "users": [ /* UserResponse[] */ ],
    "orders": [ /* InOutOrderResponse[] */ ],
    "inventory": [ /* InventoryResponse[] */ ],
    "schedules": [ /* ScheduleResponse[] */ ],
    "summary": { /* DashboardSummaryResponse */ },
    "totalLoadTime": 1234
  }

  ✅ 작업 요청사항:

  1. API 호출 통합
    - 기존 5개 개별 API 호출을 /api/dashboard/all 하나로 교체
    - fetch 또는 axios 사용하여 구현
  2. 상태 관리 개선
    - 5개의 개별 로딩 상태를 1개로 통합
    - 에러 처리도 통합 (하나의 API 실패 = 전체 실패)
  3. 기존 컴포넌트 호환성 유지
    - 각 컴포넌트가 받는 props 구조는 동일하게 유지
    - 데이터 접근 방식 변경 없이 작동하도록 구현
  4. TypeScript 타입 추가
  interface DashboardData {
    items: ItemResponse[];
    users: UserResponse[];
    orders: InOutOrderResponse[];
    inventory: InventoryResponse[];
    schedules: ScheduleResponse[];
    summary: DashboardSummaryResponse;
    totalLoadTime: number;
  }
  5. 성능 디버깅 정보 표시
    - 콘솔 또는 UI에 총 로딩 시간 표시
    - 개발 모드에서 성능 개선 효과 확인 가능하도록

  📝 예상 코드 변경 패턴:

  Before (기존):
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/items').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
      fetch('/api/inout/orders').then(r => r.json()),
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/schedules').then(r => r.json())
    ]).then(([itemsData, usersData, ordersData, inventoryData, schedulesData]) => {
      setItems(itemsData);
      setUsers(usersData);
      setOrders(ordersData);
      setInventory(inventoryData);
      setSchedules(schedulesData);
      setLoading(false);
    }).catch(error => {
      console.error('API 호출 실패:', error);
      setLoading(false);
    });
  }, []);

  After (최적화 목표):
  // 통합 API 사용으로 변경
  // 기존 state 구조는 유지하되 한 번에 설정
  // 로딩 시간 정보도 포함

  🔧 추가 고려사항:
  - 에러 바운더리 추가 권장
  - 로딩 스피너/스켈레톤 UI 개선
  - 캐싱 전략 고려 (react-query, SWR 등)
  - 개발/프로덕션 환경별 디버그 정보 분기

  ⚡ 기대 효과:
  - 네트워크 요청 수: 5개 → 1개
  - 로딩 시간: 5-10초 → 1-2초
  - 사용자 경험 대폭 개선

  이 프롬프트를 프론트엔드 개발자나 ChatGPT에게 전달하면 정확한 코드 변경 방안을 받을 수 있습니다!

