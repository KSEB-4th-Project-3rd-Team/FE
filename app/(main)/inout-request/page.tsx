import InOutRequestPage from "@/components/inout/inout-request"
import { fetchInOutRequests } from "@/lib/api"

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InOutRequest() {
  const inOutRequests = await fetchInOutRequests();

  return <InOutRequestPage initialRequests={inOutRequests} />
}
