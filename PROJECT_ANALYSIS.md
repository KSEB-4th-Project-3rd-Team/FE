# KSEB-Project 웹 애플리케이션 분석 보고서

## 1. 프로젝트 개요

L5: 이 애플리케이션은 Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI를 기반으로 구축된 스마트 창고 관리 시스템(WMS)입니다. 재고, 입출고, AMR 작동 현황, 일정, 보고서 등 창고 운영의 다양한 측면을 관리하기 위한 사용자 인터페이스를 제공합니다.

## 2. 기술 스택

*   **프레임워크:** Next.js 15.2.4 (App Router)
*   **언어:** TypeScript
*   **UI/CSS 프레임워크:** Tailwind CSS, Shadcn UI (Radix UI 기반)
*   **폼 관리:** `react-hook-form`, `zod` (유효성 검사)
*   **차트:** `recharts` (현재 플레이스홀더)
*   **날짜 유틸리티:** `date-fns`
*   **알림:** `sonner`
*   **아이콘:** `lucide-react`
*   **패키지 관리자:** `npm` 또는 `pnpm`

## 3. 애플리케이션 실행 방법

1.  **의존성 설치:** 프로젝트 루트 디렉토리에서 다음 명령 중 하나를 실행합니다.
    ```bash
    npm install
    # 또는
    pnpm install
    ```
2.  **개발 서버 시작:**
    ```bash
    npm run dev
    ```
    (개발 모드로 애플리케이션을 시작��니다. 일반적으로 `http://localhost:3000`에서 접근 가능합니다.)
3.  **프로덕션 빌드:**
    ```bash
    npm run build
    ```
    (배포를 위한 프로덕션 빌드를 생성합니다.)
4.  **프로덕션 서버 시작:**
    ```bash
    npm run start
    ```
    (빌드된 프로덕션 애플리케이션을 시작합니다.)

## 4. 핵심 기능 및 디자인 분석

### 4.1. 공통 레이아웃 (`app/(main)/layout.tsx`)

*   **역할:** 애플리케이션의 전반적인 구조, 내비게이션, 사용자 인증 흐름, 동적 사이드 패널을 정의합니다.
*   **디자인:**
    *   왼쪽에 고정 너비(64px)의 사이드바와 오른쪽에 주 콘텐츠 영역이 있는 반응형 flexbox 레이아웃.
    *   Tailwind CSS를 사용하여 간격, 색상, 그림자 등 스타일링.
    *   인증 확인 중 사용자 정의 로딩 스피너 표시.
    *   로그인하지 않은 사용자는 `AuthForm`으로 리디렉션.
*   **사이드바 내비게이션:**
    *   상단에 "Smart WMS Logo" (반전된 색상)와 `/simulation` 링크.
    *   로그인한 사용자의 이니셜, 전체 이름, 사용자 이름을 표시하는 사용자 정보 영역.
    *   `lucide-react` 아이콘과 Shadcn UI `Button`을 사용한 내비게이션 링크.
    *   **접을 수 있는 메뉴:** "기초 정보", "입/출고 관리", "시스템 관리" 메뉴는 확장/축소 가능하며, 현재 경로에 따라 활성화 상태가 유지됩니다.
    *   **하단 작업:** "전역 검색" 버튼 (모달 트리거) 및 "로그아웃" 버튼.
*   **동적 사이드 패널:**
    *   "입고 등록" 및 "출고 등록" 양식에 사용되며, `/simulation` 경로에서만 나타납니다.
    *   오른쪽에 고정되며, 열려 있을 때 320px 너비.
    *   `InboundForm` 또는 `OutboundForm`을 조건부 렌더링.
    *   패널을 접거나 확장하는 토글 버튼 포함.
*   **토스트 알림:** 화면 오른쪽 상단에 성공/오류 메시지를 표시하는 임시 알림 시스템.

### 4.2. 대시보드 (`app/(main)/dashboard/page.tsx`, `components/dashboard/real-time-dashboard.tsx`)

