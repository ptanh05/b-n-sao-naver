import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { TaskManager } from "@/components/features/tasks/task-manager"
import { PWAProvider } from "@/components/features/pwa/pwa-provider"

export default function HomePage() {
  return (
    <PWAProvider>
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <TaskManager />
      </div>
    </AuthWrapper>
    </PWAProvider>
  )
}
