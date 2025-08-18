<div align="center">
  <a href="https://your-project-link.com">
    <img src="public/images/optimized/smart-wms-logo.png" alt="Logo" width="80" height="80">
  </a>
  <h1 align="center">KSEB Smart WMS</h1>
  <p align="center">
    Next.js 기반의 스마트 창고 관리 시스템(WMS) 프론트엔드
  </p>
</div>

---

## 📜 프로젝트 소개

**KSEB Smart WMS**는 창고 운영의 모든 과정을 효율적으로 관리하고 자동화하기 위해 설계된 웹 애플리케이션입니다. 재고, 입출고, AMR(자율 이동 로봇) 상태, 작업 일정 등 복잡한 데이터를 직관적인 UI를 통해 실시간으로 파악하고 제어할 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
| :--- | :--- |
| **📊 통합 대시보드** | 재고, 운영 현황, 입출고 분석 등 핵심 지표를 실시간으로 시각화하여 제공합니다. |
| **🚚 입출고 관리** | 입고 및 출고 요청 생성, 처리 상태 추적, 전체 내역 조회 및 강력한 필터링/페이지네이션을 지원합니다. |
| **📦 실시간 재고 관리** | 모든 품목의 재고를 실시간으로 추적하고, 위치 기반으로 관리하며, 재고 상태(정상, 부족, 품절)를 자동 분류합니다. |
| **🗂️ 기준 정보 관리** | 거래처 및 품목 마스터 데이터를 생성(Create), 조회(Read), 수정(Update), 삭제(Delete)할 수 있습니다. |
| **🗓️ 일정 관리** | 캘린더 기반 인터페이스를 통해 입출고, 재고 조사 등 주요 작업 일정을 등록하고 조회합니다. |
| **🔐 사용자 및 인증** | JWT 기반의 안전한 로그인/회원가입 및 사용자 역할에 따른 접근 제어를 지원합니다. |
- **🤖 AMR 상태 모니터링** | 창고 내 AMR의 현재 상태(이동, 충전, 대기, 오류)와 위치를 실시간으로 모니터링합니다. |
| **🔔 알림 및 검색** | 재고 부족, AMR 오류 등 주요 이벤트 발생 시 알림을 보내고, 시스템 전반의 데이터를 빠르게 찾는 전역 검색 기능을 제공합니다. |

---

## 🛠️ 기술 스택

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcn-ui&logoColor=white)

### State Management & Form
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Backend & Database (연동)
![Spring](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

## 🚀 시작하기

### ✅ 사전 준비

- **Node.js:** `v18.x` 이상
- **Package Manager:** `npm` 또는 `pnpm`
- **Backend Server:** 백엔드 서버에서 실행 중이어야 합니다.


## 📂 프로젝트 구조

<details>
<summary><strong>주요 디렉토리 구조 보기</strong></summary>

```
/
├── app/              # Next.js App Router 기반의 페이지 및 레이아웃
│   ├── (main)/       # 메인 레이아웃이 적용되는 페이지 그룹
│   └── ...
├── components/       # 재사용 가능한 UI 컴포넌트 (기능별, UI 요소별 그룹화)
│   ├── ui/           # Shadcn UI 컴포넌트
│   ├── auth/         # 인증 관련 컴포넌트
│   └── ...
├── contexts/         # 전역 상태 관리를 위한 React Context
├── lib/              # 핵심 로직 및 유틸리티
│   ├── api.ts        # 백엔드 API 호출 함수
│   ├── queries.ts    # TanStack Query를 위한 쿼리 키 및 함수
│   └── utils.ts      # 공통 유틸리티 함수
├── public/           # 정적 에셋 (이미지, 폰트 등)
├── styles/           # 전역 스타일시트
├── next.config.mjs   # Next.js 설정 파일 (프록시, 웹팩 최적화 등)
└── package.json      # 프로젝트 의존성 및 스크립트 정의
```

</details>

---

## 🔗 API 및 데이터 흐름

- **API 통신:** 모든 백엔드 API 요청은 `lib/api.ts`에 정의된 함수를 통해 이루어집니다.
- **서버 상태 관리:** `TanStack Query`를 사용하여 서버 데이터를 효율적으로 `fetching`, `caching`, `synchronizing`, `updating` 합니다.
- **API 프록시:** 개발 환경의 CORS 문제를 해결하기 위해 `next.config.mjs`에 API 프록시가 설정되어 있습니다. `/api`로 시작하는 모든 요청은 백엔드 서버로 전달됩니다.
- **API 명세:** 자세한 API 엔드포인트 및 데이터 구조는 `backend_api_spec.md` 문서를 참고하세요.


