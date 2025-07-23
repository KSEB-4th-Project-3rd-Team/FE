import { Skeleton } from "@/components/ui/skeleton"

export default function CompanyListSkeleton() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-40" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                  <th className="text-center p-3 font-semibold"><Skeleton className="h-5 w-16" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-36" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
