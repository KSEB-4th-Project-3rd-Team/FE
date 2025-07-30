import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  title = "오류 발생", 
  message, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {message}
          {onRetry && (
            <div className="mt-4">
              <Button onClick={onRetry} variant="outline">
                다시 시도
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