*   **역할:** 재고, 운영, AGV 관련 주요 지표, 상태 업데이트, 경고를 표시하는 실시간 대시보드.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   지표와 상태를 시각적으로 구분하기 위한 생생한 색상 팔레트 및 `lucide-react` 아이콘 사용.
    *   반응형 그리드 레이아웃.
    *   오른쪽 상단에 1초마다 업데이트되는 실시간 시계.
*   **주요 지표 카드:** "총 재고", "오늘 입고", "오늘 출고", "AGV ��율성"을 표시하며, 추세 지표 포함.
*   **상세 현황 섹션:**
    *   **재고 현황:** "정상 재고", "부족 재고", "품절" 항목을 색상 구분하여 표시.
    *   **AGV 현황:** "활동 중", "충전 중", "정비 중" AGV 수를 표시.
*   **작업 현황 및 실시간 알림:**
    *   **오늘 작업 현황:** "완료", "대기 중" 작업 수와 완료율 진행률 표시줄.
    *   **실시간 알림:** 유형(경고, 정보, 오류)에 따라 색상 구분된 알림 목록.
*   **실시간 차트 영역:** 현재는 "차트 라이브러리 연동 시 표시됩니다"라는 플레이스홀더.
*   **데이터 소스:** 현재 모든 데이터는 컴포넌트 내에 하드코딩된 더미 데이터입니다.

### 4.3. 거래처 관리 (`app/(main)/company-list/page.tsx`, `components/company/company-list.tsx`)

*   **역할:** 회사(거래처) 정보의 표시, 검색, 추가, 편집, 삭제 관리.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   "거래처 등록" 버튼.
    *   **거래처 목록 카드:**
        *   "거래처 목록" 제목과 검색 필터 토글 버튼.
        *   **검색 필터:** "거래처코드", "거래처명", "대표자명", "전화번호", "Email"로 필터링 가능한 확장 가능한 ��터 섹션.
        *   **회사 테이블:** "거래처코드", "거래처명", "대표자명", "전화번호", "Email", "주소", "관리" 열을 포함. 각 행에 "수정" 및 "삭제" 버튼 포함.
        *   빈 상태 메시지.
*   **거래처 등록/수정 모달:**
    *   중앙에 배치된 폼이 있는 전체 화면 오버레이.
    *   `editingCompany` 상태에 따라 "거래처 수정" 또는 "거래처 등록" 제목.
    *   "거래처코드", "거래처명"(필수), "대표자명", "전화번호", "Email", "주소", "비고" 필드.
    *   "등록"/"수정" 및 "취소" 버튼.
*   **데이터 소스:** `companyService`를 통해 데이터를 관리하며, 현재는 로컬 저장소 또는 모의 API를 사용하는 것으로 보입니다.

### 4.4. 입출고 내역 (`app/(main)/inout-history/page.tsx`, `components/inout/inout-history.tsx`)

*   **역할:** 입출고 내역 표시, 필터링, 다중 항목 등록 모달을 통한 새 입출고 등록 허용.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   "입출고 등록" 버튼.
*   **통계 카드:** "오늘 입고", "오늘 출고", "이번 주 총량"에 대한 하드코딩된 통계 표시.
*   **상세 내역 목록 카드:**
    *   "전체 입출고 내역" 제목과 검색 필터 토글 버튼.
    *   **내역 필터:** "유형", "상품명", "카테고리", "위치", "거래처", "목적지", "날짜"로 필터링 가능한 확장 가능한 필터 섹션. "필터 초기화" 버튼 포함.
    *   **내역 테이블:** "유형", "상품명", "카테고리", "수량", "위치", "거래처", "목적지", "날짜" 열을 포함. 유형에 따라 색상 배지 사용.
    *   빈 상태 메시지.
    *   **페이지네이션:** 페이지당 10개 항목으로 페이지네이션 제어.
*   **입출고 등록 모달:**
    *   여러 항목 등록을 위한 큰 폼이 있는 전체 화면 오버레이.
    *   각 항목에 대해 "유형", "상품명"(필수), "카테고리", "수량"(필수), "위치"(선택), "거래처", "목적지"(출고 시 조건부), "비고" 필드.
    *   "항목 추가" 및 개별 항목 삭제 버튼.
    *   "등록 완료" 및 "취소" 버튼.
