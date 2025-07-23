"use client"

import { useState, useEffect } from "react"
import UserManagement from "@/components/admin/user-management"
import { User } from "@/app/(main)/layout"
import { fetchUsers } from "@/lib/api"

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError("Failed to load users.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <UserManagement users={users} setUsers={setUsers} />
}
