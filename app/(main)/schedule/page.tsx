import SchedulePageClient from "@/components/schedule/schedule-page-client"
import { fetchSchedules, fetchInOutData } from "@/lib/api"

export default async function SchedulePage() {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [schedules, inOutData] = await Promise.all([
    fetchSchedules(startDate.toISOString(), endDate.toISOString()),
    fetchInOutData()
  ]);

  return <SchedulePageClient initialSchedules={schedules} initialInOutData={inOutData} />
}