*   **데이터 소스:** 현재 모든 데이터는 컴포넌트 내에 하드코딩된 더미 데이터입니다.

### 4.5. 입출고 요청 (`app/(main)/inout-request/page.tsx`, `components/inout/inout-request.tsx`)

*   **역할:** 입출고 요청 관리, 보류 중인 요청 보기, 승인/거부, 완료된 요청 기록 보기.
*   **디자인:**
    *   Shadcn UI `Card` 컴���넌트를 사용한 카드 기반 레이아웃.
    *   "승인 대기 중인 요청" 및 "처리 완료된 요청"의 두 가지 주요 카드 섹션.
*   **각 요청 카드:**
    *   제목에 요청 수 포함.
    *   검색 필터 토글 버튼.
    *   **검색 필터:** "유형", "상품명", "거래처", "날짜"로 필터링 가능한 확장 가능한 필터 섹션. "필터 초기화" 버튼 포함.
    *   **요청 테이블:** "유형", "상품명", "수량", "거래처", "요청일", "비고" 열을 포함. 유형에 따라 아이콘 및 색상 배지 사용.
    *   **"승인 대기 중인 요청" 테이블:** 각 행에 "승인" 및 "거절" 버튼 포함.
    *   **"처리 완료된 요청" 테이블:** "상태" 열에 "승인됨" 또는 "거절됨" 배지 표시.
    *   빈 상태 메시지.
*   **알림 토스트:** 승인/거절 시 나타나는 임시 알림.
*   **데이터 소스:** `inoutRequestService`를 통해 데이터를 관리하며, 초기에는 더미 데이터로 채워집니다.

### 4.6. 재고 관리 (`app/(main)/inventory/page.tsx`, `components/inventory/inventory-management.tsx`)

*   **역할:** 주요 통계 표시, 재고 항목 나열, 강력한 검색 및 필터링 기능 제공.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레���아웃.
    *   "재고 현황" 제목.
*   **통계 카드:** "총 재고", "입고 대기", "출고 예정", "부족 재고"에 대한 하드코딩된 통계 표시.
*   **재고 목록 카드:**
    *   "재고 목록" 제목과 검색 필터 토글 버튼.
    *   **검색 필터:** "상품명", "카테고리", "위치", "상태"로 필터링 가능한 확장 가능한 필터 섹션. "필터 초기화" 버튼 포함.
    *   **재고 테이블:** "상품명", "카테고리", "수량", "위치", "상태", "마지막 업데이트" 열을 포함. 상태에 따라 색상 배지 사용.
    *   빈 상태 메시지.
    *   **페이지네이션:** 페이지당 10개 항목으로 페이지네이션 제어.
*   **데이터 소스:** 현재 모든 데이터는 컴포넌트 내에 하드코딩된 더미 데이터입니다.

### 4.7. 품목 관리 (`app/(main)/item-list/page.tsx`, `components/item/item-list.tsx`)

*   **역할:** 품목 마스터 데이터 관리, 품목 목록 표시, 검색 및 필터링, 품목 기록 추가, 편집, 삭제.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   "품목 등록" 버튼.
*   **품목 목록 카드:**
    *   "품목 목록" 제목과 검색 필터 토글 버튼.
    *   **검색 필터:** "품목코드", "품목명", "품목그룹", "규격", "바코드"로 필터링 가능한 확장 가능한 필터 섹션.
    *   **품목 테이블:** "품목코드", "품목명", "품목그룹", "규격", "바코드", "입고단가", "출고단가", "관리" 열을 포함. 각 행에 "수정" 및 "삭제" 버튼 포함.
    *   빈 상태 메시지.
*   **품목 등록/수정 모달:**
    *   중앙에 배치된 폼이 있는 전체 화면 오버레이.
    *   `editingItem` 상태에 따라 "품목 수정" 또는 "품목 등록" 제목.
    *   "품목코드"(필수), "품목명"(필수), "품목그룹", "규격", "바코드", "입고단가", "출고단가" 필드.
    *   "등록"/"수정" 및 "취소" 버튼.
