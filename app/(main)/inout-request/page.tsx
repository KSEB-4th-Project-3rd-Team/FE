"use client"

import { useState, useEffect } from "react"
import InOutRequestPage from "@/components/inout/inout-request"
import { InOutRequest as InOutRequestType } from "@/components/utils"

export default function InOutRequest() {
  const [requests, setRequests] = useState<InOutRequestType[]>([])

  useEffect(() => {
    // TODO: Fetch in-out requests from API
    // const fetchedRequests = await fetchRequests();
    // setRequests(fetchedRequests);
  }, [])

  return <InOutRequestPage requests={requests} setRequests={setRequests} />
}
