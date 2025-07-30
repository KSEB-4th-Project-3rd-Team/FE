"use client"

import InOutRequestPage from "@/components/inout/inout-request"
import { useData } from "@/contexts/data-context"
import InOutRequestPageSkeleton from "@/components/inout/inout-request-page-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function InOutRequest() {
  const { inOutRequests, loading, error, reloadData } = useData()

  if (loading) return <InOutRequestPageSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={() => reloadData("inOutRequests")} />

  return <InOutRequestPage requests={inOutRequests} setRequests={() => reloadData("inOutRequests")} />
}