*   **데이터 소스:** `itemService`를 통해 데이터를 관리하며, 현재는 로컬 저장소 또는 모의 API를 사용하는 것으로 보입니다.

### 4.8. 알림 센터 (`app/(main)/notifications/page.tsx`, `components/notifications/notification-center.tsx`)

*   **역할:** 다양한 유형의 시스템 알림을 표시하고 관리. 알림 필터링, 읽음으로 표시, 삭제 가능.
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   **헤더:** "알림 센터" 제목, 읽지 않은 알림 수 배지, "모두 읽음" 및 "모두 삭제" 버튼.
*   **통계 카드:** "전체", "정보", "경고", "오류", "성공" 알림 수에 대한 요약 통계 표시.
*   **알림 목록 카드:**
    *   "알림 목록" 제목.
    *   **필터:** 알림 `type` 및 `category`별로 필터링하기 위한 드롭다운.
    *   **알림 항목:**
        *   읽음 상태에 따라 다른 배경색.
        *   알림 `type`에 따른 아이콘.
        *   제목, 유형 배지, 카테고리 배지, 메시지, 타임스탬프 표시.
        *   읽지 않은 알림에 대한 "읽음으로 표시" 버튼.
        *   개별 알림 "삭제" 버튼.
    *   빈 상태 메시지.
*   **데이터 소스:** 현재 모든 데이터는 컴포넌트 내에 하드코딩된 더미 데이터입니다.

### 4.9. 보고서 및 분석 (`app/(main)/reports/page.tsx`, `components/reports/reports-analytics.tsx`)

*   **역할:** 포괄적인 보고 및 분석 대시보드 제공. 다양한 보고서 유형 선택, 날짜 범위 지정, 주요 지표 및 추세 보기. 보고서 내보내기 기능(플레이스홀더).
*   **디자인:**
    *   Shadcn UI `Card` 컴포넌트를 사용한 카드 기반 레이아웃.
    *   **헤더:** "보고서 및 분석" 제목, "PDF 내보내기" 및 "Excel 내보내기" 버튼(현재 `alert`만 표시).
*   **보고서 설정 카드:** "시작��" 및 "종료일" 선택을 위한 날짜 입력 필드.
*   **보고서 유형 선택:** "재고 분석", "입출고 분석", "AGV 성능", "사용자 활동"에 대한 클릭 가능한 카드. 선택 시 강조 표시.
*   **동적 보고서 콘텐츠:** 선택된 보고서 유형에 따라 다른 콘텐츠를 렌더링.
    *   **재고 보고서:** "총 품목 수", "재고 부족", "품절", "총 재고 가치"와 같은 주요 지표 카드. "상위 재고 품목" 목록.
    *   **입출고 보고서:** "총 입고", "총 출고", "완료율", "평균 처리시간"과 같은 주요 지표 카드. "월별 입출고 추이" 차트 플레이스홀더.
    *   **AGV 보고서:** "총 AGV", "활성 AGV", "효율성", "작업 완료율"과 같은 주요 지표 카드. "AGV 성능 지표" 목록. "AGV 상태 분포" 파이 차트 플레이스홀더.
    *   **사용자 보고서:** "총 사용자", "활성 사용자", "로그인율", "평균 세션시간"과 같은 주요 지표 카드.
*   **데이터 소스:** 현재 모든 데이터는 컴포넌트 내에 하드코딩된 더미 데이터입니다.

### 4.10. 일정 관리 (`app/(main)/schedule/page.tsx`, `components/schedule/calendar-header.tsx`, `components/schedule/day-detail-modal.tsx`, `components/schedule/schedule-modal.tsx`)

