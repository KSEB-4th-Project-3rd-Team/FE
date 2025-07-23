import { Skeleton } from "@/components/ui/skeleton"

export default function SchedulePageSkeleton() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6">
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-0 mb-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-8 flex items-center justify-center">
                  <Skeleton className="h-5 w-8" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="h-24 border border-gray-200 p-1">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-3 w-16 mt-2" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
