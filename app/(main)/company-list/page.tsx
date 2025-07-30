"use client"

import CompanyList from "@/components/company/company-list"
import { useData } from "@/contexts/data-context"
import CompanyListSkeleton from "@/components/company/company-list-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function CompanyListPage() {
  const { companies, loading, error, reloadData } = useData()

  if (loading) return <CompanyListSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={() => reloadData("companies")} />

  return <CompanyList companies={companies} setCompanies={() => reloadData("companies")} />
}