*   **역할:** 작�� 일정 관리, 캘린더 보기, 오늘의 일정 목록, 새 일정 추가, 특정 날짜 세부 정보 보기.
*   **`schedule/page.tsx` (메인 페이지):**
    *   "일정 관리" 제목, "일정 등록" 버튼.
    *   **작업 캘린더 카드:**
        *   `CalendarHeader`를 사용하여 월 탐색 및 연도/월 선택.
        *   요일 표시.
        *   날짜 그리드: 오늘 날짜 강조, 각 날짜 셀에 최대 2개 일정 제목 표시, 클릭 시 `DayDetailModal` 열기.
    *   **오늘의 작업 일정 카드:** 현재 날짜의 일정 목록 표시.
    *   `ScheduleModal` 및 `DayDetailModal` 통합.
    *   **데이터 소스:** `scheduleService`를 통해 데이터를 관리하며, 현재는 로컬 저장소 또는 모의 API를 사용하는 것으로 보입니다.
*   **`calendar-header.tsx` (캘린더 헤더):**
    *   월 탐색 버튼 (`ChevronLeft`, `ChevronRight`).
    *   드롭다운을 통한 연도 및 월 직접 선택.
    *   연도 드롭다운은 현재 연도를 중심으로 스크롤 조정.
*   **`day-detail-modal.tsx` (일별 상세 모달):**
    *   선택된 날짜의 상세 정보 표시.
    *   "일정", "입고 내역", "출고 내역" 탭 메뉴.
    *   **일정 탭:** 해당 날짜의 일정 목록 표시. 각 일정에 제목, 유형 배지, 장소, 시간, 세부 내용, 삭제 버튼 포함.
    *   **입고/출고 내역 탭:** 현재는 "백엔드 API 연결 후 실제 데이터가 표시됩니다."라는 플레이스홀더.
    *   **데이터 소스:** `scheduleService`를 통해 일정 데이터를 가져오며, 입출고 내역은 플레이스홀더.
*   **`schedule-modal.tsx` (일정 등록 모달):**
    *   새 일정 등록을 위한 폼.
    *   "제목"(필수), "장소", "날짜"(필수, `selectedDate`로 미리 채울 수 있음), "시간"(필수), "유형"(드롭다운), "세부내용" 필드.
    *   "등록" 및 "취소" 버튼.
    *   **데이터 소스:** `scheduleService`를 통해 새 일정을 추가.

L234: ### 4.11. AMR 작동 현황 (`app/(main)/simulation/page.tsx`, `components/simulation/warehouse-simulation.tsx`, `components/simulation/agv-status-modal.tsx`)

*   **역할:** AGV가 있는 창고 환경의 시각적 시뮬레이션 제공. 캔버스 기반 시뮬레이션과 임베디드 웹 뷰의 두 가지 모드 제공. 시뮬레이션 제어 및 상세 AGV 상태 보기.
*   **`simulation/page.tsx` (메인 페이지):**
    *   `WarehouseSimulation` 컴포넌트를 렌더링하는 간단한 컨테이너.
*   **`warehouse-simulation.tsx` (창고 시뮬레이션):**
    *   **헤더:** "AGV 현황" 제목, 상태별 AGV 통계(총계, 대기, 이동 중, 작업 중, 충전 중).
    *   **제어 버튼:** "웹뷰 보기"/"시뮬레이션 보기" 토글, "전체 AGV 상태" 모달 열기, "시작", "정지", "리셋" 버튼(캔버스 모드에서만).
    *   **콘텐츠 영역:**
        *   **웹뷰 모드:** 외부 URL(`https://2hyeoksang.github.io/Web_Build_Test/`)을 가리키는 `iframe`을 표시.
        *   **캔버스 시뮬레이션 모드:**
            *   `canvas` 요소에 창고 레이아웃(구역, 선반, 통로) 및 AGV 그리기.
            *   AGV는 경로, 본체, 방향, 이름, 상태(색상 원)를 표시.
            *   캔버스 클릭 시 선택된 AGV 이동 명령.
            *   시뮬레이션 요소에 대한 범례 및 상태 범례.
    *   `AGVStatusModal` 통합.
    *   **데이터 소스:** `agvSimulation` 서비스에서 AGV 데이터 및 시뮬레이션 로직을 가져옴. `warehouseLayout`은 정적 레이아웃 정의.
