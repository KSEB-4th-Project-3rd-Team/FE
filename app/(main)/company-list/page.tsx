"use client"

import { useState, useEffect } from "react"
import CompanyList from "@/components/company/company-list"
import type { Company } from "@/components/company/company-list"

export default function CompanyListPage() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    // TODO: Fetch companies from API
    // const fetchedCompanies = await fetchCompanies();
    // setCompanies(fetchedCompanies);
  }, [])

  return <CompanyList companies={companies} setCompanies={setCompanies} />
}
