"use client"

import { useState, useCallback } from "react"
import { api, endpoints } from "@/lib/api"
import type { Task } from "@/lib/types"

export interface SyncConflict {
  local: Task
  remote: Task
  type: "both_modified" | "local_deleted" | "remote_deleted"
}

export interface SyncResult {
  success: boolean
  conflicts: SyncConflict[]
  synced: number
  errors: string[]
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncLogs, setSyncLogs] = useState<any[]>([])

  const loadSyncLogs = useCallback(async () => {
    try {
      const logs = await api.get<any[]>(endpoints.syncLogs)
      setSyncLogs(logs)
    } catch {
      setSyncLogs([])
    }
  }, [])

  const syncTasks = useCallback(
    async (localTasks: Task[], remoteTasks: Task[]): Promise<SyncResult> => {
      setIsSyncing(true)
      const conflicts: SyncConflict[] = []
      const errors: string[] = []
      let synced = 0

      try {
        // Create maps for quick lookup
        const localMap = new Map(localTasks.map((t) => [t.id, t]))
        const remoteMap = new Map(remoteTasks.map((t) => [t.id, t]))

        // Find conflicts
        for (const localTask of localTasks) {
          const remoteTask = remoteMap.get(localTask.id)
          if (remoteTask) {
            const localUpdated = new Date(localTask.updatedAt)
            const remoteUpdated = new Date(remoteTask.updatedAt)

            // Both modified - conflict
            if (localUpdated.getTime() !== remoteUpdated.getTime()) {
              conflicts.push({
                local: localTask,
                remote: remoteTask,
                type: "both_modified",
              })
            }
          }
        }

        // Check for deleted items
        for (const remoteTask of remoteTasks) {
          if (!localMap.has(remoteTask.id)) {
            // Remote has task that local doesn't - might be deleted locally
            conflicts.push({
              local: remoteTask, // Use remote as local for deleted
              remote: remoteTask,
              type: "local_deleted",
            })
          }
        }

        for (const localTask of localTasks) {
          if (!remoteMap.has(localTask.id)) {
            // Local has task that remote doesn't - might be deleted remotely
            conflicts.push({
              local: localTask,
              remote: localTask, // Use local as remote for deleted
              type: "remote_deleted",
            })
          }
        }

        // Log sync attempt
        await api.post(endpoints.syncLogs, {
          status: conflicts.length > 0 ? "conflict" : "success",
          details: JSON.stringify({
            conflicts: conflicts.length,
            synced,
            timestamp: new Date().toISOString(),
          }),
        })

        setLastSyncTime(new Date())
        synced = localTasks.length + remoteTasks.length - conflicts.length

        return {
          success: true,
          conflicts,
          synced,
          errors,
        }
      } catch (error: any) {
        errors.push(error.message || "Sync failed")
        await api.post(endpoints.syncLogs, {
          status: "error",
          details: JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString(),
          }),
        })

        return {
          success: false,
          conflicts,
          synced,
          errors,
        }
      } finally {
        setIsSyncing(false)
      }
    },
    []
  )

  const resolveConflict = useCallback(
    async (
      conflict: SyncConflict,
      resolution: "local" | "remote" | "merge"
    ): Promise<boolean> => {
      try {
        if (resolution === "local") {
          // Use local version
          await api.put(endpoints.task(conflict.local.id), conflict.local)
        } else if (resolution === "remote") {
          // Use remote version
          await api.put(endpoints.task(conflict.remote.id), conflict.remote)
        } else if (resolution === "merge") {
          // Merge: use most recent updated_at, combine fields
          const merged: Task = {
            ...conflict.local,
            ...conflict.remote,
            updatedAt: new Date(),
            // Keep local if it's more recent, otherwise use remote
            ...(new Date(conflict.local.updatedAt) > new Date(conflict.remote.updatedAt)
              ? conflict.local
              : conflict.remote),
          }
          await api.put(endpoints.task(merged.id), merged)
        }

        await api.post(endpoints.syncLogs, {
          status: "resolved",
          details: JSON.stringify({
            conflictId: conflict.local.id,
            resolution,
            timestamp: new Date().toISOString(),
          }),
        })

        return true
      } catch {
        return false
      }
    },
    []
  )

  return {
    isSyncing,
    lastSyncTime,
    syncLogs,
    syncTasks,
    resolveConflict,
    loadSyncLogs,
  }
}

