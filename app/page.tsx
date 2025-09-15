import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { TaskManager } from "@/components/task-manager"

export default function HomePage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <TaskManager />
      </div>
    </AuthWrapper>
  )
}