*   **`agv-status-modal.tsx` (AGV 상태 모달):**
    *   모든 AGV의 상세 상태 목록 표시.
    *   각 AGV에 대해 이름, 색상, 상태(배지), 배���리 잔량(진행률 표시줄), 위치, 현재 작업 표시.
    *   AGV 카드를 클릭하여 선택/선택 해제 가능. 선택된 AGV는 부모 컴포넌트의 이동 명령에 사용.
    *   **데이터 소스:** 부모 `WarehouseSimulation` 컴포넌트에서 AGV 데이터를 prop으로 전달받음.

## 5. 주요 리팩토링 및 개선 영역

이 애플리케이션은 잘 구성되어 있지만, 실제 운영 환경에서 사용하려면 다음과 같은 주요 개선이 필요합니다.

1.  **백엔드 API 및 데이터베이스 통합 (최우선 과제):**
    *   **현재:** 대부분의 데이터는 프런트엔드에 하드코딩되거나 로컬 저장소 서비스(`@/lib/`)에 의해 시뮬레이션됩니다.
    *   **개선:** 모든 CRUD 작업 및 데이터 검색을 위한 실제 백엔드 API(예: Node.js/Express, Python/FastAPI) 및 영구 데이터베이스(예: PostgreSQL, MongoDB)를 구현해야 합니다.
    *   `companyService`, `itemService`, `inoutRequestService`, `scheduleService`, `agvSimulation` (데이터 부분)을 실제 API 호출로 대체해야 합니다.

2.  **실시간 데이터 처리:**
    *   **현재:** 대시보드, AGV 시뮬레이션, 알림의 실시간 측면은 주로 클라이언트 측에서 시뮬레이션됩니다.
    *   **개선:** WebSocket과 같은 기술을 사용하여 대시보드 지표, AGV 위치/상태, 새 알림에 대한 실제 실시간 업데이트를 구현해야 합니다.

3.  **차트 및 데이터 시각화:**
    *   **현재:** 대시보드 및 보고서 섹션에 차트용 플레이스홀더가 있습니다. `recharts` 라이브러리는 이미 포함되어 있습니다.
    *   **개선:** 백엔드에서 동적 데이터를 가져와 `recharts`를 사용하여 실제 데이터 시각화를 구현해야 합니다.

4.  **보고서 내보내기 기능:**
    *   **현재:** "PDF 내보내기" 및 "Excel 내보내기" 버튼은 현재 `alert` 메시지만 표시합니다.
    *   **개선:** 실제 보고서 생성 및 내보내기 기능을 구현해야 합니다. 이는 백엔드에서 파일을 생성하고 프런트엔드에서 다운로드를 트리거하는 것을 포함할 수 있습니다.

5.  **인증 및 권한 부여 강화:**
    *   **현재:** 기본적인 클라이언트 측 인증만 존재합니다.
    *   **개선:** API 엔드포인트를 보호하고 사용자 역할에 따라 기능 액세스를 제어하기 위해 강력한 서버 측 인증(예: JWT) 및 권한 부여(RBAC)를 구현해야 합니다.

6.  **폼 유효성 검사 개선:**
    *   **현재:** 기본적인 `required` 속성과 `alert` 메시지만 사용됩니다. `react-hook-form` 및 `zod`는 이미 포함되어 있습니다.
    *   **개선:** `react-hook-form` 및 `zod`를 완전히 활용하여 포괄적인 클라이언트 측 유효성 검사를 구현하고, 더 나은 사용자 피드백(예: 인라인 오류 메시지)을 제공해야 합니다. 또한 서버 측 유효성 검사도 필수적입니다.

7.  **코드 품질 및 확장성:**
    *   대대적인 리팩토링은 코드 표준을 검토하고 적용하며, 성능을 최적화하고, 향후 기능 확장을 위한 확장 가능한 아키텍처를 보장할 좋은 기회입니다.
    *   필요한 경우 전역 상태 관리 솔루션(예: Zustand, Jotai) 도입을 고려할 수 있습니다.

---
**수정 이력:**

*   **2025년 7월 10일:** 초기 분석 보고서 작성.
    *   프로젝트 개요, 기술 스택, 실행 방법, 핵심 기능 및 디자인 분석, 주요 리팩토링 및 개선 영역 포함.
