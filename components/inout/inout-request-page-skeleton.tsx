import { Skeleton } from "@/components/ui/skeleton"

export default function InOutRequestPageSkeleton() {
  const SkeletonCard = () => (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-16" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-48" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-16" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-24" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-32" /></th>
                <th className="p-3 font-semibold"><Skeleton className="h-5 w-20" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3"><Skeleton className="h-5 w-14" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-44" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-12" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="p-3"><div className="flex gap-2 justify-center"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
