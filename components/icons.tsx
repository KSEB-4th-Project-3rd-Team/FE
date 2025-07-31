export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 ${className}`} />
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Spinner className={className} />
}

export const Icons = {
  Spinner,
  LoadingSpinner
}