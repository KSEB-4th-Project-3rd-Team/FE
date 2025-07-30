import CompanyList from "@/components/company/company-list"
import { fetchCompanies } from "@/lib/api"

export default async function CompanyListPage() {
  // 서버에서 직접 데이터 페칭
  const companies = await fetchCompanies();

  // 데이터 페칭 실패 시 에러 페이지를 보여줄 수 있습니다. (Next.js 기본 기능)
  // 로딩은 Suspense를 통해 처리할 수 있습니다. (현재는 기본 로딩 UI 사용)

  return <CompanyList initialCompanies={companies} />
}
