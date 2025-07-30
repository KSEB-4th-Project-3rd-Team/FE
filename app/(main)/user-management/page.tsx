"use client"

import UserManagement from "@/components/admin/user-management"
import { useData } from "@/contexts/data-context"
import UserManagementSkeleton from "@/components/admin/user-management-skeleton"
import ErrorMessage from "@/components/ui/error-message"
import { User } from "@/app/(main)/layout"

export default function UserManagementPage() {
  const { users, loading, error, reloadData } = useData()

  if (loading) return <UserManagementSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={() => reloadData("users")} />

  // The setUsers prop expects a function that takes the current users and returns the new users.
  // Since we are refetching, we can just pass a function that calls reloadData.
  // However, to match the expected type for now, we'll keep it simple.
  // A better approach might be to refactor UserManagement to accept a reload function directly.
  const handleSetUsers = () => {
    reloadData("users");
  };

  return <UserManagement users={users} setUsers={handleSetUsers as any} />
}
