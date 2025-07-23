"use client"

import { useState, useEffect } from "react"
import InOutRequestPage from "@/components/inout/inout-request"
import { InOutRequest as InOutRequestType } from "@/components/utils"
import { fetchInOutRequests } from "@/lib/api"

export default function InOutRequest() {
  const [requests, setRequests] = useState<InOutRequestType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        const fetchedRequests = await fetchInOutRequests();
        setRequests(fetchedRequests);
      } catch (err) {
        setError("Failed to load in-out requests.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <InOutRequestPage requests={requests} setRequests={setRequests} />
}
