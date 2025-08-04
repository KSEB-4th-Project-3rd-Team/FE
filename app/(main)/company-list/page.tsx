"use client"

import CompanyList from "@/components/company/company-list"
import { useQueryCompanies } from "@/contexts/query-data-context"

export default function CompanyListPage() {
  const { data: companies, isLoading, error } = useQueryCompanies();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          데이터 로딩 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return <CompanyList initialCompanies={companies || []} />
}
