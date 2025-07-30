import InOutRequestPage from "@/components/inout/inout-request"
import { fetchInOutRequests } from "@/lib/api"

export default async function InOutRequest() {
  const inOutRequests = await fetchInOutRequests();

  return <InOutRequestPage initialRequests={inOutRequests} />
}
