import { Skeleton } from "@/components/ui/skeleton"

export default function UserManagementSkeleton() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-48" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                  <th className="text-center p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                  <th className="text-left p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                  <th className="text-center p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-5 w-20 mx-auto" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-3 text-center"><div className="flex items-center justify-center gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
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
