"use client"

import { useState, useEffect } from "react"
import CompanyList from "@/components/company/company-list"
import type { Company } from "@/components/company/company-list"
import { fetchCompanies } from "@/lib/api"

export default function CompanyListPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true)
        const fetchedCompanies = await fetchCompanies();
        setCompanies(fetchedCompanies);
      } catch (err) {
        setError("Failed to load companies.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadCompanies()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <CompanyList companies={companies} setCompanies={setCompanies} />
}
